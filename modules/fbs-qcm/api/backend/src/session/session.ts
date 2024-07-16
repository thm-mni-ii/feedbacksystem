import * as mongoDB from "mongodb";
import { getUserCourseRoles } from "../utils/utils";
import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getCurrentQuestion } from "../question/question";
import { SessionStatus } from "../utils/enum";

export async function startSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    console.log(tokenData);
    const userCourses = getUserCourseRoles(tokenData);
    console.log(userCourses);
    if ( userCourses.length == 0) {
        return -1;
    }
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    if( await checkForOpenSessions(tokenData)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const sessionEntry = {
        user: tokenData.id,
        time: new Date,
        status: SessionStatus.ongoing,
        catalogId: catalogObjectId,
        courseId: courseObjectId,
    }
    await sessionCollection.insertOne(sessionEntry);
    return await getSessionQuestion(catalogId, tokenData);
}

export async function getSessionQuestion(catalogId: string, tokenData: JwtPayload) {
    const userCourses = getUserCourseRoles(tokenData);
    if(userCourses.length === 0) {
        return -1;
    }
    const question = await getCurrentQuestion(tokenData, catalogId);
    console.log(question);
    console.log("HALLLLOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    return question;
}

export async function pauseSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    const userCourses = getUserCourseRoles(tokenData);
    if(userCourses.length == 0) {
        return -1;
    }
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    if(await checkIfSessionIsOngoing(tokenData.user, catalogObjectId, courseObjectId)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const sessionEntry = {
        user: tokenData.id,
        time: new Date,
        status: SessionStatus.paused,
        catalogId: catalogObjectId,
        courseId: courseObjectId,
    }
    await sessionCollection.insertOne(sessionEntry);
}

async function checkIfSessionIsOngoing(user: number, catalogObjectId: mongoDB.ObjectId, courseObjectId: mongoDB.ObjectId) {
    const query = {
        user: user,
        catalogId: catalogObjectId,
        courseId: courseObjectId
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.findOne(query);
    if(result === null) {
        return false;
    }
    if(result.ongoing === SessionStatus.ongoing) {
        return true;
    }
    return false;
}

async function checkForOpenSessions(tokenData: JwtPayload) {
    return false;
}
