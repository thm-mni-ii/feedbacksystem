import { JwtPayload } from "jsonwebtoken";
import * as mongoDB from "mongodb";
import { connect } from "../db/mongo";
import { editCodeStorageFinder } from "../model/model";

export async function storeCodeForTask(userData: JwtPayload, task: number, code: string): Promise<any> {
    //authenticate mabye??
    const database: mongoDB.Db = await connect();
    const storeCollection = database.collection("store");
    const findQuery: editCodeStorageFinder = {
        taskId: task,
        userId: userData.id
    };
    const updateQuery = {
        $set: { text: code }
    };
    const result = await storeCollection.updateOne(
        findQuery,
        updateQuery,
        {upsert: true}
    );
    return result;
}
export async function getCodeFromTask(userData: JwtPayload, task: number): Promise<any> {
    //authenticate mabye??
    const database: mongoDB.Db = await connect();
    const storeCollection = database.collection("store");
    const findQuery: editCodeStorageFinder = {
        taskId: task,
        userId: userData.id
    };
    const result = await storeCollection.findOne(findQuery);
    return result;
}