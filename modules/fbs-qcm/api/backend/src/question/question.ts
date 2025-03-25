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
  getSessionInformation,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import {
  Access,
  AnswerScore,
  CatalogAccess,
  SessionStatus,
} from "../utils/enum";
import { Question } from "../model/Question";
import { authenticate, authenticateInCatalog } from "../authenticate";
import { questionInCatalogObject } from "../model/utilInterfaces";
type questionInsertionType = Omit<Question, "_id">;

interface Element {
  needed_score: number;
  transition: string;
  question: string;
}

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
  if (authenticate(tokenData, Access.moderator)) {
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
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      catalogId
    ))
  ) {
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
  const res = {
    id: result.insertedId,
  };
  return res;
}

export async function removeQuestionFromCatalog(
  tokenData: JwtPayload,
  questionId: string
) {
  const database: mongoDB.Db = await connect();
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const questionIdObject = new mongoDB.ObjectId(questionId);
  const query = {
    _id: questionIdObject,
  };
  const data: questionInCatalogObject | null =
    (await questionInCatalogCollection.findOne(
      query
    )) as unknown as questionInCatalogObject;
  if (data === null) {
    return -1;
  }
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      data.catalog
    ))
  ) {
    return -1;
  }
  //const result = await questionInCatalogCollection.deleteOne(query);
  await deleteQuestionAndChildren(data);
  const filter = {
    "children.question": questionIdObject,
  };
  const update: any = {
    $pull: {
      children: {
        question: questionIdObject,
      },
    },
  };
  const res2 = await questionInCatalogCollection.updateOne(filter, update);
  return;
}

async function deleteQuestionAndChildren(question: questionInCatalogObject) {
  const database: mongoDB.Db = await connect();
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  for (let i = 0; i < question.children.length; i++) {
    const query = {
      _id: new mongoDB.ObjectId(question.children[i].question),
    };
    const data: questionInCatalogObject =
      (await questionInCatalogCollection.findOne(
        query
      )) as unknown as questionInCatalogObject;
    if (data === undefined) {
      continue;
    }
    await deleteQuestionAndChildren(data);
  }
  const deleteQuery = {
    _id: new mongoDB.ObjectId(question._id),
  };
  questionInCatalogCollection.deleteOne(deleteQuery);
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
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  if (!IsOwner(questionId, tokenData, questionCollection)) {
    return -1;
  }
  const questionInCatalogQuery = {
    question: questionIdObject,
  };
  await questionInCatalogCollection.deleteMany(questionInCatalogQuery);
  const data = await collection.deleteOne(query);
  return data;
}

export async function postSingleQuestion(
  question: Question,
  tokenData: JwtPayload
) {
  if (!authenticate(tokenData, Access.moderator)) {
    return 1;
  }
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  let questionInsertion: any = question;
  delete questionInsertion.id;
  delete questionInsertion._id;
  questionInsertion.owner = tokenData.id;
  questionInsertion.createdAt = new Date; 
  questionInsertion.lastEdited = new Date; 
  const result = await questionCollection.insertOne(questionInsertion);
  return { id: result.insertedId };
}

export async function editSingleQuestion(
  question: Question,
  tokenData: JwtPayload
) {
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  if (
    !(await IsOwner(
      question._id as unknown as string,
      tokenData,
      questionCollection
    ))
  ) {
    if (!authenticate(tokenData, Access.admin)) {
      return -1;
    }
  }
  const filter = {
    _id: new mongoDB.ObjectId(question._id),
  };
  const questionWithoutId: any = question;
  delete questionWithoutId._id;
  questionWithoutId.lastEdited = new Date;
  const res = await questionCollection.replaceOne(filter, questionWithoutId);
  return res;
}

