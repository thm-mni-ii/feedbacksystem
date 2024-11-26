import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  getAllQuestionsFromCatalogs,
  getAdminCourseRoles,
  getCatalogPermission,
  getFirstQuestionInCatalog,
  getAllQuestionInCatalog,
  getAllQuestionsConnectionsFromCatalogs,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import { getCourses } from "../course/course";
import { Catalog } from "../model/Catalog";
import { authenticate, authenticateInCatalog, authenticateInCourse } from "../authenticate";
import { Access, CatalogAccess, CourseAccess } from "../utils/enum";

interface catalog {
  name: string;
  questions: string[];
  requirements: string[];
}
interface QuestionTreeObject {
  question: Question;
  children: child[];
}
interface child {
  requirement: string;
  child: QuestionTreeObject;
}

export async function postCatalog(
  data: catalog,
  token: string,
  tokenData: JwtPayload,
  course: number
) {
  if(!authenticate(tokenData, Access.moderator)) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const courses = await getCourses(token);
  if (courses === -1) {
    return -1;
  }
  const couresExist = courses.some((obj: any) => obj.id === course);
  console.log(couresExist);
  if (!couresExist) {
    return -1;
  }
  const catalog = {
    name: data.name,
  };
  const catalogInsert = await catalogCollection.insertOne(catalog);
  const catalogInCourse = {
    course: course,
    catalog: catalogInsert.insertedId,
    requirements: data.requirements,
  };
  console.log(catalogInCourse);
  const catalogInCourseInsert =
    catalogInCourseCollection.insertOne(catalogInCourse);
  return { catalogId: catalogInsert.insertedId };
}

export async function getCatalog(tokenData: JwtPayload, catalogId: string) {
  const adminCourses = getAdminCourseRoles(tokenData);
  const query = {
    _id: new mongoDB.ObjectId(catalogId),
  };
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const catalogPermission = await getCatalogPermission(adminCourses, catalogId);
  if (!catalogPermission) {
    console.log("No Permission to Catalog");
    return -1;
  }
  let data = await catalogCollection.findOne(query);
  const tree = await getQuestionTree(tokenData, catalogId);
  const catalogInCourse = await catalogInCourseCollection.findOne({
    catalog: new mongoDB.ObjectId(catalogId),
  });
  if (data != null) {
    const res: Catalog = {
      id: data._id as unknown as string,
      name: data.name as string,
      questions: tree ? [tree] : [],
      requirements: catalogInCourse ? catalogInCourse.requirements : [],
      course: catalogInCourse ? catalogInCourse.course : -1,
    };
    return res;
  } else {
    return -1;
  }
}

