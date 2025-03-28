import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  getAllQuestionsFromCatalogs,
  getAdminCourseRoles,
  getCatalogPermission,
  getFirstQuestionInCatalog,
  getAllQuestionInCatalog,
  getAllQuestionsConnectionsFromCatalogs,
  getLastSessionForCatalog,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import { getCourses } from "../course/course";
import { Catalog } from "../model/Catalog";
import {
  authenticate,
  authenticateInCatalog,
  authenticateInCourse,
} from "../authenticate";
import { Access, CatalogAccess, CourseAccess, SessionStatus } from "../utils/enum";
import { timeStamp } from "console";

interface QuestionData {
  questionId: mongoDB.ObjectId;
  text: string;
  transition: string;
  score: number;
}

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

interface CatalogQuestionData {
  _id: mongoDB.ObjectId;
  catalog: mongoDB.ObjectId;
  question: mongoDB.ObjectId;
  weighting: number;
  children: [
      {
          needed_score: number,
          question: mongoDB.ObjectId,
          transition: string
      }
  ];
}

export async function createSingleCatalog(
  data: catalog,
  token: string,
  tokenData: JwtPayload,
  course: number
) {
  if (!authenticate(tokenData, Access.moderator)) {
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
  const catalogInCourseInsert =
    catalogInCourseCollection.insertOne(catalogInCourse);
  return { catalogId: catalogInsert.insertedId };
}

export async function editCatalogInformation(tokenData: JwtPayload, catalogId: string, questionId: string) {
  if(!await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
    //need to add verification specifically for questioninCatalogId
    return -1;
  } 
  const database: mongoDB.Db = await connect();
  if(questionId === "") {
    return -1;
  }
  const questionCollection: mongoDB.Collection = database.collection("question");
  const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
  if(questionId === "open") {
    const question = await getFirstQuestionInCatalog(
      questionCollection,
      questionInCatalogCollection,
      catalogId
    ) as any;
    questionId = question._id;
    console.log(`start question is: ${questionId}`);
  }
  if(questionId === undefined || questionId === null ||questionId === "") {
    console.log("no Question in Catalog");
    return {isEmpty: true};
  }
  const query = {
      _id: new mongoDB.ObjectId(questionId)
  }
  const data: CatalogQuestionData = await questionInCatalogCollection.findOne(query) as any;
  if(data === null) {
      return -1;
  }
  const children: QuestionData[] = [];
  for (let i = 0; i < data.children.length; i++) {
      const queryQuestion = {
          _id: data.children[i].question
      }
      const question = await questionInCatalogCollection.findOne(queryQuestion);
      if(question === null) {
          continue;
      }
      const queryForQuestionData = {
        _id: question.question
      }
      const questionData = await questionCollection.findOne(queryForQuestionData);
      if(questionData === null) {
          continue;
      }
      const obj: QuestionData = {
          questionId: data.children[i].question,
          text: questionData.questiontext,
          transition: data.children[i].transition,
          score: data.children[i].needed_score,
      }
      children.push(obj);
  }
  const originQueryQuestion = {
      _id: data.question
  }
  const originQuestion: Question = await questionCollection.findOne(originQueryQuestion) as any;
  if(originQuestion === null) {
      return -1;
  }
  const res = {
      _id: questionId,
      questionText: originQuestion.questiontext,
      children: children,
      isEmpty: false
  }
  return res;
}
export async function getSingleCatalog(tokenData: JwtPayload, catalogId: string) {
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      catalogId
    ))
  ) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");

  const query = {
    _id: new mongoDB.ObjectId(catalogId),
  };
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

