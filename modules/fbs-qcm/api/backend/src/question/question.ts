import { Jwt, JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getAdminCourseRoles, getElementFromArray, getCatalogPermission, getAllCatalogs, checkQuestionAccess, getUserCourseRoles} from "../utils/utils";
import * as mongoDB from "mongodb";

interface ReturnQuestion {
    id: mongoDB.ObjectId;
    questiontext: string;
    questiontype: string;
    answers: string[]; // Array of strings for hobbies
}

export async function getQuestionById(questionId: string, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const query  = {
        _id:new mongoDB.ObjectId(questionId)
    };
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const catalogWithQuestion = await checkQuestionAccess(new mongoDB.ObjectId(questionId), adminCourses, courseCollection, catalogCollection);
    if(catalogWithQuestion === null || catalogWithQuestion.length === 0) {
        return -1;
    }
    const data = await collection.findOne(query);
    if(data !== null){
        return data;
    }
    return -1;
}

export async function deleteQuestionById(questionId: string, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const questionIdObject = new mongoDB.ObjectId(questionId);
    const query = {
        _id: new mongoDB.ObjectId(questionId)
    };
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const catalogWithQuestion = await checkQuestionAccess(new mongoDB.ObjectId(questionId), adminCourses, courseCollection, catalogCollection);
    if(catalogWithQuestion === null || catalogWithQuestion.length === 0) {
        return -1;
    }
    const filter = {
        _id: catalogWithQuestion._id
    }
    const update = {
        $pull: { questions: questionIdObject } as mongoDB.UpdateFilter<any>
    };
    catalogCollection.updateOne(filter, update);
    const data = await collection.deleteOne(query);
    return data;
}

export async function postQuestion(data: JSON, tokenData: JwtPayload, catalog: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const searchQuery = {
    courseId: {$in: adminCourses}, 
    catalogs: catalogIdObject
    };
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const collection: mongoDB.Collection = database.collection("course");
    const result = await collection.find(searchQuery).toArray();
    if (result.length > 0) {
        const collection_question: mongoDB.Collection = database.collection("question");
        const response = await collection_question.insertOne(data);
        const filter = {
            _id: catalogIdObject
        };
        const update = {
            $push: { questions: response.insertedId } as mongoDB.UpdateFilter<any>
        };
        catalogCollection.updateOne(filter, update);
    } else {
        return -1;
    }
    return data;
}

export async function putQuestion(questionId: string, data: JSON, tokenData: JwtPayload, catalog: string) {
    const adminCourses = getAdminCourseRoles(tokenData); 
    const database: mongoDB.Db = await connect();
    const courseResult = await getCatalogPermission(adminCourses, catalog);
    if (courseResult == null || courseResult.length == 0) {
        return -1;
    }
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const courseCollection: mongoDB.Collection = database.collection("course");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
    const catalogQuery = {
        _id: catalogIdObject,
        questions: questionIdObject
    };
    const result = await catalogCollection.find(catalogQuery).toArray();
    if (result.length === 0) {
        const move = await moveQuestionInCatalogs(adminCourses, courseCollection, catalogCollection, questionIdObject, catalogIdObject);
        if( move === -1) {
            return -1;
        }
    }
    const filter = {
        _id: questionIdObject
    }
    const res = await questionCollection.replaceOne(filter, data); 
    return res;
}

export async function getAllQuestions(tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const courseCollection: mongoDB.Collection = database.collection("course");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const allCatalogs = await getAllCatalogs(adminCourses, courseCollection); 
    const allQuestion = await getAllQuestionsFromCatalogs(catalogCollection, questionCollection, allCatalogs);
    return allQuestion;
}

