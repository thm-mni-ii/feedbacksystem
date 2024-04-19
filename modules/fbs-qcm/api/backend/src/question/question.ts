import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";

export async function getQuestionById(questionId: string) {
    console.log("creating connection to MOngoDB");
    const query  = {_id:new mongoDB.ObjectId(questionId)};
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const data = await collection.findOne(query);
    return data;
}
