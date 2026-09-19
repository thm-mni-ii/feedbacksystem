import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from "../studyConfiguration/studyAlgorithmConfig";

describe("Session routes", () => {
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
    await db.collection("session").deleteMany({});
    await db.collection("questionAttempt").deleteMany({});
    await db.collection("courseStudyConfiguration").deleteMany({});
  });

  const validSessionPayload = () => ({
    studentId: "1",
    algorithm: {
      configuration: DEFAULT_STUDY_ALGORITHM_CONFIG,
      courseConfigurationRevision: 0
    },
    startedAt: 1000,
    updatedAt: 1000,
    competencies: {
      "c-1": { competencyId: "c-1", score: 0.35, timesAssessed: 0, lastAssessedAt: null }
    },
    recentQuestionIds: [],
    excludedQuestionIds: [],
    currentCompetencyId: null,
    questionsInCurrentCompetency: 0
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).post("/api_v2/sessions").send(validSessionPayload());
    expect(res.status).toBe(401);
  });

  it("creates and retrieves a session", async () => {
    const createRes = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send(validSessionPayload());

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({ studentId: "1" });
    expect(createRes.body.id).toBeDefined();

    const getRes = await request(app)
      .get(`/api_v2/sessions/${createRes.body.id}`)
      .set("authorization", authHeader);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toMatchObject({ studentId: "1" });
  });

  it("returns 400 for invalid session input", async () => {
    const res = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send({ studentId: "" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown session id", async () => {
    const res = await request(app)
      .get("/api_v2/sessions/000000000000000000000000")
      .set("authorization", authHeader);

    expect(res.status).toBe(404);
  });

  it("replaces the full session state, keeping id and studentId unchanged", async () => {
    const createRes = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send(validSessionPayload());

    const replacement = {
      ...validSessionPayload(),
      updatedAt: 2000,
      questionsInCurrentCompetency: 3,
      currentCompetencyId: "c-1",
      algorithm: {
        configuration: {
          ...DEFAULT_STUDY_ALGORITHM_CONFIG,
          selection: {
            ...DEFAULT_STUDY_ALGORITHM_CONFIG.selection,
            stickinessQuestions: 20
          }
        },
        courseConfigurationRevision: 99
      }
    };
    delete (replacement as { studentId?: string }).studentId;

    const replaceRes = await request(app)
      .put(`/api_v2/sessions/${createRes.body.id}`)
      .set("authorization", authHeader)
      .send(replacement);

    expect(replaceRes.status).toBe(200);
    expect(replaceRes.body.id).toBe(createRes.body.id);
    expect(replaceRes.body.studentId).toBe("1");
    expect(replaceRes.body.questionsInCurrentCompetency).toBe(3);
    expect(replaceRes.body.algorithm.configuration.selection.stickinessQuestions).toBe(3);
    expect(replaceRes.body.algorithm.courseConfigurationRevision).toBe(0);
  });

  it("snapshots the current course configuration when creating a session", async () => {
    const configurationResponse = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({
        revision: 0,
        overrides: { selection: { stickinessQuestions: 4 } }
      });
    expect(configurationResponse.status).toBe(200);

    const createResponse = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send({ ...validSessionPayload(), courseId: "1" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.algorithm.courseConfigurationRevision).toBe(1);
    expect(createResponse.body.algorithm.configuration.selection.stickinessQuestions).toBe(4);
  });

  it("creates and lists learning attempts for a session, sorted by submittedAt", async () => {
    const sessionRes = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send(validSessionPayload());
    const sessionId = sessionRes.body.id;

    const attemptPayload = (submittedAt: number) => ({
      sessionId,
      studentId: "1",
      questionId: "q-1",
      targetCompetencyId: "c-1",
      competencyIds: ["c-1"],
      evaluation: { score: 0.8, source: "automatic" },
      submittedAt,
      responseTimeMs: 1500
    });

    await request(app)
      .post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authHeader)
      .send(attemptPayload(2000));

    await request(app)
      .post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authHeader)
      .send(attemptPayload(1000));

    const listRes = await request(app)
      .get(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(2);
    expect(listRes.body[0].submittedAt).toBe(1000);
    expect(listRes.body[1].submittedAt).toBe(2000);
  });

  it("returns 400 for invalid learning attempt input", async () => {
    const res = await request(app)
      .post("/api_v2/sessions/000000000000000000000000/attempts")
      .set("authorization", authHeader)
      .send({ sessionId: "" });

    expect(res.status).toBe(400);
  });

  it("only allows a session owner to access their session data", async () => {
    const createRes = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send(validSessionPayload());

    const otherToken = jwt.sign({ username: "other", id: 2 }, "test-secret");
    const otherAuthHeader = `Bearer ${otherToken}`;

    const getRes = await request(app)
      .get(`/api_v2/sessions/${createRes.body.id}`)
      .set("authorization", otherAuthHeader);
    expect(getRes.status).toBe(404);

    const listRes = await request(app)
      .get("/api_v2/sessions")
      .query({ studentId: "1" })
      .set("authorization", otherAuthHeader);
    expect(listRes.status).toBe(403);
  });

  it("rejects attempts that do not match the route session or authenticated student", async () => {
    const sessionRes = await request(app)
      .post("/api_v2/sessions")
      .set("authorization", authHeader)
      .send(validSessionPayload());

    const payload = {
      sessionId: "000000000000000000000000",
      studentId: "1",
      questionId: "q-1",
      targetCompetencyId: "c-1",
      competencyIds: ["c-1"],
      evaluation: { score: 0.8, source: "automatic" },
      submittedAt: 1000,
      responseTimeMs: 1500
    };

    const mismatchedSessionRes = await request(app)
      .post(`/api_v2/sessions/${sessionRes.body.id}/attempts`)
      .set("authorization", authHeader)
      .send(payload);
    expect(mismatchedSessionRes.status).toBe(400);

    const mismatchedStudentRes = await request(app)
      .post(`/api_v2/sessions/${sessionRes.body.id}/attempts`)
      .set("authorization", authHeader)
      .send({ ...payload, sessionId: sessionRes.body.id, studentId: "2" });
    expect(mismatchedStudentRes.status).toBe(403);
  });
});
