'use strict';
const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;
if (apiUrl) {
  const target = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
  const content =
    `export const environment = {\n` +
    `  production: true,\n` +
    `  API_URL: ${JSON.stringify(apiUrl)},\n` +
    `};\n`;
  fs.writeFileSync(target, content);
}
