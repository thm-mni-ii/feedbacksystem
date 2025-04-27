import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  getFirstQuestionInCatalog,
  getAllQuestionInCatalog,
  getLastSessionForCatalog,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import { getCourses } from "../course/course";
import {
  authenticate,
  authenticateInCatalog,
  authenticateInCourse,
} from "../authenticate";
import { Access, CatalogAccess, CourseAccess, SessionStatus } from "../utils/enum";
import { Submission } from "../submission/utils";
import { Course } from "../model/utilInterfaces";
import { Session } from "../session/sessionUtils";
import { Question } from "../model/Question";

interface QuestionData {
  questionId: mongoDB.ObjectId;
  text: string;
  transition: string;
  score: number;
}

interface catalog {
  name: string;
  questions: string[];
  isPublic: boolean;
  requirements: string[];
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
  const result: Course[] | number = await getCourses(token);
  if (result === -1) {
    return -1;
  }
  if (Array.isArray(result)) {
    const courses: Course[] = result;
    const couresExist = courses.some((obj: Course) => obj.id === course);
    if (!couresExist) {
      return -1;
    }
  }
  const catalog = {
    name: data.name,
  };
  const catalogInsert = await catalogCollection.insertOne(catalog);
  const catalogInCourse = {
    course: course,
    catalog: catalogInsert.insertedId,
    requirements: data.requirements,
    isPublic: data.isPublic
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
    const question: Question = await getFirstQuestionInCatalog(
      questionCollection,
      questionInCatalogCollection,
      catalogId
    ) as Question;
    questionId = question._id as unknown as string;
    console.log(`start question is: ${questionId}`);
  }
  if(questionId === undefined || questionId === null ||questionId === "") {
    console.log("no Question in Catalog");
    return {isEmpty: true};
  }
  const query = {
      _id: new mongoDB.ObjectId(questionId)
  }
  const data: CatalogQuestionData = await questionInCatalogCollection.findOne(query) as CatalogQuestionData;
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
  const originQuestion: Question = await questionCollection.findOne(originQueryQuestion) as Question;
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
      CatalogAccess.studentInCatalog,
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
  const catalogInCourse = await catalogInCourseCollection.findOne({
    catalog: new mongoDB.ObjectId(catalogId),
  });
  if (data != null) {
    const res: any = {
      _id: data._id as unknown as string,
      name: data.name as string,
      requirements: catalogInCourse ? catalogInCourse.requirements : [],
      course: catalogInCourse ? catalogInCourse.course : -1,
    };
    return res;
  } else {
    return -1;
  }
}

export async function getAllCatalogs(tokenData: JwtPayload, courseId: number) {
  let request = {}
  if (authenticateInCourse(tokenData, CourseAccess.docentInCourse, courseId)) {
    request = {
      course: Number(courseId),
    };
  } else if(authenticateInCourse(tokenData, CatalogAccess.studentInCatalog, courseId)) {
    request = {
      course: Number(courseId),
      isPublic: true
    };
  } else {
    return -1;
  }
  const database: mongoDB.Db = await connect();
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const catalogInCourseCollection: mongoDB.Collection = database.collection("catalogInCourse");
  const courseResult = await catalogInCourseCollection.find(request).toArray();
  if (courseResult.length === 0) {
    console.log("no catalogs found");
    return -1;
  }
  const catalogs = await catalogCollection
    .find({ _id: { $in: courseResult.map((x) => x.catalog) } })
    .toArray();
     // Modify the response to replace _id with id and include courseId
  const modifiedCatalogs: any[] = catalogs.map((catalog) => {
    const catalogInCourse = courseResult.find((x) =>
      x.catalog.equals(catalog._id)    );
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
  const result: Course[] | number = await getCourses(token);
  if (result === -1) {
    return -1;
  }
  if (Array.isArray(result)) {
    const courses: Course[] = result;
    const couresExist = courses.some((obj: Course) => obj.id === course);
    if (!couresExist) {
      return -1;
    }
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
      isPublic: data.isPublic
    },
  };
  await catalogInCourseCollection.updateOne(filter2, update2);
  return 0;
}

export async function getCatalogScore(
  tokenData: JwtPayload,
  sessionId: string
) {
  const database: mongoDB.Db = await connect();
  const sessionCollection: mongoDB.Collection = database.collection("sessions");
  const submissionCollection: mongoDB.Collection = database.collection("submission");
  const questionCollection: mongoDB.Collection = database.collection("question");
  const questionInCatalogCollection: mongoDB.Collection = database.collection("questionInCatalog");
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
  const report = await getQuestionReport(sessionId, submissionCollection, questionCollection, questionInCatalogCollection);
  return report;
}

async function getQuestionReport(sessionId: string, submissionCollection: mongoDB.Collection,
   questionCollection: mongoDB.Collection, questionInCatalogCollection: mongoDB.Collection) {
  const query = {
    session: new mongoDB.ObjectId(sessionId)
  };
  const questionReport = [];
  const submissions: Submission[] = await submissionCollection.find(query).sort({ timeStamp: 1}).toArray() as unknown as Submission[];
  let totalScore = 0;
  for(let submission of submissions) {
    if(submission !== null) {
    const questionInCatalogObject = await questionInCatalogCollection.findOne({_id: new mongoDB.ObjectId(submission.question)});
      if(questionInCatalogObject !== null) {
        const question = await questionCollection.findOne({_id: new mongoDB.ObjectId(questionInCatalogObject.question)});
        if(question === null) {
          continue;
        }
        const questionObject = {
          givenAnswer: submission.answer,
          correctAnswer: question.questionconfiguration,
          questionId: questionInCatalogObject.question,
          questionInCatalogId: questionInCatalogObject._id,
          score: submission.evaluation.score
        }
        totalScore += submission.evaluation.score;
        questionReport.push(questionObject);
      }
    }
  }
  totalScore = totalScore / submissions.length;
  const finalObject = {
    questionReport: questionReport,
    score: totalScore
  } 
  return finalObject;
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
    const session: Session = await getLastSessionForCatalog(database, catalogId, courseId, tokenData.id); 
    if(session === null) {
        return -1;
    }
    const query = {
        session: session._id
    }
    const submissionCollection = database.collection("submission");
    const submissions: Submission[] = await submissionCollection.find(query).toArray() as unknown as Submission[];
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
    const update = {
        $set: {
            "children.$.needed_score": needed_score
        }
    }
    const response = questionInCatalogCollection.updateOne(filter, update)
    return response; 
}
