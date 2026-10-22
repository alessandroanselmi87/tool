
import Database from './database.js';
import { parseJson, readFile } from './utils.js';
import * as dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV === "development") {
    const data = parseJson(readFile(`output/results_${process.env.FILE_NAME}.json`));
    const db = new Database(process.env.HOST, process.env.PORT, `${process.env.DATABASE}_${process.env.FILE_NAME}`);
    db.create(data);
}
