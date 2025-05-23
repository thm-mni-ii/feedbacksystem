import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import * as mongoDB from "mongodb";
import { SessionStatus } from "./enum";
import { Question } from "../model/Question";
import QuestionType from "../enums/QuestionType";
import Choice from "../model/questionTypes/Choice";
import FillInTheBlanks from "../model/questionTypes/FillInTheBlanks";
import { questionInCatalogObject } from "../model/utilInterfaces";
import { Session } from "../session/sessionUtils";

interface ReturnChoiceQuestion {
  id: mongoDB.ObjectId;
  questiontext: string;
  questiontype: string;
  answers: string[];
}

export async function checkQuestionAccess(
  questionIdObject: mongoDB.ObjectId,
  adminCourses: number[],
  catalogInCourseCollection: mongoDB.Collection,
  questionInCatalogCollection: mongoDB.Collection
) {
  const allCatalogs: any = await getAllCatalogs(
    adminCourses,
    catalogInCourseCollection
  );
  console.log("allCatalogs");
  console.log(allCatalogs);
  const catalogIds: mongoDB.ObjectId[] = [];
  for (let index = 0; index < allCatalogs.length; index++) {
    catalogIds.push(new mongoDB.ObjectId(allCatalogs[index]));
  }
  const ownCatalogQuery = {
    question: questionIdObject,
    catalog: { $in: catalogIds },
  };
  console.log(ownCatalogQuery);
  const catalogWithQuestion = await questionInCatalogCollection
    .find(ownCatalogQuery)
    .toArray();
  console.log(catalogWithQuestion);
  if (catalogWithQuestion == null) {
    return false;
  }
  return true;
}

export async function getAllCatalogs(
  courses: number[],
  catalogInCourseCollection: mongoDB.Collection
) {
  console.log(courses);
  const courseQuery = {
    course: { $in: courses },
  };
  console.log("query");
  console.log(courseQuery);
  const catalogs = await catalogInCourseCollection.find(courseQuery).toArray();
  console.log(catalogs);
  const allCatalogs: string[] = [];

  for (let i = 0; i < catalogs.length; i++) {
    console.log("HALLO");
    console.log(catalogs);
    console.log(catalogs[i]);
    console.log(catalogs[i].catalog);
    allCatalogs.push(catalogs[i].catalog);
  }
  console.log("AllACTALOGS");
  console.log(allCatalogs);
  return allCatalogs;
}

export function getDocentCourseRoles(tokenData: JwtPayload) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "DOCENT") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}

export function getAdminCourseRoles(tokenData: JwtPayload) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "TUTOR" || role == "DOCENT") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}

export function getTutorCourseRoles(tokenData: JwtPayload) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "TUTOR") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}

export function getElementFromArray(
  array: mongoDB.ObjectId[],
  element: mongoDB.ObjectId
) {
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (JSON.stringify(array[i]) == JSON.stringify(element)) {
      index = i;
      break;
    }
  }
  return index;
}

export async function checkCourseAccess(
  tokenData: JwtPayload,
  courseId: string
) {
  const adminCourses = getAdminCourseRoles(tokenData);
  console.log(adminCourses);
  const courseIdObject = new mongoDB.ObjectId(courseId);
  console.log(courseIdObject);
  const query = {
    _id: courseIdObject,
    courseId: { $in: adminCourses },
  };
  console.log(query);
  const database: mongoDB.Db = await connect();
  const courseCollection: mongoDB.Collection = database.collection("course");
  // Feedbacksystem anbinden!!!
  const data = await courseCollection.findOne(query);
  console.log(data);
  if (data === null) {
    return false;
  }
  return true;
}

export async function getAllQuestionsInCourse(courseId: number) {
  const database: mongoDB.Db = await connect();
  const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(courseId);
  const courseCollection: mongoDB.Collection = database.collection("course");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const courseQuery = {
    _id: courseIdObject,
  };
  const course = await courseCollection.findOne(courseQuery);
  //FEEDBACK!!!
  console.log(course);
  if (course === null) {
    return -1;
  }
  const catalogQuery = {
    course: course.courseId,
  };
  const catalogs = await catalogInCourseCollection.find(catalogQuery).toArray();
  console.log(catalogs);
  let catalogList = [];
  for (let i = 0; i < catalogs.length; i++) {
    catalogList.push(catalogs[i].catalog);
  }
  const questionQuery = {
    catalog: { $in: catalogList },
  };
  console.log(questionQuery);
  const questions = await questionInCatalogCollection
    .find(questionQuery)
    .toArray();
  console.log("questions");
  console.log(questions);
  let questionIds = [];
  for (let i = 0; i < questions.length; i++) {
    questionIds.push(questions[i].question);
  }
  console.log("questionIds");
  console.log(questionIds);
  const allQuestionQuery = {
    _id: { $in: questionIds },
  };
  const data = await questionCollection.find(allQuestionQuery).toArray();
  console.log(data);
  if (data === null) {
    return -1;
  }
  return data;
}

