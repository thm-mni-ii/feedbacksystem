import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function getQuestionById(questionId: string) {
    const query  = {_id:new mongoDB.ObjectId(questionId)};
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const data = await collection.findOne(query);
    return data;
}

export async function deleteQuestion(questionId: string) {
    const query  = {_id:new mongoDB.ObjectId(questionId)};
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

export async function postQuestion(data: JSON) {
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const response = collection.insertOne(data);
    return response;
}
