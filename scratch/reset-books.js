const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'bookbridge.db');
const db = new Database(dbPath);

console.log('Resetting all books in SQLite database to AVAILABLE status...');
const info = db.prepare("UPDATE books SET status = 'AVAILABLE'").run();
console.log(`Updated ${info.changes} books to AVAILABLE status.`);

db.prepare("UPDATE users SET email = 'dajitha12@gmail.com' WHERE id = 'usr-user1'").run();
console.log('Updated user usr-user1 email to dajitha12@gmail.com.');

console.log('Database reset complete!');
