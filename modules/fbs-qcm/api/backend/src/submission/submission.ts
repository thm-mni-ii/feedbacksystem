import { JwtPayload } from "jsonwebtoken";
import { getAdminCourseRoles, checkQuestionAccess } from "../utils/utils";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function submit(tokenData: JwtPayload, requestData: any) {
    const userCourses = getUserCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const submissionCollection: mongoDB.Collection = database.collection("submission");
    const timestamp = Date.now();
    const questionId = new mongoDB.ObjectId(requestData.question);
    const catalog = await checkQuestionAccess(questionId, userCourses, 
                                              courseCollection, catalogCollection);
    if(catalog == null || catalog.length === 0) {
        return -1;
    }
    const correct = await checkAnswer(requestData.answer, questionId, questionCollection);
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

function getUserCourseRoles(tokenData: JwtPayload) {
    let coursesUser: number[] = [];
    const courseRolesObject = JSON.parse(tokenData.courseRoles);
    for (const courseId in courseRolesObject) {
        if (courseRolesObject.hasOwnProperty(courseId)) {
            const role = courseRolesObject[courseId];
            if(role == "STUDENT") {
                coursesUser.push(parseInt(courseId));
        }
      }
    }
    return coursesUser;
}

async function checkAnswer(answer: any[], questionId: mongoDB.ObjectId,
                           questionCollection: mongoDB.Collection) {
    const questionQuery = {
        _id: questionId
    }
    const question = await questionCollection.findOne(questionQuery);
    const correct = checkSubmission(answer, question); 
    return correct;
}

function checkSubmission(answer: any[], question: any) {
    const questionType = question.questiontype;
    if(questionType == "Single-Choice") {
        return checkSingleChoice(answer[0], question);
    } else if(questionType == "Multiple-Choice") {
        return checkMultipleChoice(answer, question);
    } else if(questionType == "Clozetext") {
        return checkClozeText(answer, question);
    } else {
        return false;
    }
}

function checkSingleChoice(answer: any, question: any) {
    for(let i = 0; i < question.answers.length; i++) {
        if(question.answers[i].text == answer) {
            return question.answers[i].isCorrect;
        }
    }
    return false;
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
        return true;
    } else {
        return false;
    }
}

function checkClozeText(answer: any[], question: any) {
    let correctInQuestion = 0;
    let correctInAnswer = 0;
    for(let i = 0;i < question.answers.length; i++) {
        if(question.answers[i].isCorrect) {
            correctInQuestion++;
        }
    }
    for(let i = 0;i < answer.length; i++) {
        for(let j = 0; j < question.answers.length; j++) {
            if(question.answers[j].text == answer[i] && question.answers[j].position === i + 1) {
                correctInAnswer++;
            }
        }
    }
    if(correctInAnswer === correctInQuestion) {
        return true;
    } else {
        return false;
    }
}
