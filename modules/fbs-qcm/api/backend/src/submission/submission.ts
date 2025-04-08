import { JwtPayload } from "jsonwebtoken";
import {
  checkQuestionAccess,
  getCurrentSession,
  getStudentCourseRoles,
} from "../utils/utils";
import { connect } from "../mongo/mongo";
import { AnswerScore, SessionStatus } from "../utils/enum";
import * as mongoDB from "mongodb";
import { Question } from "../model/Question";
import QuestionType from "../enums/QuestionType";
import FillInTheBlanks from "../model/questionTypes/FillInTheBlanks";
import Choice from "../model/questionTypes/Choice";
import { ChoiceAnswer, ChoiceReply, ChoiceReplyRow, FillInTheBlanksAnswer, FillInTheBlanksIndividual, FillInTheBlanksResponse } from "./utils";

export async function submitSessionAnswer(
  tokenData: JwtPayload,
  question: string,
  answers: any,
  sessionId: string
) {
  const session = await getCurrentSession(tokenData.id);
  if (session._id.toString() !== sessionId) {
    console.log("submission for differen Session");
    return -1;
  }
  const submitResult = await submit(tokenData, question, answers, sessionId);
  return submitResult;
}

export async function submit(
  tokenData: JwtPayload,
  question: string,
  answers: any,
  sessionId: string
) {
  const userCourses = getStudentCourseRoles(tokenData);
  const database: mongoDB.Db = await connect();
  const questionCollection: mongoDB.Collection =
    database.collection("question");
  const questionInCatalogCollection: mongoDB.Collection =
    database.collection("questionInCatalog");
  const catalogInCourseCollection: mongoDB.Collection =
    database.collection("catalogInCourse");
  const catalogCollection: mongoDB.Collection = database.collection("catalog");
  const submissionCollection: mongoDB.Collection =
    database.collection("submission");
  const timestamp = Date.now();
  const questionInCatalogId = new mongoDB.ObjectId(question);
  const actualQuestionIdQuery = {
    _id: questionInCatalogId,
  };
  const questionObject = await questionInCatalogCollection.findOne(
    actualQuestionIdQuery
  );
  if (questionObject === null) {
    console.log("Frage existiert nicht");
    return -1;
  }
  const questionId = questionObject.question;
  const catalog = await checkQuestionAccess(
    questionId,
    userCourses,
    catalogInCourseCollection,
    catalogCollection
  );
  if (catalog === false) {
    console.log("Keinen Zugriff auf Katalog");
    return -1;
  }
  const correct = await checkAnswer(answers, questionId, questionCollection);
  const submission = {
    user: tokenData.id,
    question: questionInCatalogId,
    answer: answers,
    evaluation: correct,
    timeStamp: timestamp,
    session: new mongoDB.ObjectId(sessionId),
  };
  await submissionCollection.insertOne(submission);
  return correct;
}

async function checkAnswer(
  answer: any,
  questionId: mongoDB.ObjectId,
  questionCollection: mongoDB.Collection
) {
  const questionQuery = {
    _id: questionId,
  };

  const result: Question = await questionCollection.findOne(questionQuery) as unknown as Question;
  if (result === null) {
    return -1;
  }
  if (result !== null) {
    const question: Question = result as Question;
    const correct = checkSubmission(answer, question);
    return correct;
  }
}

function checkSubmission(answer: any, question: Question) {
  const questionType = question.questiontype;
  if (questionType == QuestionType.Choice) {
    return checkChoice(answer, question);
  } else if (questionType == QuestionType.FillInTheBlanks) {
    return checkClozeText(answer.answers as FillInTheBlanksAnswer[], question);
  } else if (questionType == QuestionType.SQL) {
    return checkSQL(answer, question);
  } else {
    return AnswerScore.incorrect;
  }
}

function checkSQL(answer: any, question: Question) {
  return 0;
}

