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

function sha256Utf8(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

function writeOut(name, content) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const p = path.join(outDir, name);
  fs.writeFileSync(p, content, { encoding: 'utf8' });
  return p;
}

// --- PDF 1: SIG-FROTA — apenas código-fonte concatenado (UTF-8, sem BOM) ---
const pdf1Parts = [
  read('src/app/model/fuel.ts'),
  read('src/app/component/fuel-list/fuel-list.component.ts'),
  read('src/app/component/fuel-list/fuel-list.component.html'),
  read('src/app/component/fuel-list/fuel-list.component.css'),
  read('src/app/component/forms/fuel-form/fuel-form.component.ts'),
  read('src/app/component/forms/fuel-form/fuel-form.component.html'),
  extractGettersFuelOnly(read('src/app/service/getters.service.ts')),
  extractAppRoutingFuelOnly(read('src/app/app-routing.module.ts')),
  extractAppModuleFuelOnly(read('src/app/app.module.ts')),
  extractLines(read('src/app/app.component.ts'), 47, 50) +
    '\n' +
    extractLines(read('src/app/app.component.ts'), 80, 85) +
    '\n' +
    extractLines(read('src/app/app.component.ts'), 118, 122),
  extractLines(read('src/app/app.component.html'), 56, 61),
];

function extractLines(text, start, end) {
  const lines = text.split(/\r?\n/);
  return lines.slice(start - 1, end).join('\n');
}

/** Trechos de app.module.ts usados só pelo SIG-FROTA (imports + declarations Fuel). */
function extractAppModuleFuelOnly(text) {
  const lines = text.split(/\r?\n/);
  const imports = lines.filter(
    (l) =>
      l.includes("from './component/forms/fuel-form/fuel-form.component'") ||
      l.includes("from './component/fuel-list/fuel-list.component'")
  );
  const decl = lines.filter((l) => /^\s*Fuel(Form|List)Component,\s*$/.test(l));
  return imports.join('\n') + '\n\n' + decl.join('\n');
}

/** Imports necessários + bloco de rotas admin/fuel (sem outras rotas admin). */
function extractAppRoutingFuelOnly(text) {
  const lines = text.split(/\r?\n/);
  const head = [lines[0], lines[1]];
  const fuelImports = lines.filter(
    (l) =>
      l.includes('fuel-form/fuel-form') || l.includes('fuel-list/fuel-list')
  );
  const guard = lines.find((l) => l.includes('auth.guard'));
  const adminIdx = lines.findIndex(
    (l) => l.includes("path: 'admin'") && l.includes('GROUP_READ')
  );
  if (adminIdx === -1) {
    throw new Error('Rota admin não encontrada em app-routing.module.ts');
  }
  /* 7 linhas: { admin → … fuel … → }, — sem o ramo permissions */
  const adminFuelBlock = lines.slice(adminIdx, adminIdx + 7).join('\n');
  return (
    head.join('\n') +
    '\n' +
    fuelImports.join('\n') +
    '\n' +
    guard +
    '\n\n' +
    adminFuelBlock
  );
}

/** Imports + getFuels + getFuelSearch (o ficheiro real inclui outros métodos). */
function extractGettersFuelOnly(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  out.push(lines[0], lines[1], lines[2], lines[3], lines[4]);
  out.push('');
  for (let i = 9; i <= 16; i++) out.push(lines[i]);
  out.push('');
  for (let i = 18; i <= 24; i++) out.push(lines[i]);
  out.push('');
  for (let i = 57; i <= 64; i++) out.push(lines[i]);
  return out.join('\n');
}

// --- PDF 2: SIG-PATRIMÔNIO — apenas código-fonte concatenado ---
const pdf2Parts = [
  read('src/app/component/milestone1-demo/milestone1-demo.component.ts'),
  read('src/app/component/milestone1-demo/milestone1-demo.component.html'),
  read('src/app/component/milestone1-demo/milestone1-demo.component.scss'),
  read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.ts'),
  read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.html'),
  read('src/app/component/milestone1-demo/m1-odometer/m1-odometer.component.scss'),
  read('src/assets/mock/auditoria_motor_exemplo.json'),
  read('src/app/model/vehicle.ts'),
  read('src/app/component/forms/vehicle-form/vehicle-form.component.ts'),
  read('src/app/component/forms/vehicle-form/vehicle-form.component.html'),
  read('src/app/component/vehicle-info/vehicle-info.component.ts'),
  read('src/app/component/vehicle-info/vehicle-info.component.html'),
  read('src/app/component/vehicle-info/vehicle-info.component.css'),
  extractLines(read('src/app/app-routing.module.ts'), 39, 44),
  extractLines(read('src/app/app.module.ts'), 97, 98) +
    '\n' +
    extractLines(read('src/app/app.module.ts'), 146, 148),
];

const text1 = pdf1Parts.join('\n\n');
const text2 = pdf2Parts.join('\n\n');

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
