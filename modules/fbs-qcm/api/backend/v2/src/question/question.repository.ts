import { Collection, Db, ObjectId, WithId } from "mongodb";
import { NotFoundError } from "../shared/errors";
import { Question, QuestionInput, QuestionUpdate } from "./question.model";

interface QuestionDocument {
  text: string;
  title?: string;
  competencyIds: string[];
  competencyLinks?: Question["competencyLinks"];
  difficulty: number;
  excludeFromAlgorithm?: boolean;
  questionType?: string;
  questionConfiguration?: Record<string, unknown>;
}

function toQuestion(doc: WithId<QuestionDocument>): Question {
  return {
    id: doc._id.toHexString(),
    text: doc.text,
    title: doc.title,
    competencyIds: doc.competencyIds,
    competencyLinks: doc.competencyLinks,
    difficulty: doc.difficulty,
    excludeFromAlgorithm: doc.excludeFromAlgorithm,
    questionType: doc.questionType,
    questionConfiguration: doc.questionConfiguration
  };
}

/**
 * Kapselt sämtlichen Mongo-Zugriff für Questions. Controller kennen keine
 * ObjectId/Collection-Details, nur diese Schnittstelle.
 */
export class QuestionRepository {
  private readonly collection: Collection<QuestionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<QuestionDocument>("question");
  }

  async findAll(): Promise<Question[]> {
    const docs = await this.collection.find().toArray();
    return docs.map(toQuestion);
  }

  async findById(id: string): Promise<Question> {
    const doc = await this.collection.findOne({ _id: parseId(id) });
    if (!doc) {
      throw new NotFoundError(`Question ${id} not found`);
    }
    return toQuestion(doc);
  }

  async create(input: QuestionInput): Promise<Question> {
    const result = await this.collection.insertOne(input as QuestionDocument);
    return toQuestion({ _id: result.insertedId, ...input } as WithId<QuestionDocument>);
  }

  async update(id: string, update: QuestionUpdate): Promise<Question> {
    const result = await this.collection.findOneAndUpdate(
      { _id: parseId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new NotFoundError(`Question ${id} not found`);
    }
    return toQuestion(result);
  }

  async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: parseId(id) });
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Question ${id} not found`);
    }
  }
}

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new NotFoundError(`Question ${id} not found`);
  }
  return new ObjectId(id);
}
