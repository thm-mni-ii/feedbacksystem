import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function checkQuestionAccess(questionIdObject: mongoDB.ObjectId, adminCourses: number[],
                                  courseCollection: mongoDB.Collection, catalogCollection: mongoDB.Collection) {
    const allCatalogs: any = await getAllCatalogs(adminCourses, courseCollection);
    const catalogIds: mongoDB.ObjectId[] = [];
    for (let index = 0; index < allCatalogs.length; index++) {
        catalogIds.push(new mongoDB.ObjectId(allCatalogs[index]));
    }
    const ownCatalogQuery = {
        questions: questionIdObject,
        _id : {$in : catalogIds}
    }
    console.log(ownCatalogQuery);
    const catalogWithQuestion = await catalogCollection.findOne(ownCatalogQuery);
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
    return courseResult;
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

