import { Jwt, JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getAdminCourseRoles, getAllQuestionsFromCatalogs, getCatalogPermission, getAllCatalogs, checkQuestionAccess, getUserCourseRoles, getFirstQuestionInCatalog,
createQuestionResponse, getCurrentSession,
IsOwner,
getDocentCourseRoles} from "../utils/utils";
import * as mongoDB from "mongodb";
import { AnswerScore, SessionStatus } from "../utils/enum";
import { Question } from "../model/Question";
type questionInsertionType = Omit<Question, 'id'>;

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
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogWithQuestion = await checkQuestionAccess(new mongoDB.ObjectId(questionId), adminCourses, catalogInCourseCollection, questionInCatalogCollection);
    if(catalogWithQuestion === false) {
        return -1;
    }
    const data = await collection.findOne(query);
    if(data !== null){
        return data;
    }
    return -1;
}

export async function addQuestionToCatalog(tokenData: JwtPayload, questionId: string, catalogId: string, children: any) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const questionIdObject = new mongoDB.ObjectId(questionId);
    const catalogIdObject = new mongoDB.ObjectId(catalogId);
    const database: mongoDB.Db = await connect();
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const access = await checkQuestionAccess(questionIdObject, adminCourses, catalogInCourseCollection, questionInCatalogCollection);
    if(!access) {
        return -1;
    }
    const checkQuery = {
        catalog: catalogIdObject,
        question: questionIdObject
    }
    const entry = await questionInCatalogCollection.findOne(checkQuery);
    if(entry != null) {
        return -2;
    }
    const permission = getCatalogPermission(adminCourses, catalogId);
    if( !permission ) {
        return -1;
    }
    const insert = {
        catalog: catalogIdObject,
        question: questionIdObject,
        children: children
    }
    const result = await questionInCatalogCollection.insertOne(insert);
    console.log(result);
    return result;
}

export async function removeQuestionFromCatalog(tokenData: JwtPayload, questionId: string, catalogId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const permission = getCatalogPermission(adminCourses, catalogId);
    if( !permission ) {
        return -1;
    }
    const questionIdObject = new mongoDB.ObjectId(questionId);
    const query = {
        question: questionIdObject
    }
    const result = await questionInCatalogCollection.deleteOne(query);
    console.log(result);
    return result;
}

export async function deleteQuestionById(questionId: string, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const questionIdObject = new mongoDB.ObjectId(questionId);
    const query = {
        _id: new mongoDB.ObjectId(questionId)
    };
    const database: mongoDB.Db = await connect();
    const collection: mongoDB.Collection = database.collection("question");
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const catalogCollection: mongoDB.Collection = database.collection("catalog");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const catalogWithQuestion = await checkQuestionAccess(new mongoDB.ObjectId(questionId), adminCourses, catalogInCourseCollection, catalogCollection);
    if(catalogWithQuestion === false) {
        return -1;
    }
    const questionInCatalogQuery = {
        question: questionIdObject
    }
    await questionInCatalogCollection.deleteMany(questionInCatalogQuery);
    const data = await collection.deleteOne(query);
    return data;
}

export async function postQuestion(question: Question, tokenData: JwtPayload) {
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses === null) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection = database.collection("question");
    const questionInsertion: questionInsertionType= question;
    questionInsertion.owner = tokenData.user;
    const result = await questionCollection.insertOne(questionInsertion);
    return result.insertedId;
}

export async function putQuestion(question: Question, tokenData: JwtPayload) {
    const database: mongoDB.Db = await connect();
    const questionCollection = database.collection("question");
    if( ! await IsOwner(question, tokenData, questionCollection)) {
        return -1;
    }
    const filter = {
        _id: new mongoDB.ObjectId(question.id)
    }
    const questionWithoutId: questionInsertionType = question; 
    const res = await questionCollection.replaceOne(filter, questionWithoutId); 
    return res;
}

export async function getAllQuestions(tokenData: JwtPayload) {
    const docentcourses = getDocentCourseRoles(tokenData);
    if(docentcourses.length > 0) {
        const database: mongoDB.Db = await connect();
        const questionCollection: mongoDB.Collection = database.collection("question");
        const allQuestion = await questionCollection.find().toArray();
        console.log(allQuestion);
        return allQuestion;
    }
    const adminCourses = getAdminCourseRoles(tokenData);
    if(adminCourses.length === 0) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const allCatalogs = await getAllCatalogs(adminCourses, catalogInCourseCollection); 
    const allQuestion = await getAllQuestionsFromCatalogs(questionInCatalogCollection , allCatalogs);
    return allQuestion;
}

export async function getCurrentQuestion(tokenData: JwtPayload, catalogId: string) {
    console.log("------------------------------------------------------------------------------------------------------------------------------");
    console.log(tokenData);
    console.log(catalogId);
    const userCourses = getUserCourseRoles(tokenData);
    const access = await getCatalogPermission(userCourses, catalogId);
    if(!access) {
        return -1;
    }
    console.log("HIUERRRRRRRRRRRR");
    const database: mongoDB.Db = await connect();
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
    return createQuestionResponse(newQuestion);
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
        question: lastSubmission[0].question
    }
    const priorQuestion = await questionInCatalogCollection.findOne(questionQuery); 
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

export async function copyQuestion(tokenData: JwtPayload, questionId: string) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
    console.log(questionId);
    console.log(questionIdObject);
    const database: mongoDB.Db = await connect();
    const questionCollection = database.collection("question");
    const questionQuery = {
        _id: questionIdObject
    }
    console.log(questionQuery);
    const question: any = await questionCollection.findOne(questionQuery);
    if(question === null) {
        return -2;
    }
    console.log(question);
    question.owner = tokenData.user;
    delete question._id;
    console.log(question);
    const data = await questionCollection.insertOne(question);
    console.log(data);
    return data.insertedId;
}

export async function copyQuestionToCatalog(tokenData: JwtPayload, questionId: string, catalogId: string, children: string[]) {
    const adminCourses = getAdminCourseRoles(tokenData);
    const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
    const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
    const permission = await getCatalogPermission(adminCourses, catalogId);
    if(!permission) {
        return -1;
    }
    const database: mongoDB.Db = await connect();
    const questionCollection = database.collection("question");
    const questionInCatalogCollection = database.collection("questionInCatalog");
    const questionQuery = {
        _id: questionIdObject
    }
    const question: any = await questionCollection.findOne(questionQuery);
    question.owner = tokenData.user;
    delete question._id;
    console.log(question);
    const data = await questionCollection.insertOne(question);
    console.log(data);
    const entry = {
        catalog: catalogIdObject,
        question: data.insertedId,
        children: children
    }
    const result = await questionInCatalogCollection.insertOne(entry);
    console.log(result);
    return data.insertedId;
}
async function moveQuestionInCatalogs(adminCourses: number[], catalogInCourseCollection: mongoDB.Collection,
                                      questionIdObject: mongoDB.ObjectId, catalogIdObject: mongoDB.ObjectId, questionInCatalogCollection: mongoDB.Collection) {
    const catalogWithQuestion: any = checkQuestionAccess(questionIdObject, adminCourses, catalogInCourseCollection, questionInCatalogCollection);
    if(catalogWithQuestion === false) {
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

export async function getCurrentSessionQuestion(tokenData: JwtPayload) {
    console.log(tokenData);
    const session = await getCurrentSession(tokenData.id);
    console.log(session);
    if(session === null) {
        return -1;
    }
    console.log(session);
    console.log("--------------------------------------------------------------------------------------------------------------");
    return getCurrentQuestion(tokenData, session.catalogId);    
}

