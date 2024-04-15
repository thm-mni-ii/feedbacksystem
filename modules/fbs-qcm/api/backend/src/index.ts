import express from "express";
import { MongoClient } from 'mongodb';

const app = express();

app.get("/", (req, res) => {
    return res.send("Wassassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssfafafafhsfrshshsssssssssss-------------------sadsdagasWWW");
});
app.get("/test", (req, res) => {
       return connect()

});

async function connect() {
    const uri = 'mongodb://mongodb:27017';
    const client = new MongoClient(uri)
     try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Perform operations
        // Example: List all databases
        const databasesList = await client.db().admin().listDatabases();
        console.log('Databases:');
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        // Close the connection
        await client.close();
        return "AAA";
    }
}

app.listen(3000, () => console.log("LISTENING on port 3000"));