function checkChoice(answer: ChoiceAnswer[], question: Question) {
  console.log("answer");
  console.log(answer);
  let correctAnswers = 0;
  let falseAnswers = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  const configuration = question.questionconfiguration as Choice;
  const answerRows: number[][] = getSelectedIds(answer);
  let response: ChoiceReply = {} as ChoiceReply;
  response.row = [];
  for (let i = 0; i < configuration.optionRows.length; i++) {
    const correctList: number[] = configuration.optionRows[i].correctAnswers;
    correctList.forEach((value, index) => {
      correctList[index] = value + 1;
    });
    let answerList: number[] = answerRows[i];
    if(answerList === undefined) {
      answerList = [];
    }
    correctList.forEach((item) => {
      if (answerList.includes(item)) {
        console.log(item);
        console.log(answerList);
        correctAnswers++;
      } else {
        falseNegatives++;
      }
    });
    answerList.forEach((item) => {
      if (!correctList.includes(item)) {
        falsePositives++;
      }
    });
      console.log("correctAnswers");
      console.log(correctAnswers);
      console.log("falseNegatives");
      console.log(falseNegatives);
      console.log("falsePositives");
      console.log(falsePositives);
    let replyRow: ChoiceReplyRow = {} as ChoiceReplyRow;
    replyRow.id = configuration.optionRows[i].id;
    replyRow.text = configuration.optionRows[i].text;
    response.row[i] = replyRow;
    falseAnswers += falseNegatives + falsePositives;
  }
      console.log("correctAnswers");
      console.log(correctAnswers);
      console.log("falseNegatives");
      console.log(falseNegatives);
      console.log("falsePositives");
      console.log(falsePositives);
  let score = (correctAnswers - falsePositives) / (correctAnswers + falseNegatives);
  if(score < 0 ) {
    score = 0;
  }
  response.score = score;
  return response;
}

function getSelectedIds(answer: ChoiceAnswer[]) {
  let result: number[][] = [];
  for (let i = 0; i < answer.length; i++) {
    result[answer[i].id-1] = [];
    console.log("answer[i].entries");
    console.log(answer[i].entries);
    for (let j = 0; j < answer[i].entries.length; j++) {
      result[answer[i].id-1][j] = answer[i].entries[j].id;
      console.log(result);
    }
  }
  console.log("result");
  console.log(result);
  return result;
}

function checkClozeText(answer: FillInTheBlanksAnswer[], question: Question) {
  let blankFields = [];
  let numberOfCorrectAnswers = 0;
  let FillInTheBlanksResponse: FillInTheBlanksResponse =
    {} as FillInTheBlanksResponse;
  const configuration = question.questionconfiguration as FillInTheBlanks;
  for (let i = 0; i < configuration.textParts.length; i++) {
    if (configuration.textParts[i].isBlank === true) {
      blankFields.push(configuration.textParts[i]);
    }
  }
  for (let j = 0; j < blankFields.length; j++) {
    const res = checkSingleWord(answer, blankFields[j]);
    if (res.correct) {
      numberOfCorrectAnswers++;
    }
  }

  const score: number = numberOfCorrectAnswers / blankFields.length;
  FillInTheBlanksResponse.score = score;
  return FillInTheBlanksResponse;
}

function checkSingleWord(answer: FillInTheBlanksAnswer[], blankFields: FillInTheBlanksAnswer) {
  let evaluation: FillInTheBlanksIndividual = {} as FillInTheBlanksIndividual;
  for (let k = 0; k < answer.length; k++) {
    if (
      answer[k].text === blankFields.text &&
      answer[k].order === blankFields.order
    ) {
      evaluation.text = answer[k].text;
      evaluation.order = answer[k].order;
      evaluation.correct = true;
      return evaluation;
    }
    if (answer[k].order === blankFields.order) {
      evaluation.text = answer[k].text;
      evaluation.order = answer[k].order;
      evaluation.correct = false;
      return evaluation;
    }
  }
  return evaluation;
}