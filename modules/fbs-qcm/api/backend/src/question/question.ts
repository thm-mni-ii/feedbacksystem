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

export async function postQuestion(data: JSON, tokenData: JwtPayload) {
   // const adminCourses = getAdminCourseRoles(tokenData);
   // adminCourses.some(course => course == data["course"]);
   // const database: mongoDB.Db = await connect();
   // const collection: mongoDB.Collection = database.collection("question");
   // const response = collection.insertOne(data);
   // return response;
}

function getAdminCourseRoles(tokenData: JwtPayload) {
    let coursesAdmin: number[] = [];
    for (let key in tokenData['courseRoles']) {
        if(tokenData['courseRoles'][key] == "TUTOR" || tokenData['courseRoles'][key] == "DOCENT") {
            coursesAdmin.push(parseInt(key, 10));
        }
    }
    return coursesAdmin;
}
