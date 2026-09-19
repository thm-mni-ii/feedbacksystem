import { Collection, Db, WithId } from "mongodb";
import { AnswerEvaluation, QuestionAttempt, QuestionAttemptInput } from "./questionAttempt.model";

/**
 * Mongo-Dokument für ein Lernereignis. `submittedAt` wird als `Date`
 * gespeichert, aber beim Lesen zu `number` (Unix-Millis) konvertiert, damit
 * das Domänenmodell (`QuestionAttempt`) unverändert bleibt.
 */
interface QuestionAttemptDocument {
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
    sessionId: input.sessionId,
    studentId: input.studentId,
    questionId: input.questionId,
    targetCompetencyId: input.targetCompetencyId,
    competencyIds: input.competencyIds,
    evaluation: input.evaluation,
    responsePayload: input.responsePayload,
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
    const result = await this.collection.insertOne(document);
    return toQuestionAttempt({
      _id: result.insertedId,
      ...document
    } as WithId<QuestionAttemptDocument>);
  }

  async findBySessionId(sessionId: string): Promise<QuestionAttempt[]> {
    const docs = await this.collection
      .find({ sessionId })
      .sort({ submittedAt: 1 })
      .toArray();
    return docs.map(toQuestionAttempt);
  }
}
