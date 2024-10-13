import { JwtPayload } from "jsonwebtoken";
import { checkQuestionAccess, getCurrentSession, getUserCourseRoles} from "../utils/utils";
import { connect } from "../mongo/mongo";
import { AnswerScore } from "../utils/enum";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import QuestionType from "../enums/QuestionType";
import FillInTheBlanks from "../model/questionTypes/FillInTheBlanks";
import Choice from "../model/questionTypes/Choice";

interface FillInTheBlanksAnswer {
    text: string,
    order: number
}

interface entry  {
    text: string,
    id: number
}

interface ChoiceAnswer {
    rows: entry[],
    columns: entry[],
    matrix: number[][]
}

export async function submitSessionAnswer(tokenData: JwtPayload, requestData: any) {
    const session = await getCurrentSession(tokenData.id);
    console.log(session);
    if(session == null || session == undefined) {
        return -1;
    }
    const submitResult = await submit(tokenData, requestData);
    return submitResult;
}

export async function submit(tokenData: JwtPayload, requestData: any) {
    const userCourses = getUserCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const submissionCollection: mongoDB.Collection = database.collection("submission");
    const timestamp = Date.now();
    const questionId = new mongoDB.ObjectId(requestData.question);
    const catalog = await checkQuestionAccess(questionId, userCourses, 
                                              catalogInCourseCollection, catalogCollection);
    if(catalog === false) {
        return -1;
    }
    console.log("----------------------");
    console.log(requestData.answers);
    console.log("----------------------");
    const correct = await checkAnswer(requestData.answers, questionId, questionCollection);
    console.log(timestamp);
    const submission = {
        user: tokenData.id,
        question: questionId,
        answer: requestData.answers,
        evaluation: correct,
        timeStamp: timestamp
    }
    submissionCollection.insertOne(submission);
    return correct;
}

async function checkAnswer(answer: any, questionId: mongoDB.ObjectId,
                           questionCollection: mongoDB.Collection) {
    console.log(answer);
    const questionQuery = {
        _id: questionId
    }
    const result: any  = await questionCollection.findOne(questionQuery);
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

function checkChoice(answer: ChoiceAnswer, question: Question) {
    console.log(answer);
    let rows: number[] = [];
    for(let i = 0; i < answer.rows.length; i++) {
        rows.push(answer.rows[i].id);
    }
    let columns: number[] = [];
    for(let i = 0; i < answer.columns.length; i++) {
        columns.push(answer.columns[i].id);
    }
    const newMatrix = orderRows(answer.matrix, rows); 
    const newMatrix2 = orderColumns(newMatrix, columns);
    console.log(newMatrix2);
    const configuration = question.questionconfiguration as Choice;
    const answerColumns = configuration.answerColumns;
    let correctAnswers = 0;
    let falseAnswers = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    for(let i = 0; i < answerColumns.length; i++) {
        for(let j = 0; j < newMatrix2[i].length; j++) {
            console.log(`richtige Antworten: ${answerColumns[i].correctAnswers}`);
            if(newMatrix2[i][j] === 1) {
                console.log(`${j} ist wahr`);
                if(answerColumns[i].correctAnswers.includes(j)) {
                    console.log("correct");
                    correctAnswers++;
                } else {
                    console.log("incorrect");
                    falseAnswers++;
                    falsePositives++;
                }
            } else {
                console.log(`${j} ist falsch`);
                if(answerColumns[i].correctAnswers.includes(j)) {
                    console.log("incorrect");
                    falseAnswers++;
                    falseNegatives++;
                } else {
                    console.log("correct");
                    correctAnswers++;
                }
            }
        }
    }
    console.log(`falseAnswers: ${falseAnswers}`);
    console.log(`correctAnswers: ${correctAnswers}`);
    console.log(`falsePositives: ${falsePositives}`);
    console.log(`falseNegatives: ${falseNegatives}`);
    const score = correctAnswers / (correctAnswers + falseAnswers);
    console.log(score);
    if(falseAnswers === 0 ) {
        return AnswerScore.correct;
    }
    return AnswerScore.incorrect;
}
 
function orderRows(matrix: number[][], order: number[]) {
    let newMatrix2: number[][] = [];
    for(let i = 0; i < order.length; i++) {
        newMatrix2[order[i] - 1] = (matrix[i]);
    }
    return newMatrix2;
}

function orderColumns(matrix: number[][], order: number[]) {
    let newMatrix: number[][] = JSON.parse(JSON.stringify(matrix));
    for(let i = 0; i < order.length; i++) {
       for(let j = 0; j < matrix.length; j++) {
           console.log(matrix);
            newMatrix[j][order[i]-1] = matrix[j][i]; 
       }
    }
    return newMatrix;
}

function checkClozeText(answer: FillInTheBlanksAnswer[], question: Question) {
    console.log("---------------------------------------------------------------------------------------------------------------------");
    console.log(answer);
    console.log("---------------------------------------------------------------------------------------------------------------------");
    let blankFields = [];
    let results = [];
    let numberOfCorrectAnswers = 0;
    const configuration = question.questionconfiguration as FillInTheBlanks;
    console.log(configuration.textParts);
    console.log(question);
    for(let i = 0; i < configuration.textParts.length; i++) {
        if(configuration.textParts[i].isBlank === true) {
            blankFields.push(configuration.textParts[i]);
        }
    }
    console.log("blankFields");
    console.log(blankFields);
    for(let j = 0; j < blankFields.length; j++) {
        const res = checkSingleWord(answer, blankFields[j]);
        if(res) {
            numberOfCorrectAnswers++;
        }
        results.push(res);
    }
    console.log(results);
    console.log(numberOfCorrectAnswers);
    const score: number = numberOfCorrectAnswers / results.length;
    console.log(score);
    if(results.length === numberOfCorrectAnswers) {
        return true;
    }
    return false;
}

function checkSingleWord(answer: FillInTheBlanksAnswer[], blankFields: any) {
    console.log("ANFANG");
    console.log(answer);
    console.log(blankFields);
    for(let k = 0; k < answer.length; k++) {
        console.log(answer[k]);
        if(answer[k].text === blankFields.text && answer[k].order === blankFields.order) {
            return true;
        }
    }
    return false;
}

function findFirstFalseAnswerInSession(tokenData: JwtPayload, catalog: string, course: string) {

}