export async function getCatalogPermission(
  adminCourses: number[],
  catalog: string
) {
  const database: mongoDB.Db = await connect();
  const catalogId: mongoDB.ObjectId = new mongoDB.ObjectId(catalog);
  const courseQuery = {
    course: { $in: adminCourses },
    catalog: catalogId,
  };
  console.log(courseQuery);
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const courseResult = await catalogInCourseCollection.findOne(courseQuery);
  if (courseResult != null) {
    return true;
  }
  return false;
}

export function getStudentCourseRoles(tokenData: JwtPayload) {
  let coursesUser: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "STUDENT") {
        coursesUser.push(parseInt(courseId));
      }
    }
  }
  return coursesUser;
}

export function getUserCourseRoles(tokenData: JwtPayload) {
  let coursesUser: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
        coursesUser.push(parseInt(courseId));
    }
  }
  return coursesUser;
}

export async function getFirstQuestionInCatalog(
  questionCollection: mongoDB.Collection,
  questionInCatalogCollection: mongoDB.Collection,
  catalogId: string
) {
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const allQuestionsInCatalogQuery = {
    catalog: catalogIdObject,
  };
  const allQuestionsInCatalog = await questionInCatalogCollection
    .find(allQuestionsInCatalogQuery)
    .toArray();
  let usedQuestion: mongoDB.ObjectId[] = [];
  for (let i = 0; i < allQuestionsInCatalog.length; i++) {
    for (const key in allQuestionsInCatalog[i].children) {
      usedQuestion = addIfNotInList(
        usedQuestion,
        allQuestionsInCatalog[i].children[key]
      );
    }
  }
  const findFirstQuestion = {
    question: { $nin: usedQuestion },
    catalog: catalogIdObject,
  };
  const firstQuestion = await questionInCatalogCollection.findOne(
    findFirstQuestion
  );
  if (firstQuestion == null || firstQuestion == undefined) {
    return -1;
  }
  const firstQuestionQuery = {
    _id: firstQuestion.question,
  };
  const firstQuestionData: Question = await questionCollection.findOne(
    firstQuestionQuery
  ) as unknown as Question;
  if(firstQuestionData !== null) {
      firstQuestionData._id = firstQuestion._id;
      return firstQuestionData;
  } else {
      return -1;
  }
}

function addIfNotInList(list: mongoDB.ObjectId[], entry: mongoDB.ObjectId) {
  const exists = list.some((existingItem) => existingItem === entry);
  if (!exists) {
    list.push(entry);
  }
  return list;
}

export async function getLastSessionForCatalog(db: mongoDB.Db, catalogId: string, courseId: number, userId: number) {
    const sessionCollection: mongoDB.Collection = db.collection("sessions");
    const query = {
        catalogId: new mongoDB.ObjectId(catalogId),
        courseId: courseId,
        user: userId
    }
    console.log(query);
    const session: Session[] = await sessionCollection.find(query).sort({ starttime: -1 }).limit(1).toArray() as unknown as Session[];
    console.log("session");
    console.log(session);
    return session[0];
}

export async function getAllQuestionsFromCatalogs(
  questionInCatalogCollection: mongoDB.Collection,
  questionCollection: mongoDB.Collection,
  catalogs: string[]
) {
  const catalogIds: mongoDB.ObjectId[] = [];
  for (let index = 0; index < catalogs.length; index++) {
    catalogIds.push(new mongoDB.ObjectId(catalogs[index]));
  }
  const findQuestions = {
    catalog: { $in: catalogIds },
  };
  const accessibleQuestions = await questionInCatalogCollection
    .find(findQuestions)
    .toArray();
  let questionIds: mongoDB.ObjectId[] = [];
  for (let i = 0; i < accessibleQuestions.length; i++) {
    questionIds.push(new mongoDB.ObjectId(accessibleQuestions[i].question));
  }
  const questionQuery = {
    _id: { $in: questionIds },
  };
  console.log(questionQuery);
  const questions = questionCollection.find(questionQuery).toArray();
  console.log(questions);
  return questions;
}
export async function getAllQuestionsConnectionsFromCatalogs(
  questionInCatalogCollection: mongoDB.Collection,
  catalogs: string[]
) {
  const catalogIds: mongoDB.ObjectId[] = [];
  for (let index = 0; index < catalogs.length; index++) {
    catalogIds.push(new mongoDB.ObjectId(catalogs[index]));
  }
  const findQuestions = {
    catalog: { $in: catalogIds },
  };
  const accesibleQuestions: questionInCatalogObject[] = await questionInCatalogCollection
    .find(findQuestions)
    .toArray()as unknown as questionInCatalogObject[];
  return accesibleQuestions;
}

