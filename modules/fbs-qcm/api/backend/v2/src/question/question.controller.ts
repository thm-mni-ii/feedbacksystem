import { Request, Response } from "express";
import { QuestionRepository } from "./question.repository";
import {
  validateQuestionInput,
  validateQuestionUpdate,
} from "./question.validation";

export class QuestionController {
  constructor(private readonly repository: QuestionRepository) {}

  list = async (_req: Request, res: Response) => {
    const questions = await this.repository.findAll();
    res.json(questions);
  };

  getById = async (req: Request, res: Response) => {
    const question = await this.repository.findById(req.params.id);
    res.json(question);
  };

  create = async (req: Request, res: Response) => {
    const input = validateQuestionInput(req.body);
    const question = await this.repository.create(input);
    res.status(201).json(question);
  };

  update = async (req: Request, res: Response) => {
    const update = validateQuestionUpdate(req.body);
    const question = await this.repository.update(req.params.id, update);
    res.json(question);
  };

  remove = async (req: Request, res: Response) => {
    await this.repository.delete(req.params.id);
    res.status(204).send();
  };
}
