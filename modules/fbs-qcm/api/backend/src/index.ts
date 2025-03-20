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
    const questionCollection: mongoDB.Collection = db.collection("question");
    const tagCollection: mongoDB.Collection = db.collection("tag");
    const submissionCollection: mongoDB.Collection =
      db.collection("submission");
    const userCollection: mongoDB.Collection = db.collection("user");
    const questionInCatalogCollection: mongoDB.Collection =
      db.collection("questionInCatalog");
    const cataloginCourseCollection: mongoDB.Collection =
      db.collection("catalogInCourse");
    await questionCollection.insertOne({
      _id: new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
      owner: 1,
      questiontext: "WAS IST DAS",
      questiontype: "Choice",
      questionconfiguration: {
        multiplerow: true,
        multiplecolumn: true,
        answerColumns: [
          {
            id: 0,
            name: "string",
          },
          {
            id: 1,
            name: "Wurst",
          },
          {
            id: 3,
            name: "agg",
          },
        ],
        optionRows: [
          {
            id: 0,
            text: "string",
            correctAnswers: [0],
          },
          {
            id: 1,
            text: "stgsdsring",
            correctAnswers: [0,1],
          },
          {
            id: 2,
            text: "sawttring",
            correctAnswers: [2],
          },
          {
            id: 3,
            text: "as",
            correctAnswers: [1,2],
          },
        ],
      },
    });
    await questionCollection.insertOne({
      owner: 1,
      questiontext: "string",
      questiontype: "FillInTheBlanks",
      showBlanks: true,
      questionconfiguration: {
        textParts: [
          {
            order: 1,
            text: "Hallo",
            isBlank: false,
          },
          {
            order: 2,
            text: "wie",
            isBlank: false,
          },
          {
            order: 3,
            text: "geht",
            isBlank: false,
          },
          {
            order: 4,
            text: "es",
            isBlank: true,
          },
        ],
      },
    });
    await questionCollection.insertOne({
      _id: new mongoDB.ObjectId("663e087990e19a7cb3f4a3d7"),
      owner: 1,
      questiontext: "Kreuze die richtigen Antworten an",
      questiontype: "Choice",
      questionconfiguration: {
        multiplerow: true,
        multiplecolumn: true,
        answerColumns: [
          {
            id: 0,
            name: "string",
          },
          {
            id: 1,
            name: "satring",
          },
        ],
        optionRows: [
          {
            id: 0,
            text: "string",
            correctAnswers: [1],
          },
        ],
      },
    });
    await questionCollection.insertOne({
      owner: 1,
      questiontext: "Sind Kartoffel grün",
      questiontype: "Choice",
      questionconfiguration: {
        multiplerow: true,
        multiplecolumn: true,
        answerColumns: [
          {
            id: 0,
            name: "string",
          },
          {
            id: 1,
            name: "satring",
          },
        ],
        optionRows: [
          {
            id: 0,
            text: "string",
            correctAnswers: [1],
          },
        ],
      },
    });

    await questionCollection.insertOne({
      owner: 1,
      questiontext: "WAS IST wAS",
      questiontype: "Choice",
      questionconfiguration: {
        multiplerow: true,
        multiplecolumn: true,
        answerColumns: [
          {
            id: 0,
            name: "string",
          },
          {
            id: 1,
            name: "satring",
          },
        ],
        optionRows: [
          {
            id: 0,
            text: "string",
            correctAnswers: [1],
          },
        ],
      },
    });
    await questionCollection.insertOne({
      _id: new mongoDB.ObjectId("66474b198d1fcd0b3079e6fe"),
      owner: 1,
      questiontext: "WAS IST DAS",
      questiontype: "Choice",
      questionconfiguration: {
        multiplerow: true,
        multiplecolumn: true,
        answerColumns: [
          {
            id: 0,
            name: "string",
          },
          {
            id: 1,
            name: "satring",
          },
        ],
        optionRows: [
          {
            id: 0,
            text: "string",
            correctAnswers: [1],
          },
        ],
      },
    });
    await catalogCollection.insertOne({
      _id: new mongoDB.ObjectId("663a51d228d8781d96050905"),
      name: "Grundlagen",
    });
    await cataloginCourseCollection.insertOne({
      course: 187,
      catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
      requirements: [],
    });
    await userCollection.insertOne({
      _id: new mongoDB.ObjectId("664b08e0448b1678f0393a7e"),
      id: 1,
      catalogscores: {
        "663a51d228d8781d96050905": 75,
      },
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
    await questionInCatalogCollection.insertOne({
      catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
      question: new mongoDB.ObjectId("6638fbdb7cbf615381a90abe"),
      weighting: 1,
      children: [
          {
            needed_score: 80,
            question: new mongoDB.ObjectId("67602da10c3862de8813690f"),
            transition: "correct"
          },
          {
            needed_score: 79,
            question: new mongoDB.ObjectId("67602da10c3862de88136910"),
            transition: "incorrect"
          }
      ]
    });
    await questionInCatalogCollection.insertOne({
      _id: new mongoDB.ObjectId("67602da10c3862de8813690f"),
      catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
      question: new mongoDB.ObjectId("66474b198d1fcd0b3079e6fe"),
      weighting: 1,
      children: [
      ],
    });
    await questionInCatalogCollection.insertOne({
      _id: new mongoDB.ObjectId("67602da10c3862de88136910"),
      catalog: new mongoDB.ObjectId("663a51d228d8781d96050905"),
      question: new mongoDB.ObjectId("663e087990e19a7cb3f4a3d7"),
      weighting: 1,
      children: [
      ],
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
