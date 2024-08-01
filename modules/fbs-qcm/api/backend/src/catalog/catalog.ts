import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo"; 
import { getAllQuestionsFromCatalogs, getAdminCourseRoles, getCatalogPermission, getFirstQuestionInCatalog, getAllQuestionInCatalog,
 createQuestionResponse} from "../utils/utils";
import * as mongoDB from "mongodb";
    
type treeArray = any[][][];
interface catalog {
    name: string,
    questions: string[],
    requirements: string[]
}

export async function postCatalog(data: catalog, tokenData: JwtPayload, course: string) {
    console.log(data);
    console.log(tokenData);
    console.log(course);
    const adminCourses = getAdminCourseRoles(tokenData);
    const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
    const searchQuery = {
        courseId: {$in: adminCourses}, 
        _id: courseIdObject
    };
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const questionInCatalogCollectionCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const result = await courseCollection.find(searchQuery).toArray();
    if(result.length > 0) {
        const catalogEntry = {
            "name": data.name
        };
        const res = await catalogCollection.insertOne(catalogEntry); 
        console.log(res);
        const entry = {
             "course": result[0].courseId,
             "catalog": res.insertedId,
             "requirements": data.requirements
        }
        await catalogInCourseCollection.insertOne(entry);
        return {"catalog": res.insertedId};
    } else {
        console.log("no Courses found");
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
        console.log("No Permission to Catalog");
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
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogPermission: any = await getCatalogPermission(adminCourses, catalogId);
    if(!catalogPermission) {
        console.log("No Permission to Catalog");
        return -1;
    }
    const data = await catalogCollection.deleteOne(query);
     const filter = {
        _id: catalogPermission._id
    }
    const deleteConnections = {
        catalog: catalogIdObject
    }
    await questionInCatalogCollection.deleteMany(deleteConnections);
    await catalogInCourseCollection.deleteMany(deleteConnections);
    const update = {
        $pull: { catalogs: catalogIdObject } as mongoDB.UpdateFilter<any>
    };
    const res = await courseCollection.updateOne(filter, update);
    return data;
}

export async function putCatalog(catalogId: string, data: catalog, tokenData: JwtPayload, courseId: string) {
    const adminCourses = getAdminCourseRoles(tokenData); 
    const database: mongoDB.Db = await connect();
    const courseResult = await getCatalogPermission(adminCourses, catalogId);
    if (!courseResult) {
        console.log("No Permission to Catalog");
        return -1;
    }
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(courseId);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const catalogQuery = {
        _id: courseIdObject,
        catalogs: catalogIdObject
    };
    await catalogCollection.find(catalogQuery).toArray();
    const getCourseNumberQuery = {
        _id: courseIdObject
    }
    const courseNumber = await courseCollection.findOne(getCourseNumberQuery)
    if(courseNumber === null) {
        console.log("course does not exist");
        return -1;
    }
    const filter = {
        _id: catalogIdObject
    }
    const update = {
         $set: {name: data.name}
    }
    await catalogCollection.updateMany(filter, update); 
    const filter2 = {
        catalog: catalogIdObject,
        course: courseNumber.courseId
    }
    const update2 = {
        $set: {
           requirements: data.requirements,
        }
    }
    await catalogInCourseCollection.updateOne(filter2, update2); 
    return 0;
}

export async function getUser(tokenData: JwtPayload) {
    const database: mongoDB.Db = await connect();
    const userCollection: mongoDB.Collection = database.collection("user");
    const query = {
        id: tokenData.id,
    };
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
    const questionCollection = database.collection("question");
    const questionInCatalogCollection = database.collection("questionInCatalog");
    const firstQuestion: any = await getFirstQuestionInCatalog(questionCollection, questionInCatalogCollection, catalogId);
    if(firstQuestion == null || firstQuestion == -1) {
        return -1;
    }
    const catalogArray: string[] = [catalogId];
    const allConnections = await getAllQuestionsFromCatalogs(questionInCatalogCollection, catalogArray); 
    if(allConnections == null || allConnections.length == 0) {
        return -1;
    }
    const convertedFirstQuestion = createQuestionResponse(firstQuestion);
    let treeArray: treeArray = [[[convertedFirstQuestion]]];
    const allQuestions = await getAllQuestionInCatalog(questionInCatalogCollection, questionCollection, catalogId);
    if (allQuestions == null || allQuestions == -1) {
        return -1;
    }
    const result  = await addTreeLayer_v2(treeArray, questionCollection, allConnections, allQuestions);      
    return result;
}

async function addTreeLayer_v2(treeArray: treeArray, questionCollection: mongoDB.Collection, allConnections: any[], allQuestions: any[]) { 
    let i = 0;
    while(true) {
        if(treeArray[i] == undefined) {
            break;
        }
        const layer = createTreeLayer(treeArray[i], allConnections, allQuestions);
        if(i == 5) {
            break;
        }
        treeArray[i+1] = layer;
        i += 3;
    }
    return treeArray;
}

function createTreeLayer(layer: Object[][], allConnections: any[], allQuestions: any[]) {
    const data = layer.flat();
    let newLayer: Object[][] = [];
    let index = 0;
    for(let i = 0; i < data.length; i++) {
        index++;
        let entry: Object[] = [];
        const connections = findConnection(data[i], allConnections);
        if(connections == -1 || connections == -2) {
            continue;
        }
        for(const key in connections) {
            if(connections[key] == "") {
                continue;
            } else {
                for(let k = 0; k < allQuestions.length; k++) {
                    if(allQuestions[k]._id.equals(connections[key])) {
                        entry.push(createQuestionResponse(allQuestions[k])); 
                        break;
                    }
                }
            }
        }
        newLayer.push(entry); 
    }
    return newLayer;
}

function findConnection(question: any, allConnections: any[]) {
    if(question == "empty") {
        return -2;
    }
    if(question == "") {
        return -1;
    }
    for(let i = 0; i < allConnections.length; i++) {
        if(allConnections[i].question.equals(question.id)) {
            return allConnections[i].children;
        }
    }
    return -1;
}

async function moveCatalogInCourses(adminCourses: number[], catalogInCourseCollection: mongoDB.Collection,
                                     courseIdObject: mongoDB.ObjectId, catalogIdObject: mongoDB.ObjectId) {
    const checkQuery = {
        course: {$in: adminCourses},
        catalog: catalogIdObject
    }
    const res = await catalogInCourseCollection.findOne(checkQuery);
    if(res == null || res.length == 0) {
        return -1;
    }
    const notChangedQuery = {
        course: courseIdObject,
        catalog: catalogIdObject
    }
    const alreadyExist = catalogInCourseCollection.findOne(notChangedQuery);
    console.log("alreadyExist");
    console.log(alreadyExist);
    if( alreadyExist !== null) {
        return 0;
    }

    return 0;
}
