import { Request, Response } from "express";
import { SessionRepository } from "./session.repository";
import { validateSessionInput, validateSessionReplace } from "./session.validation";
import { ForbiddenError } from "../shared/errors";
import { StudyConfigurationRepository } from "../studyConfiguration/studyConfiguration.repository";
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from "../studyConfiguration/studyAlgorithmConfig";

export class SessionController {
  constructor(
    private readonly repository: SessionRepository,
    private readonly studyConfigurationRepository: StudyConfigurationRepository
  ) {}

  getById = async (req: Request, res: Response) => {
    const session = await this.repository.findByIdForStudent(req.params.id, this.studentId(req));
    res.json(session);
  };

  listByStudent = async (req: Request, res: Response) => {
    const studentId = req.query.studentId;
    if (typeof studentId !== "string" || studentId.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "studentId" is required' });
      return;
    }
    this.assertStudentOwnership(req, studentId);
    const sessions = await this.repository.findByStudentId(studentId);
    res.json(sessions);
  };

  create = async (req: Request, res: Response) => {
    const input = validateSessionInput(req.body);
    this.assertStudentOwnership(req, input.studentId);
    const courseConfiguration = input.courseId
      ? await this.studyConfigurationRepository.get(input.courseId)
      : {
          effectiveConfig: DEFAULT_STUDY_ALGORITHM_CONFIG,
          revision: 0
        };
    const session = await this.repository.create({
      ...input,
      algorithm: {
        configuration: courseConfiguration.effectiveConfig,
        courseConfigurationRevision: courseConfiguration.revision
      }
    });
    res.status(201).json(session);
  };

  replace = async (req: Request, res: Response) => {
    const replacement = validateSessionReplace(req.body);
    const session = await this.repository.replaceForStudent(
      req.params.id,
      this.studentId(req),
      replacement
    );
    res.json(session);
  };

  private studentId(req: Request): string {
    if (!req.user) {
      throw new ForbiddenError("Authenticated user is required");
    }
    return String(req.user.id);
  }

  private assertStudentOwnership(req: Request, studentId: string): void {
    if (studentId !== this.studentId(req)) {
      throw new ForbiddenError("Student ID does not match the authenticated user");
    }
  }
}
