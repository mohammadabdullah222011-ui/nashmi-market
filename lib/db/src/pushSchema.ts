import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

function getDbPath(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl?.startsWith("file:")) {
    return envUrl.slice("file:".length);
  }
  const dbDir = path.resolve(import.meta.dirname, "../../../.local/db");
  fs.mkdirSync(dbDir, { recursive: true });
  return path.join(dbDir, "nashmi-market.db");
}

const SCRIPTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL DEFAULT '',
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'pc',
    badge TEXT,
    rating REAL NOT NULL DEFAULT 5,
    reviews INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    customer_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instagram TEXT NOT NULL DEFAULT '',
    facebook TEXT NOT NULL DEFAULT '',
    store_name TEXT NOT NULL DEFAULT 'نشمي ماركت',
    store_phone TEXT NOT NULL DEFAULT '',
    store_email TEXT NOT NULL DEFAULT '',
    store_address TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

const MIGRATIONS = [
  `ALTER TABLE orders ADD COLUMN phone TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN address TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cash'`,
  `UPDATE orders SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP'`,
];

export function pushSchema() {
  const dbPath = getDbPath();
  const sqlite = new Database(dbPath);
  for (const sql of SCRIPTS) {
    sqlite.exec(sql);
  }
  for (const sql of MIGRATIONS) {
    try { sqlite.exec(sql); } catch { /* column may already exist */ }
  }
  sqlite.close();
  console.log("[pushSchema] ✅ All tables created/verified");
}
