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
    await db.collection("question").deleteMany({});
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api_v2/questions");
    expect(res.status).toBe(401);
  });

  it("creates and retrieves a question", async () => {
    const payload = {
      text: "Was ist 2 + 2?",
      competencyIds: ["arithmetic"],
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
      .send({ text: "Original", competencyIds: ["c1"], difficulty: 0.3 });

    const updateRes = await request(app)
      .put(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader)
      .send({ text: "Updated", difficulty: 0.5 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.text).toBe("Updated");
    expect(updateRes.body.difficulty).toBe(0.5);
    expect(updateRes.body.competencyIds).toEqual(["c1"]);
  });

  it("deletes a question", async () => {
    const createRes = await request(app)
      .post("/api_v2/questions")
      .set("authorization", authHeader)
      .send({ text: "To delete", competencyIds: ["c1"], difficulty: 0.1 });

    const deleteRes = await request(app)
      .delete(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api_v2/questions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(getRes.status).toBe(404);
  });
});
