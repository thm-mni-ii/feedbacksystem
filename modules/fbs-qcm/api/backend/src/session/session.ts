import * as mongoDB from "mongodb";
import {
  getCurrentSession,
  getFirstQuestionInCatalog,
  getSessionStatusAsText,
  getStudentCourseRoles,
  getUserCourseRoles,
} from "../utils/utils";
import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getCurrentQuestion } from "../question/question";
import { CatalogAccess, SessionStatus } from "../utils/enum";
import { authenticateInCatalog } from "../authenticate";
import { checkIfOngoingSessionExist, getOngoingSession } from "./sessionUtils";

interface Session {
  user: string;
  time: Date;
  starttime: Date;
  status: number;
  catalogId: string;
  courseId: number;
  duration: number;
}
export async function postSession(
  tokenData: JwtPayload,
  catalogId: string,
  courseId: number
) {
  if (
    !authenticateInCatalog(tokenData, CatalogAccess.studentInCatalog, catalogId)
  ) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const catalogObjectId = new mongoDB.ObjectId(catalogId);
  if (await checkIfOngoingSessionExist(tokenData.id, sessionCollection)) {
    console.log("Session is already ongoing");
    return -2;
  }
  const sessionEntry = {
    user: tokenData.id,
    time: new Date(),
    starttime: new Date(),
    status: SessionStatus.ongoing,
    catalogId: catalogObjectId,
    courseId: courseId,
    duration: 0,
  };
  const result = await sessionCollection.insertOne(sessionEntry);
  console.log(result);
  return {
    sessionId: result.insertedId,
  };
}

export async function pauseSingleSession(
  tokenData: JwtPayload,
  catalogId: string,
  courseId: number
) {
  const userCourses = getStudentCourseRoles(tokenData);
  if (userCourses.length == 0) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const session = await getLastSession(
    sessionCollection,
    catalogId,
    courseId,
    tokenData.id
  );
  if (session.status !== SessionStatus.ongoing) {
    return -1;
  }
  const currentTime = new Date();
  const time = currentTime.getTime() - session.time.getTime();
  const newDuration = session.duration + time;
  const find = {
    _id: session._id,
  };
  const update = {
    $set: {
      time: new Date(),
      duration: newDuration,
      status: SessionStatus.paused,
    },
  };
  session.time = new Date();
  session.duration += time;
  session.status = SessionStatus.paused;
  await sessionCollection.updateOne(find, update);
  return 1;
}

async function getLastSession(
  sessionCollection: mongoDB.Collection,
  catalogId: string,
  courseId: number,
  id: number
) {
  const catalogObjectId: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const sessionQuery = {
    catalogId: catalogObjectId,
    courseId: courseId,
    user: id,
  };
  const sessionList = await sessionCollection
    .find(sessionQuery)
    .sort({ time: -1 })
    .limit(1)
    .toArray();
  const session = sessionList[0];
  return session;
}

export async function endSingleSession(
  tokenData: JwtPayload,
  sessionId: string
) {
  const userCourses = getStudentCourseRoles(tokenData);
  if (userCourses.length == 0) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const session = await getOngoingSession(tokenData.id, sessionCollection);
  if (session === null) {
    return -1;
  }
  if (session.status === SessionStatus.finished) {
    return -1;
  }
  if (session._id.toString() !== sessionId) {
    return -1;
  }
  const finder = {
    _id: session._id,
  };
  let duration = session.duration;
  if (session.status === SessionStatus.ongoing) {
    const currentTime = new Date();
    duration = currentTime.getTime() - session.time.getTime() + duration;
    const update = {
      $set: {
        time: currentTime,
        duration: duration,
        status: SessionStatus.finished,
      },
    };
    const result = await sessionCollection.updateOne(finder, update);
  } else {
    const currentTime = new Date();
    const update = {
      $set: {
        time: currentTime,
        status: SessionStatus.finished,
      },
    };
    const result = await sessionCollection.updateOne(finder, update);
  }
  return 1;
}

async function setAllRemainingQuestionsFalse(sessionId: string, userId: number) {
  
}

export async function unpauseSingleSession(
  tokenData: JwtPayload,
  catalogId: string,
  courseId: number
) {
  const userCourses = getStudentCourseRoles(tokenData);
  if (userCourses.length == 0) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const session = await getLastSession(
    sessionCollection,
    catalogId,
    courseId,
    tokenData.id
  );
  if (session.status !== SessionStatus.paused) {
    return -1;
  }
  const filter = {
    _id: session._id,
  };
  const update = {
    $set: {
      time: new Date(),
      status: SessionStatus.ongoing,
    },
  };
  const result = await sessionCollection.updateOne(filter, update);
  return result;
}

