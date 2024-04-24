import * as mongoDB from "mongodb";


export async function connect() {
    const uri = process.env.MONGODB_URL; 
    if(uri == undefined) {
       console.error("Could not get MongoDB address"); 
       process.exit(1);
    }
    const client = new mongoDB.MongoClient(uri)
    try {
        console.log("Connecting");
        await client.connect();
        const databasesList = await client.db().admin().listDatabases();
        console.log(databasesList);
        const database: mongoDB.Db = client.db("QCM");
        console.log("Connected to Database");
        return database;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

