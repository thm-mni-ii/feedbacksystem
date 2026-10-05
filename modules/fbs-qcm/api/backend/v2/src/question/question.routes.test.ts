import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";

describe("Question routes", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let app: Express;
  let authHeader: string;
  let competencyId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db("QCM_v2_test");
    app = createApp(db);

    const token = jwt.sign({ username: "tester", id: 1 }, process.env.JWT_SECRET);
    authHeader = `Bearer ${token}`;
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const result = await db.collection("competency").insertOne({ name: "Arithmetic" });
    competencyId = result.insertedId.toHexString();
  });

  afterEach(async () => {
    await db.collection("question").deleteMany({});
    await db.collection("competency").deleteMany({});
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api_v2/questions");
    expect(res.status).toBe(401);
  });

  it("creates and retrieves a question", async () => {
    const payload = {
      text: "Was ist 2 + 2?",
      competencyIds: [competencyId],
      difficulty: 0.2
    };

    const createRes = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send(payload);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject(payload);
    expect(typeof createRes.body.id).toBe("string");

    const listRes = await request(app)
      .get("/api_v2/questions")
      .set("authorization", authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const getRes = await request(app)
      .get(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject(payload);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "", competencyIds: [], difficulty: 0.5 });

    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown question id", async () => {
    const res = await request(app)
      .get("/api_v2/questions/000000000000000000000000")
      .set("authorization", authHeader);

    expect(res.status).toBe(404);
  });

  it("updates a question", async () => {
    const createRes = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "Original", competencyIds: [competencyId], difficulty: 0.3 });

    const updateRes = await request(app)
      .put(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader)
      .send({ text: "Updated", difficulty: 0.5 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.text).toBe("Updated");
    expect(updateRes.body.difficulty).toBe(0.5);
    expect(updateRes.body.competencyIds).toEqual([competencyId]);
  });

  it("deletes a question", async () => {
    const createRes = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "To delete", competencyIds: [competencyId], difficulty: 0.1 });

    const deleteRes = await request(app)
      .delete(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(getRes.status).toBe(404);
  });

  it("creates a matching question with valid category references", async () => {
    const payload = {
      text: "Ordnen Sie die Begriffe zu.",
      competencyIds: [competencyId],
      difficulty: 0.5,
      questionType: "Matching",
      questionConfiguration: {
        categories: [
          { id: "entity", label: "ERM-Begriff" },
          { id: "key", label: "Schlüssel" }
        ],
        items: [
          { id: "item-1", text: "Entität", correctCategoryId: "entity" },
          { id: "item-2", text: "Primärschlüssel", correctCategoryId: "key" }
        ]
      }
    };

    const res = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
  });

  it("rejects matching items that reference an unknown category", async () => {
    const res = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({
        text: "Ordnen Sie die Begriffe zu.",
        competencyIds: [competencyId],
        difficulty: 0.5,
        questionType: "Matching",
        questionConfiguration: {
          categories: [{ id: "entity", label: "ERM-Begriff" }],
          items: [{ id: "item-1", text: "Entität", correctCategoryId: "unknown" }]
        }
      });

    expect(res.status).toBe(400);
  });

  it.each(["Matching", "matching"])("validates merged %s questions on partial updates", async (questionType) => {
    const questionConfiguration = {
      categories: [{ id: "category", label: "Category" }],
      items: [{ id: "item", text: "Item", correctCategoryId: "category" }]
    };
    const created = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "Matching", competencyIds: [competencyId], difficulty: 0.5, questionType, questionConfiguration });
    expect(created.status).toBe(201);

    for (const invalid of [
      { categories: questionConfiguration.categories },
      { ...questionConfiguration, items: [] },
      { ...questionConfiguration, items: [{ id: "item", text: "Item", correctCategoryId: "unknown" }] },
      null
    ]) {
      const res = await request(app)
        .put(`/api_v2/questions/${created.body.id}`)
        .set("authorization", authHeader)
        .send({ questionConfiguration: invalid });
      expect(res.status).toBe(400);
    }

    const updated = await request(app)
      .put(`/api_v2/questions/${created.body.id}`)
      .set("authorization", authHeader)
      .send({ text: "Updated" });
    expect(updated.status).toBe(200);
    expect(updated.body.questionConfiguration).toEqual(questionConfiguration);

    const typeOnly = await request(app)
      .put(`/api_v2/questions/${created.body.id}`)
      .set("authorization", authHeader)
      .send({ questionType: "Matching" });
    expect(typeOnly.status).toBe(200);
  });

  it("rejects switching to Matching without a valid effective configuration", async () => {
    const created = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "Original", competencyIds: [], difficulty: 0.5 });
    expect(created.status).toBe(201);
    const res = await request(app)
      .put(`/api_v2/questions/${created.body.id}`)
      .set("authorization", authHeader)
      .send({ questionType: "Matching" });
    expect(res.status).toBe(400);
  });

  it.each(["000000000000000000000000", "unknown"])(
    "rejects unknown competency IDs and links on create/update (%s)",
    async (unknownId) => {
      const original = { text: "Original", competencyIds: [competencyId], difficulty: 0.3 };
      const created = await request(app)
        .post("/api_v2/questions")
        .set("authorization", authHeader)
        .send(original);
      expect(created.status).toBe(201);
      for (const references of [
        { competencyIds: [unknownId] },
        { competencyLinks: [{ competencyId: unknownId }] }
      ]) {
        const createRes = await request(app)
          .post("/api_v2/questions")
          .set("authorization", authHeader)
          .send({ ...original, ...references });
        expect(createRes.status).toBe(400);
        const updateRes = await request(app)
          .put(`/api_v2/questions/${created.body.id}`)
          .set("authorization", authHeader)
          .send(references);
        expect(updateRes.status).toBe(400);
      }
      const getRes = await request(app)
        .get(`/api_v2/questions/${created.body.id}`)
        .set("authorization", authHeader);
      expect(getRes.body).toMatchObject(original);
      expect(await db.collection("question").countDocuments()).toBe(1);
    }
  );

  it("accepts existing competency links on create and update", async () => {
    const created = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({
        text: "Linked",
        competencyIds: [competencyId],
        competencyLinks: [{ competencyId, relation: "required" }],
        difficulty: 0.3
      });
    expect(created.status).toBe(201);
    const res = await request(app)
      .put(`/api_v2/questions/${created.body.id}`)
      .set("authorization", authHeader)
      .send({ competencyLinks: [{ competencyId, relation: "supporting" }] });
    expect(res.status).toBe(200);
    expect(res.body.competencyLinks).toEqual([{ competencyId, relation: "supporting" }]);
  });
});
