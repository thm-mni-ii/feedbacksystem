import { Jwt, JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  getAdminCourseRoles,
  getAllQuestionsFromCatalogs,
  getCatalogPermission,
  getAllCatalogs,
  checkQuestionAccess,
  getFirstQuestionInCatalog,
  createQuestionResponse,
  getCurrentSession,
  getDocentCourseRoles,
  IsOwner,
  getStudentCourseRoles,
  numberOfQuestionsAhead,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import { Access, AnswerScore, CatalogAccess, SessionStatus } from "../utils/enum";
import { Question } from "../model/Question";
import { authenticate, authenticateInCatalog } from "../authenticate";
type questionInsertionType = Omit<Question, "_id">;

export async function getQuestionById(
  questionId: string,
  tokenData: JwtPayload
) {
  const database: mongoDB.Db = await connect();
  const collection: mongoDB.Collection = database.collection("question");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const query = {
    _id: new mongoDB.ObjectId(questionId),
  };
  if(authenticate(tokenData, Access.moderator)) {
    const data = await collection.findOne(query);
    if (data !== null) {
      return data;
    }
    return -1;
  }
  const adminCourses = getAdminCourseRoles(tokenData);
  const catalogWithQuestion = await checkQuestionAccess(
    new mongoDB.ObjectId(questionId),
    adminCourses,
    catalogInCourseCollection,
    questionInCatalogCollection
  );
  if (catalogWithQuestion === false) {
    return -1;
  }
}

export async function addQuestionToCatalog(
  tokenData: JwtPayload,
  questionId: string,
  catalogId: string,
  children: any
) {
    console.log(questionId);
    console.log(catalogId);
  if(! await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    return -1;
  }
  const questionIdObject = new mongoDB.ObjectId(questionId);
  const catalogIdObject = new mongoDB.ObjectId(catalogId);
  const database: mongoDB.Db = await connect();
    database.collection("catalogInCourse");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const insert = {
    catalog: catalogIdObject,
    question: questionIdObject,
    children: children,
  };
  const result = await questionInCatalogCollection.insertOne(insert);
  console.log(result);
  const res = {
      id: result.insertedId
  }
  return res;
}

export async function removeQuestionFromCatalog(
  tokenData: JwtPayload,
  questionId: string
) {
    console.log("WSSSSSSSSSSSSSSSSSSSSSSS");
    console.log(tokenData);
    console.log(questionId);
    console.log("WSSSSSSSSSSSSSSSSSSSSSSS");
  const database: mongoDB.Db = await connect();
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const questionIdObject = new mongoDB.ObjectId(questionId);
  const query = {
    _id: questionIdObject,
  };
  const data = await questionInCatalogCollection.findOne(query);
  if(data === null) {
      return -1;
  }
  if(!await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, data.catalog)) {
    return -1;
  }
  const result = await questionInCatalogCollection.deleteOne(query);
  const filter = {
      "children.question": questionIdObject
  }
  const update: any = {
    $pull: {
      "children": {
        "question": questionIdObject
      }
    }
  }
  console.log(update);
  const res2 = await questionInCatalogCollection.updateOne(filter, update);
  console.log(res2);
  console.log(result);
  return result;
}

export async function deleteQuestionById(
  questionId: string,
  tokenData: JwtPayload
) {
  const questionIdObject = new mongoDB.ObjectId(questionId);
  const query = {
    _id: new mongoDB.ObjectId(questionId),
  };
  const database: mongoDB.Db = await connect();
  const collection: mongoDB.Collection = database.collection("question");
    database.collection("catalogInCourse");
  const questionCollection: mongoDB.Collection = database.collection("question");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  if(!IsOwner(questionId, tokenData, questionCollection)) {
    return -1;
  }
  const questionInCatalogQuery = {
    question: questionIdObject,
  };
  await questionInCatalogCollection.deleteMany(questionInCatalogQuery);
  const data = await collection.deleteOne(query);
  return data;
}

export async function postQuestion(question: Question, tokenData: JwtPayload) {
  if(!authenticate(tokenData, Access.moderator)) {
    return 1;
  }
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  console.log(tokenData);
  let questionInsertion: any = question;
  delete questionInsertion.id;
  delete questionInsertion._id;
  questionInsertion.owner = tokenData.id;
  console.log(questionInsertion);
  const result = await questionCollection.insertOne(questionInsertion);
  return { id: result.insertedId };
}

export async function putQuestion(question: Question, tokenData: JwtPayload) {
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  if(!(await IsOwner(question._id as unknown as string, tokenData, questionCollection))) {
      if(!authenticate(tokenData, Access.admin)) {
          return -1;
      }
  }
  const filter = {
    _id: new mongoDB.ObjectId(question._id),
  };
  const questionWithoutId: any = question;
  delete questionWithoutId._id;
  const res = await questionCollection.replaceOne(filter, questionWithoutId);
  return res;
}

