import { JwtPayload } from "jsonwebtoken";
import { checkQuestionAccess, getCurrentSession, getUserCourseRoles} from "../utils/utils";
import { connect } from "../mongo/mongo";
import { AnswerScore } from "../utils/enum";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import QuestionType from "../enums/QuestionType";
import FillInTheBlanks from "../model/questionTypes/FillInTheBlanks";

export async function submitSessionAnswer(tokenData: JwtPayload, requestData: any) {
    const session = getCurrentSession(tokenData.user);
    return -1;

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
    const correct = await checkAnswer(requestData, questionId, questionCollection);
    const submission = {
        user: tokenData.id,
        question: questionId,
        answer: requestData.answer,
        evaluation: correct,
        timeStamp: timestamp
    }
    submissionCollection.insertOne(submission);
    return correct;
}

async function checkAnswer(answer: any[], questionId: mongoDB.ObjectId,
                           questionCollection: mongoDB.Collection) {
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

function checkSubmission(answer: any[], question: Question) {
    const questionType = question.questiontype;
    if(questionType == QuestionType.Choice) {
        return checkChoice(answer[0], question);
    } else if(questionType == QuestionType.FillInTheBlanks) {
        return checkClozeText(answer, question as FillInTheBlanks);
    } else if(questionType == QuestionType.SQL) {
        return checkSQL(answer, question);
    } else {
        return AnswerScore.incorrect;
    }
}

function checkSQL(answer: any, question: Question) {
    return 0;
}

function checkChoice(answer: any, question: any) {
    for(let i = 0; i < question.answers.length; i++) {
        if(question.answers[i].text == answer) {
            if( question.answers[i].isCorrect) {
                return AnswerScore.correct;
            } else {
                return AnswerScore.incorrect
            }
        }
    }
    return AnswerScore.correct;
}

function checkMultipleChoice(answer: any[], question: any) {
    let correctInQuestion = 0;
    let correctInAnswer = 0;
    for(let j = 0;j < question.answers.length; j++) {
        if(!question.answers[j].isCorrect) {
            continue;
        }
        correctInQuestion++;
        for(let i = 0; i < answer.length; i++) {
           if(question.answers[j].text == answer[i]) {
               correctInAnswer++;
               break;
           }
        }
    }
    if(correctInAnswer === correctInQuestion) {
        return AnswerScore.correct;
    } else {
        return AnswerScore.incorrect;
    }
}

function checkClozeText(answer: any[], question: FillInTheBlanks) {
    let blankFields = [];
    let results = [];
    let numberOfCorrectAnswers = 0;
    for(let i = 0; i < question.textParts.length; i++) {
        if(question.textParts[i].isBlank === true) {
            blankFields.push(question.textParts[i]);
        }
    }
    for(let j = 0; j < blankFields.length; j++) {
        const res = checkSingleWord(answer, blankFields[j]);
        if(res) {
            numberOfCorrectAnswers++;
        }
        results.push(res);
    }
    console.log(results);
    console.log(numberOfCorrectAnswers);
}

function checkSingleWord(answer: any[], blankFields: any) {
    for(let k = 0; k < answer.length; k++) {
        if(answer[k].text === blankFields.text) {
            return true;
        }
    }
    return false;
}
