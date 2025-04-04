import { ObjectId } from "mongodb";
import type QuestionType from "../enums/QuestionType.ts";
import Choice from "./questionTypes/Choice.js";
import FillInTheBlanks from "./questionTypes/FillInTheBlanks.js";

export interface Question {
  _id: ObjectId;
  owner: number;
  questiontext?: string;
  questiontags: string[];
  questiontype: QuestionType;
  questionconfiguration: Choice | FillInTheBlanks | QuestionType.SQL;
  createdAt: Date,
  lastEdited: Date
}

export interface EditQuestionType {
  _id: ObjectId;
  owner?: number;
  questiontext?: string;
  questiontags?: string[];
  questiontype?: QuestionType;
  questionconfiguration?: Choice | FillInTheBlanks | QuestionType.SQL;
}

export interface QuestionWithoutId { 
  owner: number;
  questiontext?: string;
  questiontags: string[];
  questiontype: QuestionType;
  questionconfiguration: Choice | FillInTheBlanks | QuestionType.SQL;
  createdAt: Date,
  lastEdited: Date
}