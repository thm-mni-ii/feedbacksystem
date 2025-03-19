import { JwtPayload } from "jsonwebtoken";
import { getAdminCourseRoles } from "../utils/utils";
import * as mongoDB from "mongodb";
import { connect } from "../mongo/mongo";
import { authenticate } from "../authenticate";
import { Access } from "../utils/enum";

export async function getAllTags(tokenData: JwtPayload) {
    if(!authenticate(tokenData, Access.tutor)) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const tagCollection: mongoDB.Collection = database.collection("tag");
    const allTags = tagCollection.find().toArray();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const result = questionCollection.aggregate([
        // Zerlege das Array questionTags in einzelne Dokumente
        { $unwind: "$questionTags" },
        
        // Gruppiere nach den Tags und zähle sie
        { $group: { 
            _id: "$questionTags", 
            count: { $sum: 1 } 
          } 
        },
        
        // Optional: Sortiere nach Häufigkeit absteigend
        { $sort: { count: -1 } }
      ])
    console.log(result);
    return result;
}

export async function createSingleTag(tokenData: JwtPayload, tagName: string) {
    console.log(tagName);
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
    console.log(tagName);
    const search = {
        text: { 
            $regex: 
            tagName, 
            $options: "i" 
        }
    };
    console.log(search);
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
    console.log(result);
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
    console.log(filter);
    console.log(update);
    const data = await tagCollection.updateOne(filter, update);
    console.log(data);
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
    console.log(query);
    const result = await questionCollection.findOne(query);
    console.log(result);
    if(result != null) {
        return -1;
    }
    const filter = {
        _id: tagIdObject
    }
    console.log(filter);
    const data = await tagCollection.deleteOne(filter);
    console.log(data);
    return data;
}