async function checkIfSessionIsOngoing(
  user: number,
  catalogObjectId: mongoDB.ObjectId,
  courseObjectId: mongoDB.ObjectId
) {
  const query = {
    user: user,
    catalogId: catalogObjectId,
    courseId: courseObjectId,
  };
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const result = await sessionCollection
    .find(query)
    .sort({ time: -1 })
    .limit(1)
    .toArray();
  if (result === null) {
    return false;
  }
  if (result[0].ongoing === SessionStatus.ongoing) {
    return true;
  }
  return false;
}

async function checkifSessionIsNotPaused(
  user: number,
  catalogObjectId: mongoDB.ObjectId,
  courseObjectId: mongoDB.ObjectId
) {
  const query = {
    user: user,
    catalogId: catalogObjectId,
    courseId: courseObjectId,
  };
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const result = await sessionCollection
    .find(query)
    .sort({ time: -1 })
    .limit(1)
    .toArray();
  if (result === null) {
    return true;
  }
  if (result[0].ongoing === SessionStatus.ongoing) {
    return true;
  }
  if (result[0].ongoing === SessionStatus.finished) {
    return true;
  }
  return false;
}
async function checkifSessionIsNotFinished(
  user: number,
  catalogObjectId: mongoDB.ObjectId
) {
  const query = {
    user: user,
    catalogId: catalogObjectId,
  };
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const result = await sessionCollection
    .find(query)
    .sort({ time: -1 })
    .limit(1)
    .toArray();
  if (result.length === 0) {
    return false;
  }
  if (result[0].status === SessionStatus.ongoing) {
    return true;
  }
  if (result[0].status === SessionStatus.paused) {
    return true;
  }
  return false;
}

export async function getOpenSessions(user: number) {
  const query = {
    user: user,
  };
  const result: Session[] = await getSessionData(query);
  let finishedSessions: any[] = [];
  let unfinishedSessions: any[] = [];
  if (result === null) {
    return 0;
  }
  for (let i = 0; i < result.length; i++) {
    if (
      unfinishedSessions.find(
        (obj) =>
          obj.catalogId === result[i].catalogId &&
          obj.courseId === result[i].courseId
      )
    ) {
      continue;
    }
    if (
      finishedSessions.find(
        (obj) =>
          obj.catalogId === result[i].catalogId &&
          obj.courseId === result[i].courseId
      )
    ) {
      continue;
    }
    const entry = createSessionReturn(result[i]);
    if (result[i].status === SessionStatus.finished) {
      finishedSessions.push(entry);
    } else {
      unfinishedSessions.push(entry);
    }
  }
  return unfinishedSessions;
}

export async function getOnlyOngoingSession(user: number) {
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const ongoingSession = await getOngoingSession(user, sessionCollection);
  return ongoingSession;
}

function removeMatchingObjects(arr1: any[], arr2: any[]) {
  return arr1.filter(
    (item1) =>
      !arr2.some(
        (item2) =>
          item1.catalogId === item2.catalogId &&
          item1.courseId === item2.courseId
      )
  );
}

export async function getPausedSessions(user: number) {
  const query = {
    user: user,
  };
  const result: Session[] = await getSessionData(query);
  let finishedOrOngoingSessions: any[] = [];
  let pausedSessions: any[] = [];
  if (result === null) {
    return 0;
  }
  for (let i = 0; i < result.length; i++) {
    if (
      pausedSessions.find(
        (obj) =>
          obj.catalogId === result[i].catalogId &&
          obj.courseId === result[i].courseId
      )
    ) {
      continue;
    }
    if (
      finishedOrOngoingSessions.find(
        (obj) =>
          obj.catalogId === result[i].catalogId &&
          obj.courseId === result[i].courseId
      )
    ) {
      continue;
    }
    const entry = createSessionReturn(result[i]);
    if (
      result[i].status === SessionStatus.finished ||
      result[i].status === SessionStatus.ongoing
    ) {
      finishedOrOngoingSessions.push(entry);
    } else {
      pausedSessions.push(entry);
    }
  }
  return pausedSessions;
}
async function getSessionData(query: any) {
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const result: Session[] = await sessionCollection
    .find(query)
    .sort({ time: -1 })
    .toArray() as unknown as Session[];
  return result;
}

async function createSessionReturn(session: Session) {
  const sessionReturn = {
    user: session.user,
    catalogId: session.catalogId,
    courseId: session.courseId,
    status: getSessionStatusAsText(session.status),
    time: session.duration,
  };
  return sessionReturn;
}

export async function getQuestionsNotInSession(tokenData: JwtPayload) {
  const sessionId = getCurrentSession(tokenData.id);
  const database: mongoDB.Db = await connect();
  const submissionCollection: mongoDB.Collection =
    database.collection("submission");
  const query = {
    session: sessionId,
  };
  const submissions = await submissionCollection.find(query).toArray();
  let questionIdList: string[] = [];
  for (let i = 0; i < submissions.length; i++) {
    questionIdList.push(submissions[i].question);
  }
  //get all Questions in Catalog that are not in questionIdList
}
