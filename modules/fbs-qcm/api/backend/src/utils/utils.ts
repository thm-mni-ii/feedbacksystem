import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function checkQuestionAccess(questionIdObject: mongoDB.ObjectId, adminCourses: number[],
                                  courseCollection: mongoDB.Collection, questionInCatalogCollection: mongoDB.Collection) {
    const allCatalogs: any = await getAllCatalogs(adminCourses, courseCollection);
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
    return catalogWithQuestion;
}

export async function getAllCatalogs(courses: number[], courseCollection: mongoDB.Collection) {
    const courseQuery = {
        courseId: {$in: courses}
    }
    const catalogs = await courseCollection.find(courseQuery).toArray();
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
        courseId: {$in: adminCourses},
        catalogs: catalogId
    }
    console.log("courseQuery");
    console.log(courseQuery);
    const courseCollection: mongoDB.Collection = database.collection("course");
    const courseResult = await courseCollection.findOne(courseQuery);
    if( courseResult != null && courseResult.length > 0) {
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
        _id: {$nin: usedQuestion}
    }
    const firstQuestion = await questionCollection.findOne(findFirstQuestion);
    console.log("firstQuestion");
    console.log(firstQuestion);
    return firstQuestion;
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
