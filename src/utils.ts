import fs from 'fs';

export function parseJson(contenuto: any) {
    let dati: any = {};
    try {
        dati = JSON.parse(contenuto);
    } catch(error: any) {
        console.error(`Impossibile fare il parse del file json: ${error.message}`);
        process.exit(1);
    }
    return dati;
}

export function readFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
        console.error(`Manca il file: ${filepath}`);
        process.exit(1);
    }
    return fs.readFileSync(filepath, 'utf8');
}