import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  QuestionInSkillInsertion,
  SkillInsertion,
} from "../model/utilInterfaces";
import * as mongoDB from "mongodb";

// Hilfsfunktion zur ID-Validierung
function isValidObjectId(id: string): boolean {
  return mongoDB.ObjectId.isValid(id);
}

// Beispiel für einfache Rechteprüfung (Platzhalter)
function isAuthorized(tokenData: JwtPayload, resourceOwnerId: string): boolean {
  // TODO: Implementiere echte Rechteprüfung
  return true;
}

export async function getSkillsByCourse(
  tokenData: JwtPayload,
  courseId: string
) {
  try {
    console.log("SKILL REQUEST skill.ts");
    const database: mongoDB.Db = await connect();
    const skillCollection = database.collection("skill");
    // Annahme: Das Feld "course" enthält die courseId (als Zahl oder String)
    const skills = await skillCollection
      .find({ course: Number(courseId) })
      .toArray();
    return skills;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

export async function addQuestionToSkill(
  tokenData: JwtPayload,
  skillId: string,
  questionId: string
) {
  if (!isValidObjectId(skillId) || !isValidObjectId(questionId)) {
    return { success: false, error: "Invalid ID format" };
  }
  try {
    // TODO: Authentifizierung/Autorisierung prüfen!
    if (!isAuthorized(tokenData, skillId)) {
      return { success: false, error: "Not authorized" };
    }
    const database: mongoDB.Db = await connect();
    const questionInSkillCollection = database.collection("questionInSkill");
    const insertionObject: QuestionInSkillInsertion = {
      questionId: new mongoDB.ObjectId(questionId),
      skillId: new mongoDB.ObjectId(skillId),
    };
    const data = await questionInSkillCollection.insertOne(insertionObject);
    return { success: true, id: data.insertedId };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function removeQuestionFromSkill(
  tokenData: JwtPayload,
  questionId: string,
  skillId: string
) {
  if (!isValidObjectId(skillId) || !isValidObjectId(questionId)) {
    return { success: false, error: "Invalid ID format" };
  }
  try {
    if (!isAuthorized(tokenData, skillId)) {
      return { success: false, error: "Not authorized" };
    }
    const database: mongoDB.Db = await connect();
    const questionInSkillCollection: mongoDB.Collection =
      database.collection("questionInSkill");
    const query = {
      questionId: new mongoDB.ObjectId(questionId),
      skillId: new mongoDB.ObjectId(skillId),
    };
    const data = await questionInSkillCollection.deleteOne(query);
    if (data.deletedCount === 0) {
      return { success: false, error: "No matching entry found" };
    }
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function createSkill(tokenData: JwtPayload, data: SkillInsertion) {
  if (!data.name || !data.course) {
    return { success: false, error: "Missing required fields" };
  }
  try {
    // TODO: Authentifizierung/Autorisierung prüfen!
    if (!isAuthorized(tokenData, String(data.course))) {
      return { success: false, error: "Not authorized" };
    }
    const database: mongoDB.Db = await connect();
    const skillCollection: mongoDB.Collection = database.collection("skill");
    const skillObject: SkillInsertion = {
      course: data.course,
      name: data.name,
      requirements: data.requirements,
    };
    const response = await skillCollection.insertOne(skillObject);
    return { success: true, id: response.insertedId };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
