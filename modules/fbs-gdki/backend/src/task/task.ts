import { JwtPayload } from "jsonwebtoken";
import * as mongoDB from "mongodb";
import { connect } from "../db/mongo";
import { task } from "../model/model";
import { authenticate } from "../authenticate/authenticate";
import { getTextFromTask, isTaskPublic } from "./taskUtils";

export async function createTask(userData: JwtPayload, task: Omit<task, '_id'>) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const responseFromDb = taskCollection.insertOne(task);
    return responseFromDb;
}

export async function deleteTaskById(userData: JwtPayload, taskId: String) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const deleteQuery = {
        _id: new mongoDB.ObjectId(taskId)
    };
    const response = taskCollection.deleteOne(deleteQuery);
    return response;
}

export async function updateTask(userData: JwtPayload, task: task) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const filterQuery = {
        _id: task._id
    }
    const upadteQuery = {
        text: task.text,
        result: task.result,
        isPublic: task.isPublic
    };
    const response = taskCollection.replaceOne(filterQuery, upadteQuery);
    return response;
}

export async function getTaskById(userData: JwtPayload, taskId: String) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const findQuery = {
        _id: new mongoDB.ObjectId(taskId)
    };
    const response = taskCollection.findOne(findQuery);
    return response;
}
export async function getTaskTextById(userData: JwtPayload, taskId: String) {
    if(!authenticate(userData)) {
        return 403;
    }
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("task");
    const findQuery = {
        _id: new mongoDB.ObjectId(taskId)
    };
    const response: task = taskCollection.findOne(findQuery);

    if(!isTaskPublic(response)) {
        return 404;
    }
    const text = getTextFromTask(response);
    if(typeof text === 'number') {
        return text;
    }
    return text;
}