import { Collection, Db, MongoServerError, WithId } from "mongodb";
import { AnswerEvaluation, QuestionAttempt, QuestionAttemptInput } from "./questionAttempt.model";
import { ConflictError } from "../shared/errors";
import type { StudySessionReplace } from "./session.model";

/**
 * Mongo-Dokument für ein Lernereignis. `submittedAt` wird als `Date`
 * gespeichert, aber beim Lesen zu `number` (Unix-Millis) konvertiert, damit
 * das Domänenmodell (`QuestionAttempt`) unverändert bleibt.
 */
interface QuestionAttemptDocument {
  clientAttemptId?: string;
  sessionStateAfter?: StudySessionReplace;
  predictionBefore?: number;
  sessionId: string;
  studentId: string;
  questionId: string;
  targetCompetencyId: string;
  competencyIds: string[];
  evaluation: AnswerEvaluation;
  responsePayload?: unknown;
  submittedAt: Date;
  responseTimeMs: number;
}

function toQuestionAttempt(doc: WithId<QuestionAttemptDocument>): QuestionAttempt {
  return {
    id: doc._id.toHexString(),
    clientAttemptId: doc.clientAttemptId,
    sessionStateAfter: doc.sessionStateAfter,
    predictionBefore: doc.predictionBefore,
    sessionId: doc.sessionId,
    studentId: doc.studentId,
    questionId: doc.questionId,
    targetCompetencyId: doc.targetCompetencyId,
    competencyIds: doc.competencyIds,
    evaluation: doc.evaluation,
    responsePayload: doc.responsePayload,
    submittedAt: doc.submittedAt.getTime(),
    responseTimeMs: doc.responseTimeMs
  };
}

function toQuestionAttemptDocument(input: QuestionAttemptInput): QuestionAttemptDocument {
  return {
    ...(input.clientAttemptId !== undefined ? { clientAttemptId: input.clientAttemptId } : {}),
    ...(input.sessionStateAfter !== undefined ? { sessionStateAfter: input.sessionStateAfter } : {}),
    ...(input.predictionBefore !== undefined ? { predictionBefore: input.predictionBefore } : {}),
    sessionId: input.sessionId,
    studentId: input.studentId,
    questionId: input.questionId,
    targetCompetencyId: input.targetCompetencyId,
    competencyIds: input.competencyIds,
    evaluation: input.evaluation,
    ...(input.responsePayload !== undefined ? { responsePayload: input.responsePayload } : {}),
    submittedAt: new Date(input.submittedAt),
    responseTimeMs: input.responseTimeMs
  };
}

/**
 * Ein QuestionAttempt ist unveränderlich (Event-Log): kein `update`/`delete`,
 * nur `create` und lesender Zugriff.
 */
export class QuestionAttemptRepository {
  private readonly collection: Collection<QuestionAttemptDocument>;

  constructor(db: Db) {
    this.collection = db.collection<QuestionAttemptDocument>("questionAttempt");
  }

  async create(input: QuestionAttemptInput): Promise<QuestionAttempt> {
    const document = toQuestionAttemptDocument(input);
    const scope = {
      sessionId: input.sessionId,
      studentId: input.studentId,
      clientAttemptId: input.clientAttemptId
    };
    const existing = input.clientAttemptId === undefined
      ? null
      : await this.collection.findOne(scope);
    if (existing) return this.checkRetry(existing, document);
    try {
      const result = await this.collection.insertOne(document);
      return toQuestionAttempt({
        _id: result.insertedId,
        ...document
      } as WithId<QuestionAttemptDocument>);
    } catch (error) {
      if (input.clientAttemptId !== undefined && error instanceof MongoServerError && error.code === 11000) {
        const concurrent = await this.collection.findOne(scope);
        if (concurrent) return this.checkRetry(concurrent, document);
      }
      throw error;
    }
  }

  private checkRetry(
    existing: WithId<QuestionAttemptDocument>,
    document: QuestionAttemptDocument
  ): QuestionAttempt {
    const { _id, ...original } = existing;
    void _id;
    // Mongo adds _id to inserted documents; it is not part of the client request.
    const { _id: insertedId, ...request } = document as QuestionAttemptDocument & { _id?: unknown };
    void insertedId;
    if (canonicalJson(original) !== canonicalJson(request)) {
      throw new ConflictError("clientAttemptId was already used with a different attempt payload");
    }
    return toQuestionAttempt(existing);
  }

  async findBySessionId(sessionId: string): Promise<QuestionAttempt[]> {
    const docs = await this.collection
      .find({ sessionId })
      .sort({ submittedAt: 1, _id: 1 })
      .toArray();
    return docs.map(toQuestionAttempt);
  }

}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, entry) => {
    if (entry !== null && typeof entry === "object" && !Array.isArray(entry)) {
      return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]]));
    }
    return entry;
  });
}
