import fs from 'fs';
import Collection from './collection.js';
import { validateERSchema } from './validator.js';
import { parseJson, readFile } from './utils.js';
import * as dotenv from 'dotenv';
import { LabeledSchema } from './interfaces.js';

dotenv.config();

function validate(data: LabeledSchema) {
    const errors = validateERSchema(data);
    if (errors.length) {
        console.error(`Schema ER non valido:\n- ${errors.join("\n- ")}`);
        process.exit(1);
    }
}

function writeFile(data: any) {
    const dir = 'output';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(`${dir}/results_${process.env.FILE_NAME}.json`, JSON.stringify(data, null, 4));
}

async function main() {
    
    const contenuto = readFile(`input/${process.env.FILE_NAME}.json`);
    let dati: LabeledSchema = parseJson(contenuto);

    validate(dati);
    
    const collection = new Collection();
    const collectionData = collection.create(dati);
    const data = await collection.generateData(collectionData, process.env.OPENAI_KEY_API);

    writeFile(data);
}

await main();