export async function getCatalogs(tokenData: JwtPayload, courseId: number) {
  if(!authenticateInCourse(tokenData, CourseAccess.docentInCourse, courseId)) {
    return -1; 
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const request = {
    course: Number(courseId),
  };
  console.log(request);
  const courseResult = await catalogInCourseCollection.find(request).toArray();
  console.log(courseResult);
  if (courseResult.length === 0) {
    console.log("no catalogs found");
    return -1;
  }
  const catalogs = await catalogCollection
    .find({ _id: { $in: courseResult.map((x) => x.catalog) } })
    .toArray();

  // Modify the response to replace _id with id and include courseId
  const modifiedCatalogs: Catalog[] = catalogs.map((catalog) => {
    const catalogInCourse = courseResult.find((x) =>
      x.catalog.equals(catalog._id)
    );
    return {
      id: catalog._id as unknown as string,
      name: catalog.name,
      requirements: catalogInCourse ? catalogInCourse.requirements : [],
      course: catalogInCourse ? catalogInCourse.course : -1,
    };
  });

  return modifiedCatalogs;
}

export async function deleteCatalog(tokenData: JwtPayload, catalogId: string) {
  if(!authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    console.log("No Permissions to Catalog");
    return -1;
  }
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const query = {
    _id: catalogIdObject,
  };
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const data = await catalogCollection.deleteOne(query);
  const deleteConnections = {
    catalog: catalogIdObject,
  };
  await questionInCatalogCollection.deleteMany(deleteConnections);
  await catalogInCourseCollection.deleteMany(deleteConnections);
  return data;
}

export async function putCatalog(
  catalogId: string,
  token: string,
  data: catalog,
  tokenData: JwtPayload,
  course: number
) {
  if(!authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    console.log("No Permissions to Catalog");
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const catalogQuery = {
    _id: courseIdObject,
    catalogs: catalogIdObject,
  };
  await catalogCollection.find(catalogQuery).toArray();
  const courses = await getCourses(token);
  const couresExist = courses.some((obj: any) => obj.id === course);
  if (!couresExist) {
    return -1;
  }
  const filter = {
    _id: catalogIdObject,
  };
  const update = {
    $set: { name: data.name },
  };
  await catalogCollection.updateMany(filter, update);
  const filter2 = {
    catalog: catalogIdObject,
    course: course,
  };
  const update2 = {
    $set: {
      requirements: data.requirements,
    },
  };
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

export async function getCatalogScore(
  tokenData: JwtPayload,
  catalogId: string
) {
  const database: mongoDB.Db = await connect();
  const userCollection: mongoDB.Collection = database.collection("user");
  const query = {
    id: tokenData.id,
    [`catalogscores.${catalogId}`]: { $exists: true },
  };
  const res: any = await userCollection.findOne(query);
  const score = {
    score: res.catalogscores[catalogId],
  };
  return score;
}

export async function getQuestionTree(
  tokenData: JwtPayload,
  catalogId: string
) {
  if(!authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    console.log("No Permissions to Catalog");
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const questionCollection = database.collection("question");
  const questionInCatalogCollection = database.collection("questionInCatalog");
  const firstQuestion: any = await getFirstQuestionInCatalog(
    questionCollection,
    questionInCatalogCollection,
    catalogId
  );
  if (firstQuestion == null || firstQuestion == -1) {
    return -1;
  }
  const catalogArray: string[] = [catalogId];
  const allConnections = await getAllQuestionsConnectionsFromCatalogs(
    questionInCatalogCollection,
    catalogArray
  );
  if (allConnections == null || allConnections.length == 0) {
    return -1;
  }
  let tree: QuestionTreeObject = {
    question: firstQuestion,
    children: await createChildrenObjects(firstQuestion, allConnections),
  };
  const allQuestions = await getAllQuestionInCatalog(
    questionInCatalogCollection,
    questionCollection,
    catalogId
  );
  if (allQuestions == null || allQuestions == -1) {
    return -1;
  }
  return tree;
}

async function createChildrenObjects(question: any, allConnections: any[]) {
  const connections = findConnection(question, allConnections);
  let children: child[] = [];
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  for (const key in connections) {
    if (connections[key] === "") {
      continue;
    }
    const questionFind = {
      _id: connections[key],
    };
    const data: Question = (await questionCollection.findOne(
      questionFind
    )) as unknown as Question;
    if (data === null) {
      continue;
    }
    const newQuestion: QuestionTreeObject = {
      question: data,
      children: await createChildrenObjects(data, allConnections),
    };
    let child: child = {
      requirement: key,
      child: newQuestion,
    };
    children.push(child);
  }
  return children;
}

export async function allQuestionsInCatalog(
  tokenData: JwtPayload,
  catalogId: string
) {
  if(!authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    console.log("No Permissions to Catalog");
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const data = await getAllQuestionInCatalog(
    questionInCatalogCollection,
    questionCollection,
    catalogId
  );
  if (data === null) {
    return -1;
  }
  return data;
}

function findConnection(question: any, allConnections: any[]) {
  if (question == "empty") {
    return -2;
  }
  if (question == "") {
    return -1;
  }
  for (let i = 0; i < allConnections.length; i++) {
    if (allConnections[i].question.equals(question._id)) {
      return allConnections[i].children;
    }
  }
  return -1;
}
