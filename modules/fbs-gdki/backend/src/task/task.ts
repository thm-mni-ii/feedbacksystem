import { JwtPayload } from "jsonwebtoken";
import * as mongoDB from "mongodb";
import { connect } from "../db/mongo";
import { task } from "../model/model";
import { authenticate } from "../authenticate/authenticate";

export async function createTask(userData: JwtPayload, task: task) {
    if(!authenticate(userData)) {
        return 403;
    }
}