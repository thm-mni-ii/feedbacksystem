import * as mongoDB from "mongodb";
import { connect } from "../db";
import type { JwtPayload } from "../model/utilInterfaces";

// Beispiel: Starte eine Lern-Session, speichere z. B. user, course und startTime in der Collection "learnSession"
export async function startLearnSessionService(
  tokenData: JwtPayload,
  courseId: number
) {
  try {
    const database: mongoDB.Db = await connect();
    const sessionCollection = database.collection("learnSession");
    const session = await sessionCollection.insertOne({
      course: courseId,
      user: tokenData.user,
      startTime: new Date(),
      status: "ongoing",
      // Weitere Felder nach Bedarf
    });
    return session.ops[0]; // oder session.insertedId u.ä.
  } catch (error) {
    console.error("Error in startLearnSessionService:", error);
    return null;
  }
}

// Liefert die aktuelle Frage für eine Lern-Session. (Implementierung je nach Logik, z. B. zuletzt beantwortete Frage)
export async function getCurrentLearnQuestionService(
  tokenData: JwtPayload,
  sessionId: string
) {
  try {
    const database: mongoDB.Db = await connect();
    const questionCollection = database.collection("question");
    // Beispiel: Hole die erste Frage, die noch nicht beantwortet wurde.
    const question = await questionCollection.findOne({
      /* Filter nach session oder course */
    });
    return question;
  } catch (error) {
    console.error("Error in getCurrentLearnQuestionService:", error);
    return null;
  }
}

// Nimmt eine Antwort entgegen und speichert sie in der Collection "learnAnswer" o.ä.
export async function submitLearnAnswerService(
  tokenData: JwtPayload,
  sessionId: string,
  answer: any
) {
  try {
    const database: mongoDB.Db = await connect();
    const answerCollection = database.collection("learnAnswer");
    const result = await answerCollection.insertOne({
      sessionId: new mongoDB.ObjectId(sessionId),
      answer,
      answeredAt: new Date(),
      user: tokenData.user,
    });
    return result;
  } catch (error) {
    console.error("Error in submitLearnAnswerService:", error);
    return -1;
  }
}

export async function endLearnSessionService(
  tokenData: JwtPayload,
  sessionId: string
) {
  try {
    const database: mongoDB.Db = await connect();
    const sessionCollection = database.collection("learnSession");
    const result = await sessionCollection.updateOne(
      { _id: new mongoDB.ObjectId(sessionId) },
      { $set: { status: "ended", endTime: new Date() } }
    );
    return result;
  } catch (error) {
    console.error("Error in endLearnSessionService:", error);
    return -1;
  }
}
