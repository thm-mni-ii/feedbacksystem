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
  tokenData: JwtPayload,
  course: string
) {
  const adminCourses = getAdminCourseRoles(tokenData);
  const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(course);
  const searchQuery = {
    courseId: { $in: adminCourses },
    _id: courseIdObject,
  };
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const courseCollection: mongoDB.Collection = database.collection("course");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const result = await courseCollection.find(searchQuery).toArray();
  if (result.length > 0) {
    const catalogEntry = {
      name: data.name,
    };
    const res = await catalogCollection.insertOne(catalogEntry);
    const entry = {
      course: result[0].courseId,
      catalog: res.insertedId,
      requirements: data.requirements,
    };
    await catalogInCourseCollection.insertOne(entry);
    return { catalog: res.insertedId };
  } else {
    console.log("no Courses found");
    return -1;
  }
}

export async function getCatalog(tokenData: JwtPayload, catalogId: string) {
  const adminCourses = getAdminCourseRoles(tokenData);
  const query = {
    _id: new mongoDB.ObjectId(catalogId),
  };
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogPermission = await getCatalogPermission(adminCourses, catalogId);
  if (!catalogPermission) {
    console.log("No Permission to Catalog");
    return -1;
  }
  const data = await catalogCollection.findOne(query);
  const tree = await getQuestionTree(tokenData, catalogId);
  const res = {
    catalog: data,
    questions: tree,
  };
  return res;
}

// get all catalogs from courseid(in params)
export async function getCatalogs(tokenData: JwtPayload, courseId: number) {
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const courseResult = await catalogInCourseCollection
    .find({ course: courseId })
    .toArray();
  if (courseResult.length === 0) {
    console.log("no catalogs found");
    return -1;
  }
  const catalogs = await catalogCollection
    .find({ _id: { $in: courseResult.map((x) => x.catalog) } })
    .toArray();
  return catalogs;
}

export async function deleteCatalog(tokenData: JwtPayload, catalogId: string) {
  const adminCourses = getAdminCourseRoles(tokenData);
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
  const catalogPermission: any = await getCatalogPermission(
    adminCourses,
    catalogId
  );
  if (!catalogPermission) {
    console.log("No Permission to Catalog");
    return -1;
  }
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
  data: catalog,
  tokenData: JwtPayload,
  courseId: string
) {
  const adminCourses = getAdminCourseRoles(tokenData);
  const database: mongoDB.Db = await connect();
  const courseResult = await getCatalogPermission(adminCourses, catalogId);
  if (!courseResult) {
    console.log("No Permission to Catalog");
    return -1;
  }
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const courseCollection: mongoDB.Collection = database.collection("course");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const courseIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(courseId);
  const catalogIdObject: mongoDB.ObjectId = new mongoDB.ObjectId(catalogId);
  const catalogQuery = {
    _id: courseIdObject,
    catalogs: catalogIdObject,
  };
  await catalogCollection.find(catalogQuery).toArray();
  const getCourseNumberQuery = {
    _id: courseIdObject,
  };
  const courseNumber = await courseCollection.findOne(getCourseNumberQuery);
  if (courseNumber === null) {
    console.log("course does not exist");
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
    course: courseNumber.courseId,
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
  const adminCourses = getAdminCourseRoles(tokenData);
  const course = getCatalogPermission(adminCourses, catalogId);
  if (!course) {
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

function createTreeLayer(
  layer: Object[][],
  allConnections: any[],
  allQuestions: any[]
) {
  const data = layer.flat();
  let newLayer: Object[][] = [];
  let index = 0;
  for (let i = 0; i < data.length; i++) {
    index++;
    let entry: Object[] = [];
    const connections = findConnection(data[i], allConnections);
    if (connections == -1 || connections == -2) {
      continue;
    }
    for (const key in connections) {
      if (connections[key] == "") {
        continue;
      } else {
        for (let k = 0; k < allQuestions.length; k++) {
          if (allQuestions[k]._id.equals(connections[key])) {
            entry.push(allQuestions[k]);
            break;
          }
        }
      }
    }
    newLayer.push(entry);
  }
  return newLayer;
}

export async function allQuestionsInCatalog(
  tokenData: JwtPayload,
  catalogId: string
) {
  const adminCourses = getAdminCourseRoles(tokenData);
  const permission = await getCatalogPermission(adminCourses, catalogId);
  if (!permission) {
    console.log("OOOF");
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

async function moveCatalogInCourses(
  adminCourses: number[],
  catalogInCourseCollection: mongoDB.Collection,
  courseIdObject: mongoDB.ObjectId,
  catalogIdObject: mongoDB.ObjectId
) {
  const checkQuery = {
    course: { $in: adminCourses },
    catalog: catalogIdObject,
  };
  const res = await catalogInCourseCollection.findOne(checkQuery);
  if (res == null || res.length == 0) {
    return -1;
  }
  const notChangedQuery = {
    course: courseIdObject,
    catalog: catalogIdObject,
  };
  const alreadyExist = catalogInCourseCollection.findOne(notChangedQuery);
  console.log("alreadyExist");
  console.log(alreadyExist);
  if (alreadyExist !== null) {
    return 0;
  }

  return 0;
}
