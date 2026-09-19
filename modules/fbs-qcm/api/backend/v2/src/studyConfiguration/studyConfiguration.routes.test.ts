import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "../app";
import { ensureStudyConfigurationIndexes } from "./studyConfiguration.repository";

describe("Course study configuration routes", () => {
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
    db = client.db("QCM_v2_study_configuration_test");
    await ensureStudyConfigurationIndexes(db);
    app = createApp(db);
    authHeader = [
      "Bearer",
      jwt.sign({ username: "tester", id: 1 }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      })
    ].join(" ");
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await db.collection("courseStudyConfiguration").deleteMany({});
  });

  it("returns application defaults when no course overrides exist", async () => {
    const response = await request(app)
      .get("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.revision).toBe(0);
    expect(response.body.overrides).toEqual({});
    expect(response.body.effectiveConfig.selection.stickinessQuestions).toBe(3);
    expect(response.body.effectiveConfig.session.maxQuestionsPerSession).toBe(30);
  });

  it("persists only overrides and resolves the effective configuration", async () => {
    const response = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({
        revision: 0,
        overrides: {
          session: { maxQuestionsPerSession: 20 },
          selection: { stickinessQuestions: 4 }
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.revision).toBe(1);
    expect(response.body.overrides).toEqual({
      session: { maxQuestionsPerSession: 20 },
      selection: { stickinessQuestions: 4 }
    });
    expect(response.body.effectiveConfig.session.maxQuestionsPerSession).toBe(20);
    expect(response.body.effectiveConfig.selection.difficultyWindow).toBe(0.2);

    const stored = await db.collection("courseStudyConfiguration").findOne({ courseId: "1" });
    expect(stored?.overrides).toEqual(response.body.overrides);
    expect(stored).not.toHaveProperty("effectiveConfig");
    expect(stored).not.toHaveProperty("defaults");
  });

  it("rejects stale revisions with 409", async () => {
    const payload = {
      revision: 0,
      overrides: { selection: { stickinessQuestions: 4 } }
    };
    expect(
      (
        await request(app)
          .put("/api_v2/courses/1/study-configuration")
          .set("authorization", authHeader)
          .send(payload)
      ).status
    ).toBe(200);

    const staleResponse = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send(payload);

    expect(staleResponse.status).toBe(409);
  });

  it("resets overrides while preserving monotonic revision history", async () => {
    const updateResponse = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({
        revision: 0,
        overrides: { selection: { recentQuestionWindow: 10 } }
      });

    const resetResponse = await request(app)
      .delete("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({ revision: updateResponse.body.revision });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.revision).toBe(2);
    expect(resetResponse.body.overrides).toEqual({});
    expect(resetResponse.body.effectiveConfig.selection.recentQuestionWindow).toBe(5);
  });

  it("rejects internal model parameters and out-of-range values", async () => {
    const internalParameterResponse = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({
        revision: 0,
        overrides: { model: { learnRate: 0.5 } }
      });
    expect(internalParameterResponse.status).toBe(400);

    const invalidValueResponse = await request(app)
      .put("/api_v2/courses/1/study-configuration")
      .set("authorization", authHeader)
      .send({
        revision: 0,
        overrides: { selection: { stickinessQuestions: 0 } }
      });
    expect(invalidValueResponse.status).toBe(400);
  });
});
