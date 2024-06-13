import { Jwt, JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getAdminCourseRoles, getAllQuestionsFromCatalogs, getCatalogPermission, getAllCatalogs, checkQuestionAccess, getUserCourseRoles, getFirstQuestionInCatalog} from "../utils/utils";
import * as mongoDB from "mongodb";
import { AnswerScore } from "../utils/enum";

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
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogWithQuestion = await checkQuestionAccess(new mongoDB.ObjectId(questionId), adminCourses, courseCollection, catalogCollection);
    if(catalogWithQuestion === null || catalogWithQuestion.length === 0) {
        return -1;
    }
    const questionInCatalogQuery = {
        question: questionIdObject
    }
    await questionInCatalogCollection.deleteMany(questionInCatalogQuery);
    const data = await collection.deleteOne(query);
    return data;
}

export async function postQuestion(data: JSON, tokenData: JwtPayload, catalog: string, children: string[], weigthing: number) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const searchQuery = {
        courseId: {$in: adminCourses}, 
        catalogs: catalogIdObject
    };
    const database: mongoDB.Db = await connect();
    const courseCollection: mongoDB.Collection = database.collection("course");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const result = await courseCollection.find(searchQuery).toArray();
    if (result.length > 0) {
        const collection_question: mongoDB.Collection = database.collection("question");
        const response = await collection_question.insertOne(data);
        const entry = {
            catalog: catalogIdObject,
            weigthing: weigthing,
            children: children
        };
        questionInCatalogCollection.insertOne(entry);
    } else {
        return -1;
    }
    return data;
}

export async function putQuestion(questionId: string, data: JSON, tokenData: JwtPayload, catalog: string) {
    const adminCourses = getAdminCourseRoles(tokenData); 
    const database: mongoDB.Db = await connect();
    const courseResult = await getCatalogPermission(adminCourses, catalog);
    if (!courseResult) {
        return -1;
    }
    const courseCollection: mongoDB.Collection = database.collection("course");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
    const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
    const catalogQuery = {
        catalog: catalogIdObject,
        question: questionIdObject
    };
    const result = await questionInCatalogCollection.findOne(catalogQuery);
    if (result == null || result.length === 0) {
        const move = await moveQuestionInCatalogs(adminCourses, courseCollection, questionIdObject, catalogIdObject, questionInCatalogCollection);
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
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const allCatalogs = await getAllCatalogs(adminCourses, courseCollection); 
    const allQuestion = await getAllQuestionsFromCatalogs(questionInCatalogCollection , allCatalogs);
    return allQuestion;
}

export async function getCurrentQuestion(tokenData: JwtPayload, catalogId: string) {
    const userCourses = getUserCourseRoles(tokenData);
    const access = await getCatalogPermission(userCourses, catalogId);
    if(!access) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const questionCollection: mongoDB.Collection = database.collection("question");
    const submissionCollection: mongoDB.Collection = database.collection("submission");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    let newQuestionId = await getQuestion(tokenData, questionCollection, submissionCollection, catalogId, questionInCatalogCollection);
    let newQuestion: any = {};
    if(newQuestionId == -1) {
        return {"catalog": "over"};
    }
    if(newQuestionId == 0) {
        console.log("JUSU");
        newQuestion = await getFirstQuestionInCatalog(questionCollection, questionInCatalogCollection, catalogId);
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
        returnQuestion.answers.push(newQuestion.answers[i].text);
    }
    return returnQuestion;
}



async function getQuestion(tokenData: JwtPayload, questionCollection: mongoDB.Collection, submissionCollection: mongoDB.Collection, catalogId: string, 
                           questionInCatalogCollection: mongoDB.Collection) {
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const catalogQuery = {
        catalog: catalogIdObject
    }
    console.log(catalogQuery);
    const catalog: any = await questionInCatalogCollection.find(catalogQuery).toArray();
    console.log(catalog);
    const questions: mongoDB.ObjectId[] = catalog.map((entry: any) => entry.question);
    console.log(questions);
    const query = {
        user: tokenData.id,
        question: {$in : questions}
    }
    const lastSubmission: any = await submissionCollection.find(query).sort({ timestamp: -1}).limit(1).toArray();
    console.log("lastSubmission");
    console.log(lastSubmission);
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
    console.log(forwarding);
    console.log(evaluation);
    if(evaluation == AnswerScore.correct) {
        return forwarding[AnswerScore.correct];
    }
    if(evaluation == AnswerScore.incorrect) {
        return forwarding[AnswerScore.incorrect];
    }
    return -1;
}

async function moveQuestionInCatalogs(adminCourses: number[], courseCollection: mongoDB.Collection,
                                      questionIdObject: mongoDB.ObjectId, catalogIdObject: mongoDB.ObjectId, questionInCatalogCollection: mongoDB.Collection) {
    const catalogWithQuestion: any = checkQuestionAccess(questionIdObject, adminCourses, courseCollection, questionInCatalogCollection);
    if(catalogWithQuestion === null || catalogWithQuestion.length === 0) {
        return -1;
    }
    const filter = {
        question: questionIdObject,
    }
    const update = {
        $set: { catalog: catalogIdObject } as mongoDB.UpdateFilter<any>
    };
    await questionInCatalogCollection.updateOne(filter, update);
    return 0;
}

