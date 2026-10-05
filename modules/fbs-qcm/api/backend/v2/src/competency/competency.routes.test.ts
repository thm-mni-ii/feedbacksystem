import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";

describe("Competency routes", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let app: Express;
  let authHeader: string;

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

  afterEach(async () => {
    await db.collection("competency").deleteMany({});
    await db.collection("question").deleteMany({});
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api_v2/competencies");
    expect(res.status).toBe(401);
  });

  it("creates and retrieves a competency with hierarchy fields", async () => {
    const parent = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Datenorganisation" });

    expect(parent.status).toBe(201);

    const payload = {
      name: "Dateikonzept",
      courseIds: ["course-1", "course-2"],
      parentId: parent.body.id,
      category: "database",
      prerequisites: [{ competencyId: parent.body.id, minimumMastery: 0.6 }]
    };

    const createRes = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send(payload);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject(payload);

    const listRes = await request(app)
      .get("/api_v2/competencies")
      .set("authorization", authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(2);
  });

  it("filters competencies by course", async () => {
    await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Shared", courseIds: ["course-1", "course-2"] });
    await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Other", courseIds: ["course-3"] });

    const res = await request(app)
      .get("/api_v2/competencies?courseId=course-2")
      .set("authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      name: "Shared",
      courseIds: ["course-1", "course-2"]
    });
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid course ids", async () => {
    const res = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Invalid", courseIds: ["course-1", ""] });

    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown competency id", async () => {
    const res = await request(app)
      .get("/api_v2/competencies/000000000000000000000000")
      .set("authorization", authHeader);

    expect(res.status).toBe(404);
  });

  it("updates and deletes a competency", async () => {
    const createRes = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Original" });

    const updateRes = await request(app)
      .put(`/api_v2/competencies/${createRes.body.id}`)
      .set("authorization", authHeader)
      .send({ name: "Updated" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Updated");

    const deleteRes = await request(app)
      .delete(`/api_v2/competencies/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api_v2/competencies/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(getRes.status).toBe(404);
  });

  it.each(["000000000000000000000000", "unknown"])(
    "rejects unknown hierarchy and prerequisite references on create/update (%s)",
    async (unknownId) => {
      const created = await request(app)
        .post("/api_v2/competencies")
        .set("authorization", authHeader)
        .send({ name: "Original" });
      expect(created.status).toBe(201);
      const original = await request(app)
        .get(`/api_v2/competencies/${created.body.id}`)
        .set("authorization", authHeader);
      for (const references of [
        { parentId: unknownId },
        { prerequisites: [{ competencyId: unknownId, minimumMastery: 0.6 }] }
      ]) {
        const createRes = await request(app)
          .post("/api_v2/competencies")
          .set("authorization", authHeader)
          .send({ name: "Invalid", ...references });
        expect(createRes.status).toBe(400);
        const updateRes = await request(app)
          .put(`/api_v2/competencies/${created.body.id}`)
          .set("authorization", authHeader)
          .send(references);
        expect(updateRes.status).toBe(400);
      }
      const getRes = await request(app)
        .get(`/api_v2/competencies/${created.body.id}`)
        .set("authorization", authHeader);
      expect(getRes.body.name).toBe("Original");
      expect(getRes.body).toEqual(original.body);
      expect(await db.collection("competency").countDocuments()).toBe(1);
    }
  );

  it.each(["questionIds", "questionLinks", "parent", "prerequisite"])(
    "rejects deleting a competency used by %s, then allows deletion after unlinking",
    async (usage) => {
      const created = await request(app)
        .post("/api_v2/competencies")
        .set("authorization", authHeader)
        .send({ name: "Used" });
      expect(created.status).toBe(201);
      const competencyId: string = created.body.id;
      if (usage === "questionIds" || usage === "questionLinks") {
        const question = await request(app)
          .post("/api_v2/questions")
          .set("authorization", authHeader)
          .send({
            text: "Uses skill",
            difficulty: 0.3,
            competencyIds: usage === "questionIds" ? [competencyId] : [],
            competencyLinks: usage === "questionLinks" ? [{ competencyId }] : []
          });
        expect(question.status).toBe(201);
      } else {
        const dependent = await request(app)
          .post("/api_v2/competencies")
          .set("authorization", authHeader)
          .send({
            name: "Dependent without questions",
            ...(usage === "parent"
              ? { parentId: competencyId }
              : { prerequisites: [{ competencyId, minimumMastery: 0.6 }] })
          });
        expect(dependent.status).toBe(201);
      }
      const rejected = await request(app)
        .delete(`/api_v2/competencies/${competencyId}`)
        .set("authorization", authHeader);
      expect(rejected.status).toBe(409);
      expect(await db.collection("competency").countDocuments({ name: "Used" })).toBe(1);

      await db.collection("question").deleteMany({});
      await db.collection("competency").deleteMany({ name: "Dependent without questions" });
      const deleted = await request(app)
        .delete(`/api_v2/competencies/${competencyId}`)
        .set("authorization", authHeader);
      expect(deleted.status).toBe(204);
    }
  );

  it("allows updating and unlinking competencies that have no questions", async () => {
    const parent = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Parent" });
    const child = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "Child" });
    expect(parent.status).toBe(201);
    expect(child.status).toBe(201);
    const linked = await request(app)
      .put(`/api_v2/competencies/${child.body.id}`)
      .set("authorization", authHeader)
      .send({
        parentId: parent.body.id,
        prerequisites: [{ competencyId: parent.body.id, minimumMastery: 0.6 }]
      });
    expect(linked.status).toBe(200);
    const unlinked = await request(app)
      .put(`/api_v2/competencies/${child.body.id}`)
      .set("authorization", authHeader)
      .send({ parentId: null, prerequisites: [] });
    expect(unlinked.status).toBe(200);
    const deleted = await request(app)
      .delete(`/api_v2/competencies/${parent.body.id}`)
      .set("authorization", authHeader);
    expect(deleted.status).toBe(204);
  });
});
