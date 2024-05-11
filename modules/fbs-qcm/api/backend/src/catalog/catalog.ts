import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getAdminCourseRoles, getElementFromArray, getCatalogPermission } from "../utils/utils";
import * as mongoDB from "mongodb";

export async function postCatalog(data: JSON, tokenData: JwtPayload, course: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
    const searchQuery = {
        system_id: {$in: adminCourses}, 
        _id: courseIdObject
    };
    console.log(searchQuery);
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const result = await courseCollection.find(searchQuery).toArray();
    console.log(result);
    if(result.length > 0) {
       const res = await catalogCollection.insertOne(data); 
       console.log(res);
       const filter = {
           _id: courseIdObject
       }
       const update = {
            $push: { catalogs: res.insertedId } as mongoDB.UpdateFilter<any>
       } 
       console.log(filter);
       console.log(update);
       const res2 = await courseCollection.updateOne(filter, update);
       console.log(res2);
       return 0;
    } else {
        return -1;
    }
}

export async function getCatalog(tokenData: JwtPayload, catalogId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const query  = {
        _id:new mongoDB.ObjectId(catalogId)
    };
    console.log(query);
    const database: mongoDB.Db = await connect();
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const catalogPermission = await getCatalogPermission(adminCourses, catalogId);
    console.log(catalogPermission)
    if(catalogPermission === null || catalogPermission.length === 0) {
        return -1;
    }
    const data = await catalogCollection.findOne(query);
    return data;
}
