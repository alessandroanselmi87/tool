
import { MongoClient } from 'mongodb';

export default class Database {

    private host: any;
    private db: any;
    private port: any;
    private client: any;

    constructor(host: any, port: any, db: any) {
        this.host = host;
        this.port = port;
        this.db = db;
        this.connect();
    }

    connect() {
        try {
            this.client = new MongoClient(`mongodb://${this.host}:${this.port}`);
        } catch (error: any) {
            console.error(error.message);
            process.exit(1);
        }
    }

    async isConnected() {
        try {
            await this.client.connect();
            await this.client.db(this.db).command({ ping: 1 });

            console.log("----------------------------------");
            console.log("✅ Connessione a MongoDB riuscita!");
            console.log("Il server MongoDB è raggiungibile.");
            console.log("----------------------------------");
            return true;
        } catch (errore: any) {
            
            console.error("---------------------------------");
            console.error("❌ Connessione a MongoDB fallita!");
            console.error(errore.message);
            console.error("---------------------------------");
            await this.client.close();
            return false;
        }
    }

    async create(data: any) {
        try {
            if (await this.isConnected()) {
                const database = this.client.db(this.db);
                for (const item of data) {
                    console.log(`Creo la collezione di ${item.collection}`);
                    const collection = await database.createCollection(item.collection);
                    console.log(`Creo il documento per la collezione ${item.collection}`);
                    await collection.insertOne(item.document);
                    console.log("*********************************");
                }
                process.exit(0);
            }
        } catch (error: any) {
            console.error(error.message);
            process.exit(1);
        }
    }
}