export async function getAllQuestions(tokenData: JwtPayload) {
  if (authenticate(tokenData, Access.moderator)) {
    const database: mongoDB.Db = await connect();
    const questionCollection: mongoDB.Collection =
      database.collection("question");
    const allQuestion = await questionCollection.find().sort({ lastEdited: -1 }).toArray();
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
  sessionId: string
) {
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const submissionCollection: mongoDB.Collection =
    database.collection("submission");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const session = await getSessionInformation(sessionId);
  console.log(session);
  if(session === null) {
    return -1;
  }
  if(session.status !== SessionStatus.ongoing) {
    return -2;
  }
  const catalogId = session.catalogId;
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.studentInCatalog,
      catalogId
    ))
  ) {
    return -1;
  }
  let newQuestionInCatalogId: any = await getQuestionId(
    tokenData,
    submissionCollection,
    questionInCatalogCollection,
    sessionId
  );
  let newQuestion: any = {};
  if (newQuestionInCatalogId === -1) {
    return { catalog: "over" };
  }
  if (newQuestionInCatalogId === 0) {
    newQuestion = await getFirstQuestionInCatalog(
      questionCollection,
      questionInCatalogCollection,
      catalogId
    );
    newQuestionInCatalogId = newQuestion._id;
  } else {
    const getQuestionQuery = {
      _id: newQuestionInCatalogId,
    };
    const questionId = await questionInCatalogCollection.findOne(
      getQuestionQuery
    );
    if (questionId === null) {
      return -1;
    }
    const questionQuery = {
      _id: questionId.question,
    };
    newQuestion = await questionCollection.findOne(questionQuery);
  }
  if (newQuestion == null) {
    return -1;
  }
  //  newQuestion.questionsLeft = await numberOfQuestionsAhead(
  //    catalogId,
  //    newQuestion._id
  //  );
  return createQuestionResponse(newQuestion, newQuestionInCatalogId);
}

async function getQuestionId(
  tokenData: JwtPayload,
  submissionCollection: mongoDB.Collection,
  questionInCatalogCollection: mongoDB.Collection,
  session: any 
) {
  const query = { 
    user: tokenData.id,
    session: session._id
  };
  const lastSubmission: any = await submissionCollection
    .find(query)
    .sort({ timeStamp: -1 })
    .limit(1)
    .toArray();
  if (lastSubmission == null || lastSubmission.length == 0) {
    console.log("Keine voherigen Abgaben");
    return 0;
  }
  const evaluation = lastSubmission[0].evaluation;
  const questionQuery = {
    _id: lastSubmission[0].question,
  };
  const priorQuestion = await questionInCatalogCollection.findOne(
    questionQuery
  );
  if (priorQuestion == null) {
    console.log("Keine Frage im Katalog vorher");
    return 0;
  }
  const forwarding = priorQuestion.children;
  if (forwarding == null || forwarding.length == 0) {
    return -1;
  }
  let returnValue: any = -1;
  forwarding.forEach(function (element: Element) {
    if (element.transition === "correct") {
      if (evaluation.score * 100 >= element.needed_score) {
        returnValue = element.question;
      }
    }
    if (element.transition === "incorrect") {
      if (evaluation.score * 100 <= element.needed_score) {
        returnValue = element.question;
      }
    }
  });
  forwarding.forEach(function (element: Element) {
    if (element.transition === "partial") {
      returnValue = element.question;
    }
  });
  return returnValue;
}

export async function copyQuestionWithNewOwner(
  tokenData: JwtPayload,
  questionId: string
) {
  if (!authenticate(tokenData, Access.moderator)) {
    return -1;
  }
  const questionIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(questionId);
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  const questionQuery = {
    _id: questionIdObject,
  };
  const question: any = await questionCollection.findOne(questionQuery);
  if (question === null) {
    return -2;
  }
  question.owner = tokenData.user;
  delete question._id;
  const data = await questionCollection.insertOne(question);
  return data.insertedId;
}

export async function copyQuestionToCatalogWithNewOwner(
  tokenData: JwtPayload,
  questionId: string,
  catalogId: string,
  children: string[]
) {
  if (!authenticate(tokenData, Access.moderator)) {
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
  const data = await questionCollection.insertOne(question);
  const entry = {
    catalog: catalogIdObject,
    question: data.insertedId,
    children: children,
  };
  const result = await questionInCatalogCollection.insertOne(entry);
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
