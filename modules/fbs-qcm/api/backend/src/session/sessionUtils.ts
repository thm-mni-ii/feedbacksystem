import * as mongoDB from "mongodb";
import { JwtPayload } from "jsonwebtoken";
import { SessionStatus } from "../utils/enum";

export interface Session {
  _id: string;
  user: number;
  time: Date;
  starttime: Date;
  status: number;
  catalogId?: string;
  courseId: number;
  duration?: number;
  type?: string;
}

export interface SessionReturn {
  user: number;
  catalogId?: string;
  courseId?: number;
  status?: string;
  time?: number;
  type?: string;
}

export async function getOngoingSession(
  userId: number,
  sessionCollection: mongoDB.Collection
) {
  const query = {
    status: SessionStatus.ongoing,
    user: userId,
  };
  return await sessionCollection.findOne(query);
}

export async function checkIfOngoingSessionExist(
  tokenData: number,
  sessionCollection: mongoDB.Collection
) {
  const currentSession = await getOngoingSession(tokenData, sessionCollection);
  if (currentSession === null) {
    return false;
  }
  return true;
}
