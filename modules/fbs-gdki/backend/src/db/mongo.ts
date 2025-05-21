import * as mongoDB from "mongodb";
let client: mongoDB.MongoClient | null = null;
let database: mongoDB.Db | null = null;

export async function connect() {
  const uri = process.env.MONGODB_URL;
  if(database) {
      return database;
  }
  if (uri == undefined) {
    console.error("Could not get MongoDB address");
    process.exit(1);
  }
  client = new mongoDB.MongoClient(uri);
  try {
    await client.connect();
    database = client.db("GDKI");
    console.log("connected to MongoDB");
    return database;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}