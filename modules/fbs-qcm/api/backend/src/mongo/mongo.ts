import { MongoClient } from 'mongodb';


async function connect() {
    const uri = 'mongodb://mongodb:27018';
    const client = new MongoClient(uri)
    let databasesList = "";
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
    }
    console.log("ENDE")
    return databasesList; 
}