export async function getAllQuestions(tokenData: JwtPayload) {
  if(authenticate(tokenData, Access.moderator)) {
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection =
      database.collection("question");
    const allQuestion = await questionCollection.find().toArray();
    console.log(allQuestion);
    return allQuestion;
  }
  const adminCourses = getAdminCourseRoles(tokenData);
  if (adminCourses.length === 0) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const allCatalogs = await getAllCatalogs(
    adminCourses,
    catalogInCourseCollection
  );
  const allQuestion = await getAllQuestionsFromCatalogs(
    questionInCatalogCollection,
    questionCollection,
    allCatalogs
  );
  return allQuestion;
  
}

export async function getCurrentQuestion(
  tokenData: JwtPayload,
  catalogId: string
) {
  if(!await authenticateInCatalog(tokenData, CatalogAccess.studentInCatalog, catalogId)) {
      return -1;
  }
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const submissionCollection: mongoDB.Collection =
    database.collection("submission");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  let newQuestionId = await getQuestionId(
    tokenData,
    submissionCollection,
    catalogId,
    questionInCatalogCollection
  );
  let newQuestion: any = {};
  if (newQuestionId == -1) {
    return { catalog: "over" };
  }
  if (newQuestionId == 0) {
    newQuestion = await getFirstQuestionInCatalog(
      questionCollection,
      questionInCatalogCollection,
      catalogId
    );
  } else {
    const getQuestionQuery = {
      _id: newQuestionId,
    };
    newQuestion = await questionCollection.findOne(getQuestionQuery);
  }
  if (newQuestion == null) {
    return -1;
  }
  newQuestion.questionsLeft = await numberOfQuestionsAhead(catalogId, newQuestion._id.toString());
  return createQuestionResponse(newQuestion);
}

async function getQuestionId(
  tokenData: JwtPayload,
  submissionCollection: mongoDB.Collection,
  catalogId: string,
  questionInCatalogCollection: mongoDB.Collection
) {
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const catalogQuery = {
    catalog: catalogIdObject,
  };
  const catalog: any = await questionInCatalogCollection
    .find(catalogQuery)
    .toArray();
  const questions: mongoDB.ObjectId[] = catalog.map(
    (entry: any) => entry.question
  );
  const query = {
    user: tokenData.id,
    question: { $in: questions },
  };
  const lastSubmission: any = await submissionCollection
    .find(query)
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();
  if (lastSubmission == null || lastSubmission.length == 0) {
    return 0;
  }
  const evaluation = lastSubmission[0].evaluation;
  const questionQuery = {
    question: lastSubmission[0].question,
  };
  const priorQuestion = await questionInCatalogCollection.findOne(
    questionQuery
  );
  if (priorQuestion == null) {
    return 0;
  }
  const forwarding = priorQuestion.children;
  if (forwarding == null || forwarding.length == 0) {
    return -1;
  }
  if (evaluation == AnswerScore.correct) {
    return forwarding[AnswerScore.correct];
  }
  if (evaluation == AnswerScore.incorrect) {
    return forwarding[AnswerScore.incorrect];
  }
  return -1;
}

export async function copyQuestion(tokenData: JwtPayload, questionId: string) {
  if(!authenticate(tokenData, Access.moderator)) {
      return -1;
  }
  const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  const questionQuery = {
    _id: questionIdObject,
  };
  console.log(questionQuery);
  const question: any = await questionCollection.findOne(questionQuery);
  if (question === null) {
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

export async function copyQuestionToCatalog(
  tokenData: JwtPayload,
  questionId: string,
  catalogId: string,
  children: string[]
) {
  if(!authenticate(tokenData, Access.moderator)) {
      return -1;
  }
  const adminCourses = getAdminCourseRoles(tokenData);
  const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const permission = await getCatalogPermission(adminCourses, catalogId);
  if (!permission) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  const questionInCatalogCollection = database.collection("questionInCatalog");
  const questionQuery = {
    _id: questionIdObject,
  };
  const question: any = await questionCollection.findOne(questionQuery);
  question.owner = tokenData.user;
  delete question._id;
  console.log(question);
  const data = await questionCollection.insertOne(question);
  console.log(data);
  const entry = {
    catalog: catalogIdObject,
    question: data.insertedId,
    children: children,
  };
  const result = await questionInCatalogCollection.insertOne(entry);
  console.log(result);
  return data.insertedId;
}

export async function getCurrentSessionQuestion(tokenData: JwtPayload) {
  const session = await getCurrentSession(tokenData.id);
  if (session.status !== SessionStatus.ongoing) {
    return -1;
  }
  if (session === null) {
    return -1;
  }
  return getCurrentQuestion(tokenData, session.catalogId);
}
