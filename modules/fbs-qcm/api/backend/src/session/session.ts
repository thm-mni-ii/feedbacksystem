import * as mongoDB from "mongodb";
import { getFirstQuestionInCatalog, getSessionStatusAsText, getUserCourseRoles } from "../utils/utils";
import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getCurrentQuestion } from "../question/question";
import { SessionStatus } from "../utils/enum";

export async function startSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    const userCourses = getUserCourseRoles(tokenData);
    console.log(userCourses);
    if ( userCourses.length == 0) {
        return -1;
    }
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    if( await checkifSessionIsNotFinished(tokenData.id, catalogObjectId, courseObjectId)) {
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
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const question = await getFirstQuestionInCatalog(questionCollection, questionInCatalogCollection, catalogId);
    console.log(question);
    console.log("HALLLLOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    return question;
}

export async function pauseSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    console.log(1);
    const userCourses = getUserCourseRoles(tokenData);
    console.log(2);
    if(userCourses.length == 0) {
        return -1;
    }
    console.log(3);
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    console.log(4);
    if(await checkIfSessionIsOngoing(tokenData.id, catalogObjectId, courseObjectId)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    console.log(5);
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const sessionEntry = {
        user: tokenData.id,
        time: new Date,
        status: SessionStatus.paused,
        catalogId: catalogObjectId,
        courseId: courseObjectId,
    }
    console.log(6);
    await sessionCollection.insertOne(sessionEntry);
    return 1;
}

export async function endSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    const userCourses = getUserCourseRoles(tokenData);
    if(userCourses.length == 0) {
        return -1;
    }
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    if(await checkifSessionIsNotFinished(tokenData.user, catalogObjectId, courseObjectId)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const sessionEntry = {
        user: tokenData.id,
        time: new Date,
        status: SessionStatus.finished,
        catalogId: catalogObjectId,
        courseId: courseObjectId,
    }
    await sessionCollection.insertOne(sessionEntry);
    return 1;
}

export async function unpauseSession(tokenData: JwtPayload, catalogId: string, courseId: string) {
    console.log(1);
    const userCourses = getUserCourseRoles(tokenData);
    if(userCourses.length == 0) {
        return -1;
    }
    console.log(2);
    const catalogObjectId = new mongoDB.ObjectId(catalogId)
    const courseObjectId = new mongoDB.ObjectId(courseId)
    if(await checkifSessionIsNotPaused(tokenData.id, catalogObjectId, courseObjectId)) {
        return -1;
    }
    console.log(3);
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    console.log(4);
    const sessionEntry = {
        user: tokenData.id,
        time: new Date,
        status: SessionStatus.ongoing,
        catalogId: catalogObjectId,
        courseId: courseObjectId,
    }
    await sessionCollection.insertOne(sessionEntry);
    console.log(5);
    return 1;
}

async function checkIfSessionIsOngoing(user: number, catalogObjectId: mongoDB.ObjectId, courseObjectId: mongoDB.ObjectId) {
    const query = {
        user: user,
        catalogId: catalogObjectId,
        courseId: courseObjectId
    }
    console.log("query");
    console.log(query);
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.find(query).sort({ time: -1 }).limit(1).toArray();
    console.log(result);
    if(result === null) {
        return false;
    }
    if(result[0].ongoing === SessionStatus.ongoing) {
        return true;
    }
    return false;
}

async function checkifSessionIsNotPaused(user: number, catalogObjectId: mongoDB.ObjectId, courseObjectId: mongoDB.ObjectId) {
    const query = {
        user: user,
        catalogId: catalogObjectId,
        courseId: courseObjectId
    }
    console.log("query");
    console.log(query);
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.find(query).sort({ time: -1 }).limit(1).toArray();
    console.log(result);
    if(result === null) {
        return true;
    }
    if(result[0].ongoing === SessionStatus.ongoing) {
        return true;
    }
    if(result[0].ongoing === SessionStatus.finished) {
        return true;
    }
    return false;
}
async function checkifSessionIsNotFinished(user: number, catalogObjectId: mongoDB.ObjectId, courseObjectId: mongoDB.ObjectId) {
    const query = {
        user: user,
        catalogId: catalogObjectId,
        courseId: courseObjectId
    }
    console.log(query);
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.find(query).sort({ time: -1 }).limit(1).toArray();
    console.log(result);
    if(result.length === 0) {
        return false;
    }
    if(result[0].status === SessionStatus.ongoing) {
        return true;
    }
    if(result[0].status === SessionStatus.paused) {
        return true;
    }
    return false;
}

async function getDurationOfSession(user: number, catalog: string, course: string) {
    const query = {
        user: user,
        catalogId: catalog,
        courseId: course
    }
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.find(query).sort({ time: 1}).toArray();
    let lastFinished = -1;
    for(let i = 0; i < result.length - 1; i++) {
       if(result[i].status === SessionStatus.finished) {
           lastFinished = i;
       }
    }
    let j: number = lastFinished + 1;
    let durationStart: Date = new Date;
    let duration = 0;
    let currentStatus: SessionStatus = SessionStatus.finished;
    while(true) {
        if(j >= result.length) {
            if(currentStatus === SessionStatus.ongoing) {
                const currentTime = new Date;
                const tmpDuration = currentTime.getTime() - durationStart.getTime();
                if(tmpDuration < 0) {
                    return -2;
                }
                duration += tmpDuration;
                break;
            }
        }
        if(result[j].status === SessionStatus.ongoing) {
            if(currentStatus === SessionStatus.ongoing) {
                return -2;
            }
            durationStart = result[j].time;
            j+=1;
            currentStatus = SessionStatus.ongoing;
        }
        if(result[j].status === SessionStatus.paused || result[j].status === SessionStatus.finished) {
            if(currentStatus === SessionStatus.paused) {
                return -2;
            }
            const tmpDuration = result[j].time.getTime() - durationStart.getTime();
            if(tmpDuration < 0) {
                return -2;
            }
            duration += tmpDuration;
            durationStart = new Date;
            j+=1;
            currentStatus = SessionStatus.paused;
        }
    }
    return duration;
}

export async function getOpenSessions(user: number) {
    const query = {
        user: user,
    }
    const result = await getSessionData(query);
    let finishedSessions: any[] = [];
    let unfinishedSessions: any[] = [];
    if(result === null) {
        return 0;
    }
    for(let i = 0; i < result.length; i++) {
       if(unfinishedSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       if(finishedSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       const entry = createSessionReturn(result[i]);
       if(result[i].status === SessionStatus.finished) {
           finishedSessions.push(entry)
       } else {
           unfinishedSessions.push(entry);
       }
    }
    return unfinishedSessions;
}
export async function getOngoingSessions(user: number) {
    const query = {
        user: user,
    }
    const result = await getSessionData(query);
    let pausedOrFinishedSessions: any[] = [];
    let ongoingSessions: any[] = [];
    if(result === null) {
        return 0;
    }
    for(let i = 0; i < result.length; i++) {
       if(ongoingSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       if(pausedOrFinishedSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       const entry = createSessionReturn(result[i]);
       if(result[i].status === SessionStatus.finished  || result[i].status === SessionStatus.paused) {
            pausedOrFinishedSessions.push(entry)
       } else {
            ongoingSessions.push(entry);
       }
    }
    return ongoingSessions;
}
export async function getPausedSessions(user: number) {
    const query = {
        user: user,
    }
    const result = await getSessionData(query);
    let finishedOrOngoingSessions: any[] = [];
    let pausedSessions: any[] = [];
    if(result === null) {
        return 0;
    }
    for(let i = 0; i < result.length; i++) {
       if(pausedSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       if(finishedOrOngoingSessions.find(obj => obj.catalogId === result[i].catalogId && obj.courseId === result[i].courseId)) {
           continue;
       }
       const entry = createSessionReturn(result[i]);
       if(result[i].status === SessionStatus.finished  || result[i].status === SessionStatus.ongoing) {
            finishedOrOngoingSessions.push(entry)
       } else {
            pausedSessions.push(entry);
       }
    }
    return pausedSessions;
}
async function getSessionData(query: any) {
    const database: mongoDB.Db = await connect();
    const sessionCollection: mongoDB.Collection = database.collection("sessions");
    const result = await sessionCollection.find(query).sort({ time: -1}).toArray();
    return result;
}

function createSessionReturn(session: any) {
    const sessionReturn = {
        user: session.user,
        catalogId: session.catalogId,
        courseId: session.courseId,
        status: getSessionStatusAsText(session.status),
        score: session.score,
        time: getDurationOfSession(session.user, session.catalogId, session.courseId)
    }
    return sessionReturn;
}
