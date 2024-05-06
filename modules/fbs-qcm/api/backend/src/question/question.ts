import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function getQuestionById(questionId: string, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const query  = {
        _id:new mongoDB.ObjectId(questionId),
        courseId: { $in: adminCourses}
    };
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const data = await collection.findOne(query);
    if(data !== null){
        return data;
    }
    return {};
}

export async function deleteQuestionById(questionId: string, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const query = {
        _id: new mongoDB.ObjectId(questionId),
        courseId: { $in: adminCourses } 
    };
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const data = await collection.deleteOne(query);
    return data;
}

export async function putQuestion(questionId: string, data: JSON) {
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    await collection.updateOne({_id: new mongoDB.ObjectId(questionId)}, data); 
    return 0;
}

export async function postQuestion(data: JSON, tokenData: JwtPayload, catalog: number) {
    const adminCourses = getAdminCourseRoles(tokenData);
    console.log(adminCourses);
    const searchQuery = {
    system_id: {$in: adminCourses}, 
    catalogs: catalog
    };
    console.log(searchQuery);
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("course");
    const result = await collection.find(searchQuery).toArray();
    console.log(result.length);
    console.log(result);
    if (result.length > 0) {
        const collection_question: mongoDB.Collection = database.collection("question");
        const response = collection_question.insertOne(data);
    } else {
        return -1;
    }
    return data;
}

function getAdminCourseRoles(tokenData: JwtPayload) {
    console.log(tokenData);
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
    console.log(coursesAdmin);
    return coursesAdmin;
}
