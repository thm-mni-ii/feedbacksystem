import express from "express";
import { connect } from "./mongo/mongo";
import * as mongoDB from "mongodb";
import { AnswerScore } from "./utils/enum";
import catalogRoutes from './routes/catalogRoutes';
import courseRoutes from './routes/courseRoutes';
import questionRoutes from './routes/questionRoutes';
import sessionRoutes from './routes/sessionRoutes';
import submissionRoutes from './routes/submissionRoutes';
import tagRoutes from './routes/tagRoutes';
import userRoutes from './routes/userRoutes';
import cors from "cors";
import { insertQuestionsInCatalog } from "./utils/insert_questionsInCatalog";
import { insertQuestions } from "./utils/insert_question";

interface User {
  username: string;
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

async function createDatabaseAndCollection() {
  try {
    const db = await connect();
    const catalogCollection: mongoDB.Collection = db.collection("catalog");
    const tagCollection: mongoDB.Collection = db.collection("tag");
    const submissionCollection: mongoDB.Collection =
      db.collection("submission");
    const userCollection: mongoDB.Collection = db.collection("user");
      db.collection("questionInCatalog");
    const cataloginCourseCollection: mongoDB.Collection =
      db.collection("catalogInCourse");
    await insertQuestions();
    await insertQuestionsInCatalog();
    await catalogCollection.insertOne({
      _id: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
      name: "Grundlagen",
    });
    await cataloginCourseCollection.insertOne({
      course: 1,
      catalog: new mongoDB.ObjectId("67f7f3b7d93fb13cd308e807"),
      requirements: [],
    });
    submissionCollection.insertOne({
      _id: new mongoDB.ObjectId("664b63aefa0e9768d9ffd02a"),
      user: 1,
      question: new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
      answer: ["8"],
      evaluation: AnswerScore.correct,
      timeStamp: {
        $numberLong: "1716216750416",
      },
    });
    await tagCollection.insertOne({
      _id: new mongoDB.ObjectId("66e83f0f8b382a419cb023fa"),
      text: "SQL",
    });
  } catch (err) {
    console.error(`Error  creating database or collection: ${err}`);
  }
}

async function startServer() {
  await createDatabaseAndCollection();

  const app = express();

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

 
  app.use('', catalogRoutes);
  app.use('', courseRoutes);
  app.use('', questionRoutes);
  app.use('', sessionRoutes);
  app.use('', submissionRoutes);
  app.use('', tagRoutes);
  app.use('', userRoutes);

  app.listen(3000, () => console.log("LISTENING on port 3000"));
}
startServer().catch(console.error);
