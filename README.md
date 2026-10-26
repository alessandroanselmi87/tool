# tool

## Presentation
Il progetto è stato sviluppato in NodeJS usando Typescript.
- La cartella input già presente include i file json della configurazione dello schema delle entità ER etichettate.
- La cartella output viene generata e include i file json per le collezioni di documenti valorizzando i campi tramite AI.
- La cartella html viene generata e include i file html per visualizzare la struttura ad albero dei json dei file nella cartella output.

## Configuration
- Manca il file .env da creare in locale con le seguenti configurazioni:

```
NODE_ENV=development
PORT=27017
HOST=127.0.0.1
DATABASE=testdb
OPENAI_KEY_API=<yourOpenAiKeyApi>
FILE_NAME=labeled_schema2
```

## Install
```
npm install
```
Installa tutti i pacchetti

## Compilation
```
npm start
```
Compila i file js per generare una struttura di collezioni di documenti per MongoDb nella cartella output con il file json risultante.

## Generazione su MongoDb
```
npm run generate
```
Genera su database MongoDb con le configurazioni presenti nel file .env le collezioni di documenti.

## Viewer
```
npm run viewer
```
Genera un file html nella cartella html della struttura ad albero del file json risultante nella cartella output con Json Viewer.