export async function getAllCatalogs(tokenData: JwtPayload, courseId: number) {
  if (!authenticateInCourse(tokenData, CourseAccess.docentInCourse, courseId)) {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const request = {
    course: Number(courseId),
  };
  const courseResult = await catalogInCourseCollection.find(request).toArray();
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

export async function deleteSingleCatalog(tokenData: JwtPayload, catalogId: string) {
  if (!(await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId))) {
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

export async function editSingleCatalog(
  catalogId: string,
  token: string,
  data: catalog,
  tokenData: JwtPayload,
  course: number
) {
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      catalogId
    ))
  ) {
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
  sessionId: string
) {
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const submissionCollection: mongoDB.Collection = database.collection("submission");
  const query = {
    _id: new mongoDB.ObjectId(sessionId)
  }
  const session = await sessionCollection.findOne(query);
  if(session === null) {
    console.log("Session does not exist");
    return -3;
  }
  if(session.user !== tokenData.id) {
    console.log("Not the user the session belongs to");
    return -2;
  }
  if(session.status !== SessionStatus.finished) {
    console.log("Session is not finished");
    return -1;
  }
  const report = getQuestionReport(sessionId, submissionCollection);
  console.log(report);
  return report;
}

async function getQuestionReport(sessionId: string, submissionCollection: mongoDB.Collection) {
  const query = {
    session: new mongoDB.ObjectId(sessionId)
  };
  const questionReport = [];
  const submissions: Submission[] = await submissionCollection.find(query).sort({ timeStamp: 1}).toArray() as unknown as Submission[];
  let totalScore = 0;
  for(let submission of submissions) {
    const questionObject = {
      answer: submission.answer,
      correctAnswer: "a",// find correct answer of question
      score: submission.evaluation.score
    }
    totalScore += submission.evaluation.score;
    questionReport.push(questionObject);
  }
  const finalObject = {
    questionReport: questionReport,
    score: totalScore
  } 
  return finalObject;
}

async function getDetailedSingleQuestionReport() {

}

export async function getQuestionTree(
  tokenData: JwtPayload,
  catalogId: string
) {
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      catalogId
    ))
  ) {
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
  if (
    !(await authenticateInCatalog(
      tokenData,
      CatalogAccess.docentInCatalog,
      catalogId
    ))
  ) {
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

export async function getPreviousQuestionInCatalog(tokenData: JwtPayload, catalogId: string, questionId: string ) {
   if(!authenticateInCatalog(tokenData, CatalogAccess.tutorInCatalog, catalogId)) {
       return -1;
   }
  const database: mongoDB.Db = await connect();
  const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
  const questionCollection: mongoDB.Collection = database.collection("question");
  const query = {
    catalog: new mongoDB.ObjectId(catalogId),
    children: {
        $elemMatch: {
          question: new mongoDB.ObjectId(questionId)
        }
    } 
  };
  const data = await questionInCatalogCollection.findOne(query);
  if(data === null) {
      return {questionInCatalogId: null}
  } 
  const questionQuery = {
      _id: data.question
  };
  const prevQuestion = await questionCollection.findOne(questionQuery); 
  if(prevQuestion === null) {
      return -1;
  }
  const dataObject = {
      questionInCatalogId: data._id,
      text: prevQuestion.questiontext,
  }
  return dataObject;
} 

export async function addNewChildrenToQuestion(tokenData: JwtPayload, questionId: string, children: string, key: number, transition: string) {
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
    if(! await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, data.catalog)) {
        return -1;
    }
    const update: any = {
        $push: {
            children: {
                needed_score: key,
                question: new mongoDB.ObjectId(children),
                transition: transition
            }
        }
    };
    return await questionInCatalogCollection.updateOne(query, update);
}

export async function emptyCatalogInformation(tokenData: JwtPayload, catalogId: string) {
    if(!await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, catalogId)) {
        return -1;                                               
    }
    const query = {
        catalog: new mongoDB.ObjectId(catalogId)
    }
    const database: mongoDB.Db = await connect();
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const data = await questionInCatalogCollection.findOne(query);
    if(data === null) {
        return 0;
    }
    if(data !== null) {
        return -1;
    }
}

export async function catalogScore(tokenData: JwtPayload, courseId: number, catalogId: string) {
    const database: mongoDB.Db = await connect();
    const session: any = await getLastSessionForCatalog(database, catalogId, courseId, tokenData.id); 
    if(session === null) {
        return -1;
    }
    const query = {
        session: session._id
    }
    const submissionCollection = database.collection("submission");
    const submissions = await submissionCollection.find(query).toArray();
    if(submissions.length === 0) {
        console.log("no submissions yet");
        return -1;
    }
    let score = 0.0;
    let count = 0
    submissions.forEach((submission) => {
       score += submission.evaluation.score; 
       count++;
    });

    return {"score": score/count};
}

export async function changeScoreNeededForQuestion(tokenData: JwtPayload, questionId: string, needed_score: number, transition: string) {
    const database: mongoDB.Db = await connect();
    const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
    const query = {
        _id: new mongoDB.ObjectId(questionId)
    }
    const questionObject = await questionInCatalogCollection.findOne(query);
    if(questionObject === null) {
        console.log("keine Frage gefunden");
        return -1;
    }
    if(!await authenticateInCatalog(tokenData, CatalogAccess.docentInCatalog, questionObject.catalog)) {
        console.log("keine Berechtigungen");
        return -1;                                               
    }
    const filter = {
        _id: new mongoDB.ObjectId(questionId),
        "children.transition": transition
    }
    const update: any = {
        $set: {
            "children.$.needed_score": needed_score
        }
    }
    const response = questionInCatalogCollection.updateOne(filter, update)
    return response; 
}
