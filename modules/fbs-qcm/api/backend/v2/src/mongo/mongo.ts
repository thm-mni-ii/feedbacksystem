import * as mongoDB from "mongodb";

let client: mongoDB.MongoClient | null = null;
let database: mongoDB.Db | null = null;

/**
 * Verbindet mit MongoDB und cached die Datenbankinstanz für den Prozess.
 * Eigene, von v1 unabhängige Datenbank (siehe MONGODB_DB_NAME), damit v2
 * parallel zum bestehenden Backend entwickelt werden kann, ohne Daten zu
 * teilen oder zu beschädigen.
 */
export async function connect(): Promise<mongoDB.Db> {
  if (database) {
    return database;
  }

  const uri = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME ?? "QCM_v2";

  if (!uri) {
    throw new Error("Could not get MongoDB address (MONGODB_URL is not set)");
  }

  client = new mongoDB.MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
  console.log(`connected to MongoDB (${dbName})`);
  return database;
}

/** Schließt die Verbindung. Wird primär in Tests zum sauberen Teardown genutzt. */
export async function disconnect(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}
