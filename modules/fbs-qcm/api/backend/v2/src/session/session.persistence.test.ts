import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient, ObjectId } from "mongodb";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";
import { ensureSessionIndexes } from "./session.repository";
import { validateQuestionAttemptInput } from "./questionAttempt.validation";
import { validateSessionReplace } from "./session.validation";

const sessionState = () => ({
  courseId: "course",
  startedAt: 1000,
  updatedAt: 2000,
  completedAt: null,
  competencies: {
    skill: { competencyId: "skill", score: 0.8, timesAssessed: 1, lastAssessedAt: 2000 }
  },
  recentQuestionIds: ["question"],
  excludedQuestionIds: ["excluded"],
  currentCompetencyId: "skill",
  questionsInCurrentCompetency: 1
});

const attemptInput = (sessionId = "session") => ({
  sessionId,
  studentId: "1",
  clientAttemptId: "client-answer",
  questionId: "question",
  targetCompetencyId: "skill",
  competencyIds: ["skill"],
  evaluation: { score: 0.8, source: "automatic" },
  responsePayload: { answers: ["yes"], metadata: { b: 2, a: 1 } },
  submittedAt: 2000,
  responseTimeMs: 500,
  predictionBefore: 0.6,
  sessionStateAfter: sessionState()
});

describe("session persistence validation", () => {
  it.each([-0.1, 1.1, Infinity, NaN])("rejects evaluation score %s", (score) => {
    const input = attemptInput();
    input.evaluation.score = score;
    expect(() => validateQuestionAttemptInput(input)).toThrow();
  });

  it.each([-1, Infinity, NaN])("rejects response duration %s", (responseTimeMs) => {
    expect(() => validateQuestionAttemptInput({ ...attemptInput(), responseTimeMs })).toThrow();
  });

  it.each([-0.1, 1.1, Infinity, NaN])("rejects snapshot competency score %s", (score) => {
    const input = attemptInput();
    input.sessionStateAfter.competencies.skill.score = score;
    expect(() => validateQuestionAttemptInput(input)).toThrow();
  });

  it.each([-0.1, 1.1, Infinity, NaN])("rejects prediction score %s", (predictionBefore) => {
    expect(() => validateQuestionAttemptInput({ ...attemptInput(), predictionBefore })).toThrow();
  });

  it("rejects malformed snapshots and server-owned fields", () => {
    for (const snapshot of [
      [],
      { ...sessionState(), competencies: [] },
      { ...sessionState(), questionsInCurrentCompetency: -1 },
      { ...sessionState(), recentQuestionIds: ["question", 1] },
      { ...sessionState(), algorithm: {} },
      { ...sessionState(), studentId: "2" },
      { ...sessionState(), history: [] },
      { ...sessionState(), id: "other" }
    ]) {
      expect(() => validateQuestionAttemptInput({ ...attemptInput(), sessionStateAfter: snapshot })).toThrow();
    }
    expect(() => validateSessionReplace({ ...sessionState(), updatedAt: Infinity })).toThrow();
  });

  it("accepts legacy attempts without a retry key or snapshot and score boundaries", () => {
    const { clientAttemptId, sessionStateAfter, ...legacy } = attemptInput();
    void clientAttemptId;
    void sessionStateAfter;
    expect(validateQuestionAttemptInput({ ...legacy, evaluation: { score: 0, source: "automatic" } })).toBeDefined();
    expect(validateQuestionAttemptInput({ ...legacy, evaluation: { score: 1, source: "automatic" } })).toBeDefined();
  });
});

