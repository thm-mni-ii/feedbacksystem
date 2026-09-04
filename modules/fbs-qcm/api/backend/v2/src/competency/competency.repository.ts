import { Collection, Db, ObjectId, WithId } from "mongodb";
import { NotFoundError } from "../shared/errors";
import { Competency, CompetencyInput, CompetencyUpdate } from "./competency.model";

interface CompetencyDocument {
  name: string;
  description?: string;
  parentId?: string | null;
  category?: string;
  prerequisites?: Competency["prerequisites"];
}

function toCompetency(doc: WithId<CompetencyDocument>): Competency {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    parentId: doc.parentId,
    category: doc.category,
    prerequisites: doc.prerequisites
  };
}

export class CompetencyRepository {
  private readonly collection: Collection<CompetencyDocument>;

  constructor(db: Db) {
    this.collection = db.collection<CompetencyDocument>("competency");
  }

  async findAll(): Promise<Competency[]> {
    const docs = await this.collection.find().toArray();
    return docs.map(toCompetency);
  }

  async findById(id: string): Promise<Competency> {
    const doc = await this.collection.findOne({ _id: parseId(id) });
    if (!doc) {
      throw new NotFoundError(`Competency ${id} not found`);
    }
    return toCompetency(doc);
  }

  async create(input: CompetencyInput): Promise<Competency> {
    const result = await this.collection.insertOne(input as CompetencyDocument);
    return toCompetency({ _id: result.insertedId, ...input } as WithId<CompetencyDocument>);
  }

  async update(id: string, update: CompetencyUpdate): Promise<Competency> {
    const result = await this.collection.findOneAndUpdate(
      { _id: parseId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new NotFoundError(`Competency ${id} not found`);
    }
    return toCompetency(result);
  }

  async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: parseId(id) });
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Competency ${id} not found`);
    }
  }
}

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new NotFoundError(`Competency ${id} not found`);
  }
  return new ObjectId(id);
}
