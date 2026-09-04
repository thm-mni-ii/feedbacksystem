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

  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api_v2/competencies")
      .set("authorization", authHeader)
      .send({ name: "" });

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
});
