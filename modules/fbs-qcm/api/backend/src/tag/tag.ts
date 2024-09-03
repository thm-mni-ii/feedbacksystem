import { JwtPayload } from "jsonwebtoken";
import { getAdminCourseRoles } from "../utils/utils";
import * as mongoDB from "mongodb";
import { connect } from "../mongo/mongo";

export async function createTag(tokenData: JwtPayload, tagName: string) {
    console.log(tagName);
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("Tags");
    const insert = {
        text: tagName
    };
    const alreadyExist = await tagCollection.findOne(insert);
    console.log(alreadyExist);
    if(alreadyExist != null) {
        return -2;
    }
    const data = await tagCollection.insertOne(insert);
    const returnValue = {
        id: data.insertedId
    };
    return returnValue;
}
