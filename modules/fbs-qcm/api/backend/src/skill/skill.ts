import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { QuestionInSkillInsertion, Skill, SkillInsertion } from "../model/utilInterfaces";
import { QuestionInSkill } from "../model/utilInterfaces";
import * as mongoDB from "mongodb";

export async function addQuestionToSkill(tokenData: JwtPayload, skillId: string, questionId: string) {
    try {
        // authentication im Skill wie???
        const database: mongoDB.Db = await connect();
        const questionInSkillCollection = database.collection("questionInSkill");
        const insertionObject: QuestionInSkillInsertion = {
            questionId: new mongoDB.ObjectId(questionId),
            skillId: new mongoDB.ObjectId(skillId)
        }
        const data = await questionInSkillCollection.insertOne(insertionObject);
        return {
            id: data.insertedId
        };
    } catch (error) {
        console.log(error);
        return -1;
    }
}

export async function removeQuestionFromSkill(tokenData: JwtPayload, questionId: string, skillId: string) {
    try {
        //authentication
        const database: mongoDB.Db = await connect(); 
        const questionInSkillCollection: mongoDB.Collection = database.collection("questionInSkill");
        const query = {
            questionId: new mongoDB.ObjectId(questionId),
            skillId: new mongoDB.ObjectId(skillId)
        }
        const data = await questionInSkillCollection.deleteOne(query);
        return data;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

export async function createSkill(tokenData: JwtPayload, data: SkillInsertion) {
    try {
        //authentication
        const database: mongoDB.Db = await connect();
        const skillCollection: mongoDB.Collection = database.collection("skill"); 
        const skillObject: SkillInsertion = {
            course: data.course,
            name: data.name,
            requirements: data.requirements
        }
        const response = await skillCollection.insertOne(skillObject);
        return {
            id: response.insertedId
        };
    } catch (error) {
        console.log(error);
        return -1;
    }
}