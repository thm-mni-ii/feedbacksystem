import { JwtPayload } from "jsonwebtoken";
import { getAdminCourseRoles } from "../utils/utils";
import * as mongoDB from "mongodb";
import { connect } from "../mongo/mongo";
import { authenticate } from "../authenticate";
import { Access } from "../utils/enum";
import { Tag, TagObject } from "./tagUtils";

export async function getAllTags(tokenData: JwtPayload) {
    if(!authenticate(tokenData, Access.tutor)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const data = await questionCollection.aggregate([
        { $unwind: "$questiontags" },
        { $group: { 
            _id: "$questiontags", 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } }
        ])
      let result: any[] = [];
      await data.forEach((tag: any) => {
        const tagObject = {
            tag: tag._id,
            count: tag.count
        }
        result.push(tagObject);
      });
      return result;
}

export async function createSingleTag(tokenData: JwtPayload, tagName: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const insert = {
        text: tagName
    };
    const alreadyExist = await tagCollection.findOne(insert);
    if(alreadyExist != null) {
        return -2;
    }
    const data = await tagCollection.insertOne(insert);
    const returnValue = {
        id: data.insertedId
    };
    return returnValue;
}

export async function findMultipleTags(tokenData: JwtPayload, tagName: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const search = {
        text: tagName
    };
    const data = await tagCollection.find(search).toArray();
    return data; 
}

export async function searchMultipleTags(tokenData: JwtPayload, tagName: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const search = {
        text: { 
            $regex: 
            tagName, 
            $options: "i" 
        }
    };
    const data = await tagCollection.find(search).toArray();
    return data;
}

export async function editSingleTag(tokenData: JwtPayload, tagId: string, newtext: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const tagIdObject = new mongoDB.ObjectId(tagId);
    const query = {
        questiontags: tagId
    }
    const result = await questionCollection.findOne(query);
    if(result != null) {
        return -1;
    }
    const filter = {
        _id: tagIdObject
    }
    const update = {
        $set: {
            text: newtext
        }
    }
    const data = await tagCollection.updateOne(filter, update);
    return data;
}

export async function deleteSingleTag(tokenData: JwtPayload, tagId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const tagIdObject = new mongoDB.ObjectId(tagId);
    const query = {
        questiontags: tagId
    }
    const result = await questionCollection.findOne(query);
    if(result != null) {
        return -1;
    }
    const filter = {
        _id: tagIdObject
    }
    const data = await tagCollection.deleteOne(filter);
    return data;
}
