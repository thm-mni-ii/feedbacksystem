import { Collection, Db, ObjectId, WithId } from "mongodb";
import { ConflictError, NotFoundError, ValidationError } from "../shared/errors";
import { Competency, CompetencyInput, CompetencyUpdate } from "./competency.model";
import { QuestionInput } from "../question/question.model";

interface CompetencyDocument {
  name: string;
  description?: string;
  courseIds?: string[];
  parentId?: string | null;
  category?: string;
  prerequisites?: Competency["prerequisites"];
}

function toCompetency(doc: WithId<CompetencyDocument>): Competency {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    courseIds: doc.courseIds,
    parentId: doc.parentId,
    category: doc.category,
    prerequisites: doc.prerequisites
  };
}

export class CompetencyRepository {
  private readonly collection: Collection<CompetencyDocument>;
  private readonly questions: Collection<Pick<QuestionInput, "competencyIds" | "competencyLinks">>;

  constructor(db: Db) {
    this.collection = db.collection<CompetencyDocument>("competency");
    this.questions = db.collection("question");
  }

  async findAll(courseId?: string): Promise<Competency[]> {
    const docs = await this.collection.find(courseId ? { courseIds: courseId } : {}).toArray();
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
    await this.validateReferences(input);
    const result = await this.collection.insertOne(input as CompetencyDocument);
    return toCompetency({ _id: result.insertedId, ...input } as WithId<CompetencyDocument>);
  }

  async update(id: string, update: CompetencyUpdate): Promise<Competency> {
    const current = await this.findById(id);
    await this.validateReferences({ ...current, ...update });
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
    const objectId = parseId(id);
    await this.findById(id);
    // References are strings; ObjectId's hexadecimal spelling is case-insensitive.
    const reference = new RegExp(`^${objectId.toHexString()}$`, "i");
    const [question, competency] = await Promise.all([
      this.questions.findOne({
        $or: [{ competencyIds: reference }, { "competencyLinks.competencyId": reference }]
      }),
      this.collection.findOne({
        $or: [{ parentId: reference }, { "prerequisites.competencyId": reference }]
      })
    ]);
    if (question || competency) {
      throw new ConflictError(`Competency ${id} is still referenced`);
    }
    const result = await this.collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Competency ${id} not found`);
    }
  }

  async assertExist(ids: readonly string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.some((id) => !ObjectId.isValid(id))) {
      throw new ValidationError("Referenced competencies must exist");
    }
    const objectIds = uniqueIds.map((id) => new ObjectId(id));
    if (objectIds.length === 0) return;
    const existing = await this.collection.find(
      { _id: { $in: objectIds } },
      { projection: { _id: 1 } }
    ).toArray();
    const existingIds = new Set(existing.map((doc) => doc._id.toHexString()));
    if (objectIds.some((id) => !existingIds.has(id.toHexString()))) {
      throw new ValidationError("Referenced competencies must exist");
    }
  }

  private async validateReferences(input: CompetencyInput): Promise<void> {
    await this.assertExist([
      ...(input.parentId ? [input.parentId] : []),
      ...(input.prerequisites ?? []).map((prerequisite) => prerequisite.competencyId)
    ]);
  }
}

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new NotFoundError(`Competency ${id} not found`);
  }
  return new ObjectId(id);
}
