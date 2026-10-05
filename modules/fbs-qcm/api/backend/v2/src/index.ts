import { createApp } from "./app";
import { connect } from "./mongo/mongo";
import { ensureSessionIndexes } from "./session/session.repository";
import { ensureStudyConfigurationIndexes } from "./studyConfiguration/studyConfiguration.repository";

async function startServer() {
  const db = await connect();
  await ensureSessionIndexes(db);
  await ensureStudyConfigurationIndexes(db);
  const app = createApp(db);

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "127.0.0.1";
  app.listen(port, host, () => console.log(`v2 backend LISTENING on ${host}:${port}`));
}

startServer().catch((err) => {
  console.error("Failed to start v2 backend:", err);
  process.exit(1);
});
