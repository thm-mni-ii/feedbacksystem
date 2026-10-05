import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";
import { assertEmptySeedDatabase } from "./seedSafety";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

describe("demo seed safety", () => {
  let server: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    client = await MongoClient.connect(server.getUri());
    db = client.db("seed-safety-test");
  });
  afterAll(async () => {
    await client?.close();
    await server?.stop();
  });
  beforeEach(async () => {
    await db.dropDatabase();
  });
  it("allows a new empty database", async () => {
    await expect(assertEmptySeedDatabase(db)).resolves.toBeUndefined();
  });
  it("allows collections with no documents", async () => {
    await db.createCollection("question");
    await expect(assertEmptySeedDatabase(db)).resolves.toBeUndefined();
  });
  it.each(["question", "competency", "studySession", "questionAttempt", "otherData"])(
    "refuses nonempty %s collections without changing them",
    async (name) => {
      await db.collection(name).insertOne({ marker: "must-remain" });
      await expect(assertEmptySeedDatabase(db)).rejects.toThrow("Seed refused");
      expect(await db.collection(name).countDocuments()).toBe(1);
      expect(await db.collection(name).findOne({ marker: "must-remain" })).not.toBeNull();
    }
  );
  it("imports the actual demo dataset into an isolated database and refuses a second seed", async () => {
    const runSeed = () => spawnSync(process.execPath, [
      require.resolve("tsx/cli"), "--tsconfig", "tsconfig.seed.json", "src/seed/seed.ts"
    ], {
      cwd: join(__dirname, "../.."),
      env: { ...process.env, MONGODB_URL: server.getUri(), MONGODB_DB_NAME: db.databaseName },
      encoding: "utf8",
      timeout: 30_000
    });
    const first = runSeed();
    if (first.error) throw first.error;
    if (first.status !== 0) throw new Error(`Demo seed failed: ${first.stderr}`);
    const competencyCount = await db.collection("competency").countDocuments();
    const questionCount = await db.collection("question").countDocuments();
    expect(competencyCount).toBeGreaterThan(0);
    expect(questionCount).toBeGreaterThan(0);
    const second = runSeed();
    if (second.error) throw second.error;
    expect(second.status).not.toBe(0);
    expect(second.stderr).toContain("Seed refused");
    expect(await db.collection("competency").countDocuments()).toBe(competencyCount);
    expect(await db.collection("question").countDocuments()).toBe(questionCount);
  }, 60_000);
});
