import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";
import { SessionStatus } from "./enum";

interface ReturnQuestion {
    id: mongoDB.ObjectId;
    questiontext: string;
    questiontype: string;
    answers: string[]; // Array of strings for hobbies
}

export async function checkQuestionAccess(questionIdObject: mongoDB.ObjectId, adminCourses: number[],
                                  catalogInCourseCollection: mongoDB.Collection, questionInCatalogCollection: mongoDB.Collection) {
    const allCatalogs: any = await getAllCatalogs(adminCourses, catalogInCourseCollection);
    const catalogIds: mongoDB.ObjectId[] = [];
    for (let index = 0; index < allCatalogs.length; index++) {
        catalogIds.push(new mongoDB.ObjectId(allCatalogs[index]));
    }
    const ownCatalogQuery = {
        question: questionIdObject,
        catalog : {$in : catalogIds}
    }
    console.log(ownCatalogQuery);
    const catalogWithQuestion = await questionInCatalogCollection.findOne(ownCatalogQuery);
    console.log(catalogWithQuestion);
    if (catalogWithQuestion == null) {
        return false;
    } 
    return true;
}

export async function getAllCatalogs(courses: number[], catalogInCourseCollection: mongoDB.Collection) {
    const courseQuery = {
        courseId: {$in: courses}
    }
    const catalogs = await catalogInCourseCollection.find(courseQuery).toArray();
    const allCatalogs: string[] = [];

    catalogs.forEach(obj => {
        obj.catalogs.forEach((catalog: string) => {
            allCatalogs.push(catalog);
        });
    });
    return allCatalogs;
}

export function getAdminCourseRoles(tokenData: JwtPayload) {
    let coursesAdmin: number[] = [];
    const courseRolesObject = JSON.parse(tokenData.courseRoles);
    for (const courseId in courseRolesObject) {
        if (courseRolesObject.hasOwnProperty(courseId)) {
            const role = courseRolesObject[courseId];
            if(role == "TUTOR" || role == "DOCENT") {
                coursesAdmin.push(parseInt(courseId));
        }
      }
    }
    return coursesAdmin;
}

export function getElementFromArray(array: mongoDB.ObjectId[], element: mongoDB.ObjectId) {
    let index = -1;
    for( let i = 0; i < array.length; i++) {
        if( JSON.stringify(array[i]) == JSON.stringify(element)) {
            index = i;
            break;
        }
    }
    return index; 
}

export async function getCatalogPermission(adminCourses: number[], catalog: string) {
    const database: mongoDB.Db = await connect();
    const catalogId: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const courseQuery = {
        course: {$in: adminCourses},
        catalog: catalogId
    }
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const courseResult = await catalogInCourseCollection.findOne(courseQuery);
    if( courseResult != null) {
        return true;
    }
    return false;
}

export function getUserCourseRoles(tokenData: JwtPayload) {
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

export async function getFirstQuestionInCatalog(questionCollection: mongoDB.Collection, questionInCatalogCollection: mongoDB.Collection, catalogId: string) {
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const allQuestionsInCatalogQuery = {
        catalog: catalogIdObject
    }
    const allQuestionsInCatalog = await questionInCatalogCollection.find(allQuestionsInCatalogQuery).toArray();
    console.log("All Question In Cataolg");
    console.log(allQuestionsInCatalog);
    let usedQuestion: mongoDB.ObjectId[] = [];
    for(let i = 0;i < allQuestionsInCatalog.length; i++) {
        for( const key in allQuestionsInCatalog[i].children) {
            usedQuestion = addIfNotInList(usedQuestion, allQuestionsInCatalog[i].children[key]);
        }
    }
    console.log("usedQuestion");
    console.log(usedQuestion);
    const findFirstQuestion = {
        question: {$nin: usedQuestion},
        catalog: catalogIdObject
    }
    const firstQuestion = await questionInCatalogCollection.findOne(findFirstQuestion);
    if( firstQuestion == null || firstQuestion.length == 0) {
        return -1;
    }
    const firstQuestionQuery = {
        _id: firstQuestion.question
    }
    const firstQuestionData = await questionCollection.findOne(firstQuestionQuery);
    return firstQuestionData;
}

function addIfNotInList(list: mongoDB.ObjectId[], entry: mongoDB.ObjectId) {
    const exists = list.some(existingItem => existingItem === entry);
    if(!exists) {
        list.push(entry);
    }
    return list;
}

export async function getAllQuestionsFromCatalogs(questionInCatalogCollection: mongoDB.Collection, catalogs: string[]) {
    const catalogIds: mongoDB.ObjectId[] = [];
    for (let index = 0; index < catalogs.length; index++) {
        catalogIds.push(new mongoDB.ObjectId(catalogs[index]));
    }
    const findQuestions = {
        catalog: {$in: catalogIds}
    }
    const accesibaleQuestions = await questionInCatalogCollection.find(findQuestions).toArray();
    return accesibaleQuestions;
}

export function createQuestionResponse(newQuestion: any) {
    console.log(newQuestion);
    const returnQuestion: ReturnQuestion = {
        id: newQuestion._id,
        questiontext: newQuestion.questiontext,
        questiontype: newQuestion.questiontype,
        answers: []
    }
    for(let i = 0; i < newQuestion.answers.length; i++) {
        returnQuestion.answers.push(newQuestion.answers[i].text);
    }
    return returnQuestion;
}


export async function getAllQuestionInCatalog(questionInCatalogCollection: mongoDB.Collection, questionCollection: mongoDB.Collection, catalogId: string) {
    const connectionQuery = {
        catalog: new mongoDB.ObjectId(catalogId)
    }
    const connections = await questionInCatalogCollection.find(connectionQuery).toArray();
    let questionIds: mongoDB.ObjectId[] = [];
    for(let i = 0; i < connections.length; i++) {
        questionIds.push(connections[i].question);
    }
    console.log("QUESTION IDS");
    console.log(questionIds);
    if(questionIds == null) {
        return -1;
    }
    const allQuestionsQuery = {
        _id: {$in: questionIds}
    }
    console.log("All Questions");
    const allQuestions = await questionCollection.find(allQuestionsQuery).toArray();
    console.log(allQuestions);
    return allQuestions
}

export async function getCurrentSession(user: number) {
    const query = {
        id: user,
        status: SessionStatus.ongoing
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result: any = sessionCollection.find(query).sort({ date: -1 }).limit(1).toArray();
    return result[0];
}