export async function getCurrentQuestion(tokenData: JwtPayload, catalogId: string) {
    const userCourses = getUserCourseRoles(tokenData);
    const access = await getCatalogPermission(userCourses, catalogId);
    if(access == null || access.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const submissionCollection: mongoDB.Collection = database.collection("submission");
    let newQuestionId = await getQuestion(tokenData, questionCollection, submissionCollection, catalogId, catalogCollection);
    let newQuestion: any = {};
    if(newQuestion == -1) {
        return {"catalog": "over"};
    }
    if(newQuestionId == 0) {
        newQuestion = await getFirstQuestionInCatalog(questionCollection, catalogCollection, catalogId);
    } else {
        const getQuestionQuery = {
            _id: newQuestionId
        }
        newQuestion = await questionCollection.findOne(getQuestionQuery);
    }
    if(newQuestion == null) {
        return -1;
    }
    return createQuestionResponse(newQuestionId, newQuestion);
}

function createQuestionResponse(newQuestionId: mongoDB.ObjectId, newQuestion: any) {
    const returnQuestion: ReturnQuestion = {
        id: newQuestionId,
        questiontext: newQuestion.questiontext,
        questiontype: newQuestion.questiontype,
        answers: []
    }
    for(let i = 0; i < newQuestion.answers.length; i++) {
        returnQuestion.answers.push(newQuestion.answers[i]);
    }
    return returnQuestion;
}

async function getFirstQuestionInCatalog(questionCollection: mongoDB.Collection, catalogCollection: mongoDB.Collection, catalogId: string) {
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const catalogQuery = {
        _id: catalogIdObject
    }
    const catalog = await catalogCollection.findOne(catalogQuery);
    if(catalog == null || catalog.length == 0) {
        return -1;
    }
    const question = catalog.questions;
    const questionQuery = {
        _id: {$in: question}
    }
    const allQuestionsInCatalog = await questionCollection.find(questionQuery).toArray();
    let usedQuestion: mongoDB.ObjectId[] = [];
    for(let i = 0;i < allQuestionsInCatalog.length; i++) {
        for( const key in allQuestionsInCatalog[i].children) {
            usedQuestion = addIfNotInList(usedQuestion, allQuestionsInCatalog[i].children[key]);
        }
    }
    const findFirstQuestion = {
        _id: {$nin: usedQuestion}
    }
    const firstQuestion = await questionCollection.findOne(findFirstQuestion);
    return firstQuestion;
}

function addIfNotInList(list: mongoDB.ObjectId[], entry: mongoDB.ObjectId) {
    const exists = list.some(existingItem => existingItem === entry);
    if(!exists) {
        list.push(entry);
    }
    return list;
}

async function getQuestion(tokenData: JwtPayload, questionCollection: mongoDB.Collection, submissionCollection: mongoDB.Collection, catalogId: string, catalogCollection: mongoDB.Collection) {
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const catalogQuery = {
        _id: catalogIdObject
    }
    const catalog: any = await catalogCollection.findOne(catalogQuery);
    const query = {
        user: tokenData.id,
        question: {$in : catalog.questions}
    }
    const lastSubmission: any = await submissionCollection.find(query).sort({ timestamp: -1}).limit(1).toArray();
    if(lastSubmission == null || lastSubmission.length == 0) {
        return 0;
    }
    const evaluation = lastSubmission[0].evaluation; 
    const questionQuery = {
        _id: lastSubmission[0].question
    }
    const priorQuestion = await questionCollection.findOne(questionQuery); 
    if(priorQuestion == null) {
        return 0;
    }
    const forwarding = priorQuestion.children;
    if(forwarding == null || forwarding.length == 0) {
        return -1;
    }
    if(evaluation == true) {
        return forwarding[100];
    }
    if(evaluation == false) {
        return forwarding[0];
    }
}

async function moveQuestionInCatalogs(adminCourses: number[], courseCollection: mongoDB.Collection, catalogCollection: mongoDB.Collection, 
                                      questionIdObject: mongoDB.ObjectId, catalogIdObject: mongoDB.ObjectId) {
    const catalogWithQuestion: any = checkQuestionAccess(questionIdObject, adminCourses, courseCollection, catalogCollection);
    if(catalogWithQuestion === null || catalogWithQuestion.length === 0) {
        return -1;
    }
    const index = getElementFromArray(catalogWithQuestion.questions, questionIdObject);
    catalogWithQuestion.questions.splice(index, 1);
    const filter = {
        _id: catalogWithQuestion._id
    }
    await catalogCollection.replaceOne(filter, catalogWithQuestion);
    const newCatalogQuery = {
        _id: catalogIdObject
    };
    const update = {
        $push: { questions: questionIdObject } as mongoDB.UpdateFilter<any>
    };
    await catalogCollection.updateOne(newCatalogQuery, update);
    return 0;
}

async function getAllQuestionsFromCatalogs(catalogCollection: mongoDB.Collection,
                                           questionCollection: mongoDB.Collection, catalogs: string[]) {
    const catalogIds: mongoDB.ObjectId[] = [];
    for (let index = 0; index < catalogs.length; index++) {
        catalogIds.push(new mongoDB.ObjectId(catalogs[index]));
    }
    const ownCatalogQuery = {
        _id : {$in : catalogIds}
    }
    const allCatalogs: any = await catalogCollection.find(ownCatalogQuery).toArray();
    let questions: mongoDB.ObjectId[] = []; 
    for(let i = 0; i < allCatalogs.length; i++) {
        for(let j = 0; j < allCatalogs[i].questions.length; j++) {
            questions.push(allCatalogs[i].questions[j]);
        }
    }
    const findQuestions = {
        _id: {$in: questions}
    }
    const accesibaleQuestions = await questionCollection.find(findQuestions).toArray();
    return accesibaleQuestions;
}
