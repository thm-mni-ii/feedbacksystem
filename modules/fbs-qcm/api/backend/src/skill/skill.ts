import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  QuestionInSkillInsertion,
  Skill,
  SkillInsertion,
} from "../model/utilInterfaces";
import { QuestionInSkill } from "../model/utilInterfaces";
import * as mongoDB from "mongodb";

export async function addQuestionToSkill(
  tokenData: JwtPayload,
  skillId: string,
  questionId: string
) {
  try {
    // authentication im Skill wie???
    const database: mongoDB.Db = await connect();
    const questionInSkillCollection = database.collection("questionInSkill");
    const insertionObject: QuestionInSkillInsertion = {
      questionId: new mongoDB.ObjectId(questionId),
      skillId: new mongoDB.ObjectId(skillId),
    };
    const data = await questionInSkillCollection.insertOne(insertionObject);
    return {
      id: data.insertedId,
    };
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export async function removeQuestionFromSkill(
  tokenData: JwtPayload,
  questionId: string,
  skillId: string
) {
  try {
    //authentication
    const database: mongoDB.Db = await connect();
    const questionInSkillCollection: mongoDB.Collection =
      database.collection("questionInSkill");
    const query = {
      questionId: new mongoDB.ObjectId(questionId),
      skillId: new mongoDB.ObjectId(skillId),
    };
    const data = await questionInSkillCollection.deleteOne(query);
    return data;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export async function createSkill(tokenData: JwtPayload, data: SkillInsertion) {
  console.log("SKILL PAYLOAD --->", data);
  try {
    const database: mongoDB.Db = await connect();
    const skillCollection: mongoDB.Collection = database.collection("skill");
    const skill = {
      name: data.name,
      description: data.description ?? "",
      isPublic: data.isPublic ?? false,
      difficulty: data.difficulty ?? 0,
      course: data.course ?? 0,
    };
    console.log("Skill to insert:", skill);
    const response = await skillCollection.insertOne(skill);
    return {
      id: response.insertedId,
    };
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export async function updateSkill(
  tokenData: JwtPayload,
  skillId: string,
  updatedFields: Partial<SkillInsertion>
) {
  try {
    // _id aus den updatedFields entfernen, falls vorhanden
    if ("_id" in updatedFields) {
      delete updatedFields._id;
    }

    const database: mongoDB.Db = await connect();
    const skillCollection = database.collection("skill");

    const result = await skillCollection.updateOne(
      { _id: new mongoDB.ObjectId(skillId) },
      { $set: updatedFields }
    );

    return result;
  } catch (error) {
    console.error("Error updating skill:", error);
    return -1;
  }
}
export async function deleteSkill(tokenData: JwtPayload, skillId: string) {
  try {
    const database: mongoDB.Db = await connect();
    const skillCollection = database.collection("skill");

    const result = await skillCollection.deleteOne({
      _id: new mongoDB.ObjectId(skillId),
    });

    return result;
  } catch (error) {
    console.error("Error deleting skill:", error);
    return -1;
  }
}

export async function getSkillsByCourse(
  tokenData: JwtPayload,
  courseId: string
) {
  try {
    const database: mongoDB.Db = await connect();
    const skillCollection = database.collection("skill");
    // Annahme: Das Feld "course" enthält die courseId als Zahl oder String
    const skills = await skillCollection
      .find({ course: { $in: [Number(courseId), String(courseId)] } })
      .toArray();
    return skills;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSkillProgressByCourse(
  tokenData: JwtPayload,
  courseId: string
) {
  try {
    const database: mongoDB.Db = await connect();
    const progressCollection = database.collection("skillProgress");
    // Annahme: Das Feld "courseId" enthält die Kurs-ID
    const progress = await progressCollection
      .find({ courseId: Number(courseId) })
      .toArray();
    return progress;
  } catch (error) {
    console.error(error);
    return [];
  }
}
