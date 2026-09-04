import { createApp } from "./app";
import { connect } from "./mongo/mongo";

async function startServer() {
  const db = await connect();
  const app = createApp(db);

  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => console.log(`v2 backend LISTENING on port ${port}`));
}

startServer().catch((err) => {
  console.error("Failed to start v2 backend:", err);
  process.exit(1);
});
