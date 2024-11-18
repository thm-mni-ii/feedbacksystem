import { JwtPayload } from "jsonwebtoken";
import { checkQuestionAccess, getCurrentSession, getStudentCourseRoles} from "../utils/utils";
import { connect } from "../mongo/mongo";
import { AnswerScore, SessionStatus } from "../utils/enum";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import QuestionType from "../enums/QuestionType";
import FillInTheBlanks from "../model/questionTypes/FillInTheBlanks";
import Choice from "../model/questionTypes/Choice";

interface FillInTheBlanksAnswer {
    text: string,
    order: number
}
interface FillInTheBlanksResponse {
    score: number,
    texts: FillInTheBlanksIndividual[]
}

interface FillInTheBlanksIndividual {
    text: string,
    order: number,
    correct: boolean
}


interface entry  {
    text: string,
    id: number
}

interface ChoiceAnswer {
    id: number,
    text: string
    entries: entry[]
}

interface entry {
    id: number,
    text: string
}

interface ChoiceReply {
    score: number,
    row: ChoiceReplyRow[]
}

interface ChoiceReplyRow {
    id:number,
    text: string,
    entries: entry[],
    correct: number[]
}

export async function submitSessionAnswer(tokenData: JwtPayload, requestData: any) {
    const session = await getCurrentSession(tokenData.id);
    console.log(session);
    if(session == null || session == undefined) {
        return -1;
    }
    const submitResult = await submit(tokenData, requestData, session);
    return submitResult;
}

export async function submit(tokenData: JwtPayload, requestData: any, session: string) {
    const userCourses = getStudentCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const submissionCollection: mongoDB.Collection = database.collection("submission");
    const timestamp = Date.now();
    const questionId = new mongoDB.ObjectId(requestData.questionId);
    const catalog = await checkQuestionAccess(questionId, userCourses, 
                                              catalogInCourseCollection, catalogCollection);
    if(catalog === false) {
        return -1;
    }
    const correct = await checkAnswer(requestData.answers, questionId, questionCollection);
    console.log(timestamp);
    let sessionObject: any = "";
    if(session !== "") {
        sessionObject = new mongoDB.ObjectId(session);
    }
    const submission = {
        user: tokenData.id,
        question: questionId,
        answer: requestData.answers,
        evaluation: correct,
        timeStamp: timestamp,
        session: sessionObject
    }
    await submissionCollection.insertOne(submission);
    return correct;
}

async function checkAnswer(answer: any, questionId: mongoDB.ObjectId,
                           questionCollection: mongoDB.Collection) {
    console.log(answer);
    const questionQuery = {
        _id: questionId
    }
    console.log("questionQuery");   
    console.log(questionQuery);

    const result: any  = await questionCollection.findOne(questionQuery);
    console.log(result);
    if(result === null) {
        return -1;
    }
    if(result !== null) {
        const question: Question = result as Question;
        const correct = checkSubmission(answer, question); 
        return correct;
    }
}

function checkSubmission(answer: any, question: Question) {
    const questionType = question.questiontype;
    console.log("VIBE-CHECK");
    console.log(answer);
    console.log(questionType);
    console.log(QuestionType.FillInTheBlanks);
    console.log(QuestionType.Choice);
    if(questionType == QuestionType.Choice) {
        return checkChoice(answer, question);
    } else if(questionType == QuestionType.FillInTheBlanks) {
        return checkClozeText(answer as FillInTheBlanksAnswer[], question);
    } else if(questionType == QuestionType.SQL) {
        return checkSQL(answer, question);
    } else {
        return AnswerScore.incorrect;
    }
}

function checkSQL(answer: any, question: Question) {
    return 0;
}

