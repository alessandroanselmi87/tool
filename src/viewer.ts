
import fs from "node:fs";
import path from "node:path";
import * as dotenv from 'dotenv';
import { fileURLToPath } from "node:url";

dotenv.config();

const inputPath = `output/results_${process.env.FILE_NAME}.json`;
if (!fs.existsSync(inputPath)) {
    console.log(`Non esiste questo file della cartella output: ${inputPath}`);
    process.exit(1);
}
if (!fs.existsSync('html')) {
    fs.mkdirSync('html');
}
const outputPath = `html/viewer_${process.env.FILE_NAME}.html`;

// Legge e valida il JSON
const json = JSON.parse(
  fs.readFileSync(inputPath, "utf8")
);

// Recupera il bundle browser distribuito dal pacchetto npm
const entryUrl = import.meta.resolve("@andypf/json-viewer");
const entryPath = fileURLToPath(entryUrl);
const packageDir = path.resolve(path.dirname(entryPath), "..", "..");

const jsPath = path.join(
  packageDir,
  "dist",
  "iife",
  "index.js"
);

const js = fs.readFileSync(jsPath, "utf8");

// Serializzazione sicura per inserirlo in un tag script
const safeJson = JSON.stringify(json)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026")
  .replace(/\u2028/g, "\\u2028")
  .replace(/\u2029/g, "\\u2029");

const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JSON Viewer</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, sans-serif;
      background: #f5f7fa;
    }

    h1 { font-size: 24px; }

    andypf-json-viewer {
      display: block;
      background: white;
      padding: 16px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>JSON Viewer</h1>

  <andypf-json-viewer
    id="viewer"
    theme="monokai"
    indent="2"
    expanded="2"
    show-data-types="false"
    show-toolbar="true"
    show-copy="true"
    show-size="true"
    expand-icon-type="arrow"
  ></andypf-json-viewer>

  <script>
    ${js}
  </script>

  <script>
    document.getElementById("viewer").data = ${safeJson};
  </script>
</body>
</html>`;

fs.writeFileSync(outputPath, html, "utf8");

console.log(`HTML generato: ${outputPath}`);
