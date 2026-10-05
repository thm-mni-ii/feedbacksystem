import type { Db } from "mongodb";

export async function assertEmptySeedDatabase(db: Db): Promise<void> {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  for (const collection of collections) {
    if (await db.collection(collection.name).countDocuments({}, { limit: 1 }) > 0) {
      throw new Error(
        `Seed refused: database "${db.databaseName}" contains data in "${collection.name}". ` +
        "Choose a new, empty demo database via MONGODB_DB_NAME. No data was deleted."
      );
    }
  }
}
