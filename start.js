// Arranque sin Prisma: la base vive en db.json (no hace falta generar el cliente).
const path = require('path'), fs = require('fs');
const st = {};
const old = path.join(__dirname, 'db.json');
if (fs.existsSync(old)) { try { Object.assign(st, JSON.parse(fs.readFileSync(old, 'utf8'))); } catch (_) {} }
global.__IPHUB_STATE = st;
require('./server');
