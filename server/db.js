import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { DATABASE_PATH } from './config.js';

const db = new Database(DATABASE_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    website_name TEXT DEFAULT 'My Shop',
    shopkeeper_name TEXT DEFAULT '',
    mobile TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    primary_color TEXT DEFAULT '#2563eb',
    accent_color TEXT DEFAULT '#1e40af'
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    icon TEXT DEFAULT '📦'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    size TEXT DEFAULT '',
    price TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tile_bg_color TEXT DEFAULT '#ffffff',
    tile_text_color TEXT DEFAULT '#1f2937',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
  );
`);

const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get();
if (settingsCount.c === 0) {
  db.prepare('INSERT INTO settings (id) VALUES (1)').run();
}

const adminCount = db.prepare('SELECT COUNT(*) as c FROM admin').get();
if (adminCount.c === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)').run('admin', hash);
}

export default db;