export function createQuestionResponse(newQuestion: any, newId: string) {
  if (newQuestion.questiontype === QuestionType.Choice) {
    const returnQuestion = newQuestion;
    const configuration = newQuestion.questionconfiguration as any;
    delete returnQuestion.owner;
    for (let i = 0; i < configuration.answerColumns.length; i++) {
      delete configuration.answerColumns[i].correctAnswers;
    }
    returnQuestion._id = newId;
    return returnQuestion;
  }
  if (newQuestion.questiontype === QuestionType.FillInTheBlanks) {
    const returnQuestion = newQuestion;
    const configuration = newQuestion.questionconfiguration as FillInTheBlanks;
    delete returnQuestion.owner;
    let blankStrings: string[] = [];
    for (let i = 0; i < configuration.textParts.length; i++) {
      if(configuration.textParts[i].order === null) {
        continue;
      }
      if (configuration.textParts[i].isBlank) {
        if(configuration.showBlanks) {
          blankStrings.push(configuration.textParts[i].text);
        }
        configuration.textParts[i].text = "";
      }
    }
    if(configuration.showBlanks) {
      returnQuestion.blankStrings = blankStrings;
    }
    returnQuestion._id = newId;
    return returnQuestion;
  }

  return newQuestion;
}

export async function getAllQuestionInCatalog(
  questionInCatalogCollection: mongoDB.Collection,
  questionCollection: mongoDB.Collection,
  catalogId: string
) {
  const connectionQuery = {
    catalog: new mongoDB.ObjectId(catalogId),
  };
  const connections = await questionInCatalogCollection
    .find(connectionQuery)
    .toArray();
  let questionIds: mongoDB.ObjectId[] = [];
  for (let i = 0; i < connections.length; i++) {
    questionIds.push(connections[i].question);
  }
  if (questionIds == null) {
    return -1;
  }
  const allQuestionsQuery = {
    _id: { $in: questionIds },
  };
  const allQuestions = await questionCollection
    .find(allQuestionsQuery)
    .toArray();
  console.log(allQuestions);
  return allQuestions;
}

export async function getCurrentSession(user: number) {
  const query = {
    user: user,
    status: SessionStatus.ongoing,
  };
  console.log(query);
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const result: any = await sessionCollection
    .find(query)
    .sort({ date: -1 })
    .limit(1)
    .toArray();
  console.log(result);
  return result[0];
}

export function getSessionStatusAsText(status: SessionStatus) {
  console.log(status);
  console.log("----------------------");
  switch (status) {
    case SessionStatus.ongoing:
      return "ongoing";
    case SessionStatus.finished:
      return "finished";
    case SessionStatus.paused:
      return "paused";
    default:
      return "error";
  }
}

export async function IsOwner(
  questionId: string,
  tokenData: JwtPayload,
  questionCollection: mongoDB.Collection
) {
  const filter = {
    _id: new mongoDB.ObjectId(questionId),
  };
  const result = await questionCollection.findOne(filter);
  if (result === null) {
    return false;
  }
  if (result.owner === tokenData.id) {
    return true;
  }
  console.log(tokenData.id);
  console.log(typeof tokenData.id);
  return false;
}

export async function numberOfQuestionsAhead(catalogId: string, questionId: string) {
    // braucht mehr Information, falls eine Frage mehrfach im Katalog erlaubt wird.
    const database: mongoDB.Db = await connect()
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    let currentId: string = questionId;
    let counter = 0;
    while(true) {
       let query = {
            question: new mongoDB.ObjectId(currentId),
            catalog: new mongoDB.ObjectId(catalogId)
       }
       const question = await questionInCatalogCollection.findOne(query);
       if(question === null) {
           return -1;
       }
       if(question.children.TRUE === "") {
           return counter;
       }
       counter++;
       currentId = question.children.TRUE;
    }
}

export async function getSessionInformation(sessionId: string) {
  const database: mongoDB.Db = await connect();
  const sessionCollection = database.collection("sessions");
  const query = {
    _id: new mongoDB.ObjectId(sessionId)
  }
  const session = sessionCollection.findOne(query);
  return session;
}