describe("session persistence recovery", () => {
  let server: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let app: Express;
  let authorization: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    server = await MongoMemoryServer.create();
    client = new MongoClient(server.getUri());
    await client.connect();
    db = client.db("session_recovery_test");
    await ensureSessionIndexes(db);
    app = createApp(db);
    authorization = `Bearer ${jwt.sign({ username: "tester", id: 1 }, "test-secret")}`;
  });

  afterEach(async () => {
    await Promise.all(["session", "questionAttempt", "learningAttempt"].map((name) => db.collection(name).deleteMany({})));
  });

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  async function createSession(): Promise<string> {
    const response = await request(app).post("/api_v2/sessions")
      .set("authorization", authorization)
      .send({ ...sessionState(), updatedAt: 1000, studentId: "1" });
    expect(response.status).toBe(201);
    return response.body.id;
  }

  it("roundtrips a recovery snapshot while the session PUT has not succeeded", async () => {
    const sessionId = await createSession();
    const input = attemptInput(sessionId);
    const response = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization).send(input);
    expect(response.status).toBe(201);
    expect(response.body.sessionStateAfter).toEqual(input.sessionStateAfter);
    expect(response.body.clientAttemptId).toBe(input.clientAttemptId);
    expect(response.body.predictionBefore).toBe(input.predictionBefore);
    const attempts = await request(app).get(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization);
    expect(attempts.body[0]).toEqual(response.body);
    const session = await request(app).get(`/api_v2/sessions/${sessionId}`)
      .set("authorization", authorization);
    expect(session.body.updatedAt).toBe(1000);
    expect(session.body.algorithm).toBeDefined();
  });

  it("deduplicates concurrent retries and rejects changed payloads with 409", async () => {
    const sessionId = await createSession();
    const input = attemptInput(sessionId);
    const responses = await Promise.all([1, 2].map(() => request(app)
      .post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization).send(input)));
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(responses[0].body).toEqual(responses[1].body);
    expect(await db.collection("questionAttempt").countDocuments()).toBe(1);

    const retry = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization)
      .send({ ...input, responsePayload: { metadata: { a: 1, b: 2 }, answers: ["yes"] } });
    expect(retry.body.id).toBe(responses[0].body.id);
    const conflict = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization).send({ ...input, responseTimeMs: 600 });
    expect(conflict.status).toBe(409);
    const snapshotConflict = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
      .set("authorization", authorization)
      .send({ ...input, sessionStateAfter: { ...input.sessionStateAfter, completedAt: 2000 } });
    expect(snapshotConflict.status).toBe(409);
  });

  it("scopes retry keys to the owning session and checks ownership before duplicates", async () => {
    for (const sessionId of [await createSession(), await createSession()]) {
      const response = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
        .set("authorization", authorization).send(attemptInput(sessionId));
      expect(response.status).toBe(201);
      const unauthorized = await request(app).post(`/api_v2/sessions/${sessionId}/attempts`)
        .set("authorization", `Bearer ${jwt.sign({ username: "other", id: 2 }, "test-secret")}`)
        .send({ ...attemptInput(sessionId), studentId: "2" });
      expect(unauthorized.status).toBe(404);
    }
    expect(await db.collection("questionAttempt").countDocuments()).toBe(2);
  });

  it("retains the legacy source and conflicting contents during non-destructive copying", async () => {
    const id = new ObjectId();
    const newId = new ObjectId();
    await db.collection("learningAttempt").insertMany([
      { _id: id, sessionId: "old", studentId: "1", responseTimeMs: 100 },
      { _id: newId, sessionId: "new", studentId: "1", responseTimeMs: 200 }
    ]);
    await db.collection("questionAttempt").insertOne({ _id: id, responseTimeMs: 999 });
    const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await ensureSessionIndexes(db);
      expect(await db.collection("learningAttempt").countDocuments()).toBe(2);
      expect((await db.collection("questionAttempt").findOne({ _id: id }))?.responseTimeMs).toBe(999);
      expect((await db.collection("learningAttempt").findOne({ _id: id }))?.responseTimeMs).toBe(100);
      expect(await db.collection("questionAttempt").findOne({ _id: newId })).not.toBeNull();
      expect(warning).toHaveBeenCalled();
    } finally {
      warning.mockRestore();
    }
  });
});
