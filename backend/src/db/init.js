// Crea las tablas ejecutando schema.sql (borra y recrea todo)
const fs = require('fs');
const path = require('path');
const db = require('./connection');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);
console.log('Base de datos creada correctamente.');
