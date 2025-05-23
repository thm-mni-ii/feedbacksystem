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
  lastEdited: Date,
  difficulty?: number
}

export interface EditQuestionType {
  _id: ObjectId;
  owner?: number;
  questiontext?: string;
  questiontags?: string[];
  questiontype?: QuestionType;
  questionconfiguration?: Choice | FillInTheBlanks | QuestionType.SQL;
  difficulty?: number
}

export interface QuestionWithoutId { 
  owner: number;
  questiontext?: string;
  questiontags: string[];
  questiontype: QuestionType;
  questionconfiguration: Choice | FillInTheBlanks | QuestionType.SQL;
  createdAt: Date,
  lastEdited: Date
  difficulty?: number
}