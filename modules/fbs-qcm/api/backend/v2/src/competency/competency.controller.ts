import { Request, Response } from "express";
import { CompetencyRepository } from "./competency.repository";
import { validateCompetencyInput, validateCompetencyUpdate } from "./competency.validation";

export class CompetencyController {
  constructor(private readonly repository: CompetencyRepository) {}

  list = async (_req: Request, res: Response) => {
    const competencies = await this.repository.findAll();
    res.json(competencies);
  };

  getById = async (req: Request, res: Response) => {
    const competency = await this.repository.findById(req.params.id);
    res.json(competency);
  };

  create = async (req: Request, res: Response) => {
    const input = validateCompetencyInput(req.body);
    const competency = await this.repository.create(input);
    res.status(201).json(competency);
  };

  update = async (req: Request, res: Response) => {
    const update = validateCompetencyUpdate(req.body);
    const competency = await this.repository.update(req.params.id, update);
    res.json(competency);
  };

  remove = async (req: Request, res: Response) => {
    await this.repository.delete(req.params.id);
    res.status(204).send();
  };
}
