import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo"; 
import { getAllQuestionsFromCatalogs, getAdminCourseRoles, getCatalogPermission, getFirstQuestionInCatalog} from "../utils/utils";
import * as mongoDB from "mongodb";

export async function postCatalog(data: JSON, tokenData: JwtPayload, course: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
    const searchQuery = {
        courseId: {$in: adminCourses}, 
        _id: courseIdObject
    };
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const result = await courseCollection.find(searchQuery).toArray();
    if(result.length > 0) {
       const res = await catalogCollection.insertOne(data); 
       const filter = {
           _id: courseIdObject
       }
       const update = {
            $push: { catalogs: res.insertedId } as mongoDB.UpdateFilter<any>
       } 
       const res2 = await courseCollection.updateOne(filter, update);
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
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const catalogPermission = await getCatalogPermission(adminCourses, catalogId);
    if(!catalogPermission) {
        return -1;
    }
    const data = await catalogCollection.findOne(query);
    return data;
}

export async function deleteCatalog(tokenData: JwtPayload, catalogId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const query  = {
        _id: catalogIdObject
    };
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogPermission: any = await getCatalogPermission(adminCourses, catalogId);
    if(!catalogPermission) {
        return -1;
    }
    const data = await catalogCollection.deleteOne(query);
     const filter = {
        _id: catalogPermission._id
    }
    const deleteConnections = {
        cataolg: catalogIdObject
    }
    await questionInCatalogCollection.deleteMany(deleteConnections);
    const update = {
        $pull: { catalogs: catalogIdObject } as mongoDB.UpdateFilter<any>
    };
    const res = await courseCollection.updateOne(filter, update);
    return data;
}

export async function putCatalog(catalogId: string, data: JSON, tokenData: JwtPayload, courseId: string) {
    const adminCourses = getAdminCourseRoles(tokenData); 
    const database: mongoDB.Db = await connect();
    const courseResult = await getCatalogPermission(adminCourses, catalogId);
    if (!courseResult) {
        return -1;
    }
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(courseId);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const catalogQuery = {
        _id: courseIdObject,
        catalogs: catalogIdObject
    };
    const result = await catalogCollection.find(catalogQuery).toArray();
    if (result.length === 0) {
        const move = await moveCatalogInCourses(adminCourses, courseCollection, courseIdObject, catalogIdObject);
        if( move === -1) {
            return -1;
        }
    }
    const filter = {
        _id: catalogIdObject
    }
    const res = await catalogCollection.replaceOne(filter, data); 
    return res;
}

export async function getUser(tokenData: JwtPayload) {
    const database: mongoDB.Db = await connect();
    const userCollection: mongoDB.Collection = database.collection("user");
    const query = {
        id: tokenData.id,
    };
    console.log(query);
    const res: any = await userCollection.findOne(query);
    delete res._id;
    delete res.id;
    return res;
}

export async function getCatalogScore(tokenData: JwtPayload, catalogId: string) {
    const database: mongoDB.Db = await connect();
    const userCollection: mongoDB.Collection = database.collection("user");
    const query = {
        id: tokenData.id,
      [`catalogscores.${catalogId}`]: { $exists: true }
    };
    console.log(query);
    const res: any = await userCollection.findOne(query);
    const score = {
        score: res.catalogscores[catalogId]
    };
    return score;
}


export async function getQuestionTree(tokenData: JwtPayload, catalogId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const course = getCatalogPermission(adminCourses, catalogId); 
    if(!course) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const catalogCollection = database.collection("catalog");
    const questionInCatalogCollection = database.collection("questionInCatalog");
    const firstQuestion = await getFirstQuestionInCatalog(catalogCollection, questionInCatalogCollection, catalogId);
    if(firstQuestion == null || firstQuestion.length == 0) {
        return -1;
    }
    const catalogArray: string[] = [catalogId];
    const allConnections = await getAllQuestionsFromCatalogs(questionInCatalogCollection, catalogArray); 
    if(allConnections == null || allConnections.length == 0) {
        return -1;
    }
    console.log(allConnections);
}


async function moveCatalogInCourses(adminCourses: number[], courseCollection: mongoDB.Collection,
                                     courseIdObject: mongoDB.ObjectId, catalogIdObject: mongoDB.ObjectId) {
    const checkQuery = {
        courseId: {$in: adminCourses},
        catalogs: catalogIdObject
    }
    const res = await courseCollection.findOne(checkQuery);
    if(res == null || res.length == 0) {
        return -1;
    }
    const filter = {
        _id: res._id
    };
    const change = {
        $pull: {catalogs: catalogIdObject} as mongoDB.UpdateFilter<any> 
    };        
    await courseCollection.updateOne(filter, change);
    const filter2 = {
        _id: courseIdObject
    }
    const change2 = {
        $push: {catalogs: catalogIdObject} as mongoDB.UpdateFilter<any> 
    };        
    await courseCollection.updateOne(filter2, change2);
    return 0;
}
