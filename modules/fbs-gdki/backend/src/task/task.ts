import { JwtPayload } from "jsonwebtoken";
import * as mongoDB from "mongodb";
import { connect } from "../db/mongo";
import { task } from "../model/model";
import { authenticate } from "../authenticate/authenticate";

export async function createTask(userData: JwtPayload, task: Omit<task, '_id'>) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const responseFromDb = taskCollection.insertOne(task);
    return responseFromDb;
}