function checkChoice(answer: ChoiceAnswer[], question: Question) {
    let correctAnswers = 0;
    let falseAnswers = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    const configuration = question.questionconfiguration as Choice;
    const answerRows: number[][] = getSelectedIds(answer);
    let response: ChoiceReply = {} as ChoiceReply;
    console.log(configuration);
    for(let i = 0; i < configuration.optionRows.length; i++) {
        const correctList = configuration.optionRows[i].correctAnswers;
        const answerList = answerRows[i];
        const result = compareNumberLists(correctList, answerList);
        let replyRow: ChoiceReplyRow = {} as ChoiceReplyRow;
        replyRow.id = configuration.optionRows[i].id;
        replyRow.text = configuration.optionRows[i].text;
        replyRow.correct = result.inBothLists;
        response.row[response.row.length] = replyRow;
        console.log(result);
        correctAnswers += result.inBothLists.length;
        falseAnswers += result.onlyInList1.length + result.onlyInList2.length;
        falsePositives += result.onlyInList2.length;
        falseNegatives += result.onlyInList1.length;
    }
    console.log(`falseAnswers: ${falseAnswers}`);
    console.log(`correctAnswers: ${correctAnswers}`);
    console.log(`falsePositives: ${falsePositives}`);
    console.log(`falseNegatives: ${falseNegatives}`);
    const score = correctAnswers / (correctAnswers + falseAnswers);
    response.score = score;
    console.log(score);
    return response;
}

function createResponse() {

}

function getSelectedIds(answer: ChoiceAnswer[]) {
    let result: number[][] = [];
    for(let i = 0; i < answer.length; i++) {
        result[answer[i].id] = [];
        for(let j = 0; j < answer[i].entries.length; j++) {
            result[answer[i].id][j] = (answer[i].entries[j].id);
        }
    }
    console.log(result);
    return result;
}

function compareNumberLists(list1: number[], list2: number[]) {
    const inBothLists = list1.filter(num => list2.includes(num));
    const onlyInList1 = list1.filter(num => !list2.includes(num));
    const onlyInList2 = list2.filter(num => !list1.includes(num));
    return {
        inBothLists,
        onlyInList1,
        onlyInList2
    };
}

function checkClozeText(answer: FillInTheBlanksAnswer[], question: Question) {
    let blankFields = [];
    let numberOfCorrectAnswers = 0;
    let FillInTheBlanksResponse: FillInTheBlanksResponse = {} as FillInTheBlanksResponse;
    const configuration = question.questionconfiguration as FillInTheBlanks;
    for(let i = 0; i < configuration.textParts.length; i++) {
        if(configuration.textParts[i].isBlank === true) {
            blankFields.push(configuration.textParts[i]);
        }
    }

    for(let j = 0; j < blankFields.length; j++) {
        const res = checkSingleWord(answer, blankFields[j]);
        FillInTheBlanksResponse.texts.push(res);
        if(res.correct) {
            numberOfCorrectAnswers++;

        }
    }

    const score: number = numberOfCorrectAnswers / blankFields.length;
    FillInTheBlanksResponse.score = score;
    return FillInTheBlanksResponse;
}

function checkSingleWord(answer: FillInTheBlanksAnswer[], blankFields: any) {
    let evaluation: FillInTheBlanksIndividual = {} as FillInTheBlanksIndividual;
    for(let k = 0; k < answer.length; k++) {
        console.log(answer[k]);
        if(answer[k].text === blankFields.text && answer[k].order === blankFields.order) {
            evaluation.text = answer[k].text;
            evaluation.order = answer[k].order;
            evaluation.correct = true;
            return evaluation;
        }
        if(answer[k].order === blankFields.order) {
            evaluation.text = answer[k].text;
            evaluation.order = answer[k].order;
            evaluation.correct = false;
            return evaluation;
        }
    }
    return evaluation;
}

async function findFirstFalseAnswerInSession(tokenData: JwtPayload, catalog: string, course: string) {
    const id = tokenData.id;
    const catalogIdOject: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const courseIdOject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = await database.collection("session");
    const submissionCollection: mongoDB.Collection = await database.collection("submission");
    const request = {
        course: courseIdOject,
        catalog: catalogIdOject,
        user: id,
        status: SessionStatus.ongoing
    }
    const session = await sessionCollection.findOne(request);
    console.log(session);
    if(session === null) {
        return -1;
    }
    const falseSubmissionRequest = {
        session: session._id,
        evaluation: false
    }
    const falseAnswers: any[] = await submissionCollection.find(falseSubmissionRequest).toArray();
    console.log(falseAnswers);

}

