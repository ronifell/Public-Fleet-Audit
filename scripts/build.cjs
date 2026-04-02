'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

require(path.join(__dirname, 'inject-api-url.cjs'));

const ngCli = path.join(__dirname, '..', 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const r = spawnSync(process.execPath, [ngCli, 'build'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});
if (r.error) {
  console.error(r.error);
  process.exit(1);
}
process.exit(typeof r.status === 'number' ? r.status : 1);
