import { Collection, Db, ObjectId, WithId } from "mongodb";
import { NotFoundError } from "../shared/errors";
import {
  CompetencyState,
  StudySession,
  StudySessionCreate,
  StudySessionInput,
  StudySessionReplace
} from "./session.model";
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from "../studyConfiguration/studyAlgorithmConfig";

/**
 * Mongo-Dokument für eine Session. Zeitstempel werden als `Date` gespeichert
 * (Mongo-nativ), aber beim Lesen/Schreiben zu/von `number` (Unix-Millis)
 * konvertiert, damit das Domänenmodell (`StudySession`) unverändert bleibt.
 */
interface SessionDocument {
  studentId: string;
  courseId?: string | null;
  algorithm?: StudySession["algorithm"];
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  competencies: Record<string, CompetencyState>;
  recentQuestionIds: string[];
  excludedQuestionIds: string[];
  currentCompetencyId: string | null;
  questionsInCurrentCompetency: number;
}

function toStudySession(doc: WithId<SessionDocument>): StudySession {
  return {
    id: doc._id.toHexString(),
    studentId: doc.studentId,
    courseId: doc.courseId,
    algorithm: doc.algorithm ?? {
      configuration: DEFAULT_STUDY_ALGORITHM_CONFIG,
      courseConfigurationRevision: 0
    },
    startedAt: doc.startedAt.getTime(),
    updatedAt: doc.updatedAt.getTime(),
    completedAt: doc.completedAt ? doc.completedAt.getTime() : doc.completedAt,
    competencies: doc.competencies,
    recentQuestionIds: doc.recentQuestionIds,
    excludedQuestionIds: doc.excludedQuestionIds,
    currentCompetencyId: doc.currentCompetencyId,
    questionsInCurrentCompetency: doc.questionsInCurrentCompetency
  };
}

function toSessionDocument(
  input: StudySessionCreate | (StudySessionReplace & Pick<StudySession, "studentId" | "algorithm">)
): SessionDocument {
  return {
    studentId: input.studentId,
    courseId: input.courseId,
    algorithm: input.algorithm,
    startedAt: new Date(input.startedAt),
    updatedAt: new Date(input.updatedAt),
    completedAt: input.completedAt ? new Date(input.completedAt) : (input.completedAt as null | undefined),
    competencies: input.competencies,
    recentQuestionIds: input.recentQuestionIds,
    excludedQuestionIds: input.excludedQuestionIds,
    currentCompetencyId: input.currentCompetencyId,
    questionsInCurrentCompetency: input.questionsInCurrentCompetency
  };
}

export class SessionRepository {
  private readonly collection: Collection<SessionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<SessionDocument>("session");
  }

  async findByIdForStudent(id: string, studentId: string): Promise<StudySession> {
    const doc = await this.collection.findOne({ _id: parseId(id), studentId });
    if (!doc) {
      throw new NotFoundError(`Session ${id} not found`);
    }
    return toStudySession(doc);
  }

  async findByStudentId(studentId: string): Promise<StudySession[]> {
    const documents = await this.collection
      .find({ studentId })
      .sort({ startedAt: 1 })
      .toArray();
    return documents.map((document) => toStudySession(document));
  }

  async create(input: StudySessionCreate): Promise<StudySession> {
    const document = toSessionDocument(input);
    const result = await this.collection.insertOne(document);
    return toStudySession({ _id: result.insertedId, ...document } as WithId<SessionDocument>);
  }

  /**
   * Ersetzt den kompletten Session-Zustand (kein partielles Update), analog
   * zum bisherigen Frontend-Verhalten (`saveSession` überschreibt den
   * ganzen Datensatz). `studentId` und `id` bleiben unveränderlich.
   */
  async replaceForStudent(
    id: string,
    studentId: string,
    replacement: StudySessionReplace
  ): Promise<StudySession> {
    const existing = await this.collection.findOne({ _id: parseId(id), studentId });
    if (!existing) {
      throw new NotFoundError(`Session ${id} not found`);
    }

    const document = toSessionDocument({
      ...replacement,
      studentId,
      algorithm: existing.algorithm ?? {
        configuration: DEFAULT_STUDY_ALGORITHM_CONFIG,
        courseConfigurationRevision: 0
      }
    });
    const result = await this.collection.findOneAndUpdate(
      { _id: parseId(id), studentId },
      { $set: document },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new NotFoundError(`Session ${id} not found`);
    }
    return toStudySession(result);
  }
}

interface QuestionAttemptDocument {
  sessionId: string;
  studentId: string;
  submittedAt: Date;
}

export async function ensureSessionIndexes(db: Db): Promise<void> {
  const legacyAttemptCollection = "learningAttempt";
  const attemptCollection = "questionAttempt";
  const hasLegacyAttempts = await db
    .listCollections({ name: legacyAttemptCollection }, { nameOnly: true })
    .hasNext();

  if (hasLegacyAttempts) {
    await db
      .collection(legacyAttemptCollection)
      .aggregate([
        {
          $merge: {
            into: attemptCollection,
            on: "_id",
            whenMatched: "keepExisting",
            whenNotMatched: "insert"
          }
        }
      ])
      .toArray();
    await db.collection(legacyAttemptCollection).drop();
  }

  await Promise.all([
    db.collection<SessionDocument>("session").createIndex({ studentId: 1, startedAt: -1 }),
    db.collection<QuestionAttemptDocument>(attemptCollection).createIndex({
      sessionId: 1,
      submittedAt: 1
    }),
    db.collection<QuestionAttemptDocument>(attemptCollection).createIndex({
      studentId: 1,
      submittedAt: 1
    })
  ]);
}

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new NotFoundError(`Session ${id} not found`);
  }
  return new ObjectId(id);
}
