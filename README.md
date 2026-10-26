# tool

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
Genera su database MongoDb con le configurazioni presente nel file .env le collezioni di documenti.

## Viewer
```
npm run viewer
```
Genera un file html nella cartella html della struttura ad albero del file json risultante nella cartella output con Json Viewer.