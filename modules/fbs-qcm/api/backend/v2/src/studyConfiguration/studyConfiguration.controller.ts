import { Request, Response } from "express";
import { ForbiddenError, ValidationError } from "../shared/errors";
import { StudyConfigurationRepository } from "./studyConfiguration.repository";
import {
  validateConfigurationReset,
  validateConfigurationUpdate
} from "./studyConfiguration.validation";

export class StudyConfigurationController {
  constructor(private readonly repository: StudyConfigurationRepository) {}

  get = async (req: Request, res: Response) => {
    res.json(await this.repository.get(this.courseId(req)));
  };

  update = async (req: Request, res: Response) => {
    const input = validateConfigurationUpdate(req.body);
    res.json(
      await this.repository.update(
        this.courseId(req),
        input.overrides,
        input.revision,
        this.userId(req)
      )
    );
  };

  reset = async (req: Request, res: Response) => {
    const input = validateConfigurationReset(req.body);
    res.json(
      await this.repository.reset(this.courseId(req), input.revision, this.userId(req))
    );
  };

  private courseId(req: Request): string {
    const courseId = req.params.courseId?.trim();
    if (!courseId) {
      throw new ValidationError("Course ID is required");
    }
    return courseId;
  }

  private userId(req: Request): string {
    if (!req.user) {
      throw new ForbiddenError("Authenticated user is required");
    }
    return String(req.user.id);
  }
}
