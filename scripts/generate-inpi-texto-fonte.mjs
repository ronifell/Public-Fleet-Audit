/**
 * Monta os arquivos de texto-fonte para INPI (PDF1 = SIG-FROTA, PDF2 = SIG-PATRIMÔNIO)
 * e imprime SHA-256 (UTF-8, sem BOM) de cada arquivo gerado.
 *
 * Uso: node scripts/generate-inpi-texto-fonte.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'inpi-texto-fonte');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function cat(parts) {
  const sep = '\n\n' + '='.repeat(72) + '\n\n';
  return parts.join(sep);
}

function sha256Utf8(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

function writeOut(name, content) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const p = path.join(outDir, name);
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  return p;
}

// --- PDF 1: módulo combustível (admin/fuel) + integração mínima (apenas código do autor deste repositório) ---
const pdf1Parts = [
  `TEXT-FONTE PDF1 — SIG-FROTA (Combustível) — apenas código-fonte do autor (frontend, repositório atual).`,
  '--- FILE: src/app/model/fuel.ts ---\n' + read('src/app/model/fuel.ts'),
  '--- FILE: src/app/component/fuel-list/fuel-list.component.ts ---\n' +
    read('src/app/component/fuel-list/fuel-list.component.ts'),
  '--- FILE: src/app/component/fuel-list/fuel-list.component.html ---\n' +
    read('src/app/component/fuel-list/fuel-list.component.html'),
  '--- FILE: src/app/component/fuel-list/fuel-list.component.css ---\n' +
    read('src/app/component/fuel-list/fuel-list.component.css'),
  '--- FILE: src/app/component/forms/fuel-form/fuel-form.component.ts ---\n' +
    read('src/app/component/forms/fuel-form/fuel-form.component.ts'),
  '--- FILE: src/app/component/forms/fuel-form/fuel-form.component.html ---\n' +
    read('src/app/component/forms/fuel-form/fuel-form.component.html'),
  '--- FILE: src/app/service/getters.service.ts (métodos de API incl. fuel) ---\n' +
    read('src/app/service/getters.service.ts'),
  '--- FILE: src/app/app-routing.module.ts (trecho rotas admin/fuel) ---\n' +
    extractLines(read('src/app/app-routing.module.ts'), 1, 40) +
    '\n// ...\n' +
    extractLines(read('src/app/app-routing.module.ts'), 115, 138),
  '--- FILE: src/app/app.module.ts (imports e declarations Fuel) ---\n' +
    extractLines(read('src/app/app.module.ts'), 44, 45) +
    '\n' +
    extractLines(read('src/app/app.module.ts'), 66, 67) +
    '\n' +
    extractLines(read('src/app/app.module.ts'), 97, 98) +
    '\n' +
    extractLines(read('src/app/app.module.ts'), 114, 128),
  '--- FILE: src/app/app.component.ts (permissão e menu Combustível) ---\n' +
    extractLines(read('src/app/app.component.ts'), 47, 50) +
    '\n' +
    extractLines(read('src/app/app.component.ts'), 80, 85) +
    '\n' +
    extractLines(read('src/app/app.component.ts'), 118, 122),
  '--- FILE: src/app/app.component.html (item de menu Combustível) ---\n' +
    extractLines(read('src/app/app.component.html'), 56, 61),
];

function extractLines(text, start, end) {
  const lines = text.split(/\r?\n/);
  return lines.slice(start - 1, end).join('\n');
}

// --- PDF 2: SIG-PATRIMÔNIO (demo milestone1 + veículo/patrimônio) ---
const pdf2Parts = [
  `TEXT-FONTE PDF2 — SIG-PATRIMÔNIO — frontend deste repositório
Incluir acima ou abaixo o código-fonte do Bruno conforme combinado com o cliente.
`,
  '--- FILE: src/app/component/milestone1-demo/milestone1-demo.component.ts ---\n' +
    read('src/app/component/milestone1-demo/milestone1-demo.component.ts'),
  '--- FILE: src/app/component/milestone1-demo/milestone1-demo.component.html ---\n' +
    read('src/app/component/milestone1-demo/milestone1-demo.component.html'),
  '--- FILE: src/app/component/milestone1-demo/milestone1-demo.component.scss ---\n' +
    read('src/app/component/milestone1-demo/milestone1-demo.component.scss'),
  '--- FILE: src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.ts ---\n' +
    read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.ts'),
  '--- FILE: src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.html ---\n' +
    read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.html'),
  '--- FILE: src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.scss ---\n' +
    read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.scss'),
  '--- FILE: src/assets/mock/auditoria_motor_exemplo.json ---\n' +
    read('src/assets/mock/auditoria_motor_exemplo.json'),
  '--- FILE: src/app/model/vehicle.ts ---\n' + read('src/app/model/vehicle.ts'),
  '--- FILE: src/app/component/forms/vehicle-form/vehicle-form.component.ts ---\n' +
    read('src/app/component/forms/vehicle-form/vehicle-form.component.ts'),
  '--- FILE: src/app/component/forms/vehicle-form/vehicle-form.component.html ---\n' +
    read('src/app/component/forms/vehicle-form/vehicle-form.component.html'),
  '--- FILE: src/app/component/vehicle-info/vehicle-info.component.ts ---\n' +
    read('src/app/component/vehicle-info/vehicle-info.component.ts'),
  '--- FILE: src/app/component/vehicle-info/vehicle-info.component.html ---\n' +
    read('src/app/component/vehicle-info/vehicle-info.component.html'),
  '--- FILE: src/app/component/vehicle-info/vehicle-info.component.css ---\n' +
    read('src/app/component/vehicle-info/vehicle-info.component.css'),
  '--- FILE: src/app/app-routing.module.ts (rota milestone1-demo) ---\n' +
    extractLines(read('src/app/app-routing.module.ts'), 39, 44),
  '--- FILE: src/app/app.module.ts (imports e declarations Milestone1 / M1Odometer) ---\n' +
    extractLines(read('src/app/app.module.ts'), 97, 98) +
    '\n' +
    extractLines(read('src/app/app.module.ts'), 146, 148),
];

const text1 = cat(pdf1Parts);
const text2 = cat(pdf2Parts);

const f1 = writeOut('PDF1-SIG-FROTA-textofonte.txt', text1);
const f2 = writeOut('PDF2-SIG-PATRIMONIO-textofonte.txt', text2);

const h1 = sha256Utf8(text1);
const h2 = sha256Utf8(text2);

console.log('Arquivos gerados:');
console.log(' ', f1);
console.log(' ', f2);
console.log('');
console.log('SHA-256 (UTF-8, mesmo conteúdo que vai para o PDF em texto puro):');
console.log(' PDF1 SIG-FROTA:     ', h1);
console.log(' PDF2 SIG-PATRIMÔNIO:', h2);
