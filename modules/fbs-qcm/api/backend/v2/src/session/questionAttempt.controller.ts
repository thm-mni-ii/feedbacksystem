import { Request, Response } from "express";
import { QuestionAttemptRepository } from "./questionAttempt.repository";
import { validateQuestionAttemptInput } from "./questionAttempt.validation";
import { ForbiddenError, ValidationError } from "../shared/errors";
import { SessionRepository } from "./session.repository";

export class QuestionAttemptController {
  constructor(
    private readonly repository: QuestionAttemptRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  create = async (req: Request, res: Response) => {
    const input = validateQuestionAttemptInput(req.body);
    const studentId = this.studentId(req);
    if (input.sessionId !== req.params.id) {
      throw new ValidationError("Attempt sessionId must match the session URL");
    }
    if (input.studentId !== studentId) {
      throw new ForbiddenError("Student ID does not match the authenticated user");
    }
    await this.sessionRepository.findByIdForStudent(input.sessionId, studentId);
    const attempt = await this.repository.create(input);
    res.status(201).json(attempt);
  };

  listBySession = async (req: Request, res: Response) => {
    await this.sessionRepository.findByIdForStudent(req.params.id, this.studentId(req));
    const attempts = await this.repository.findBySessionId(req.params.id);
    res.json(attempts);
  };

  private studentId(req: Request): string {
    if (!req.user) {
      throw new ForbiddenError("Authenticated user is required");
    }
    return String(req.user.id);
  }
}
