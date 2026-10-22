import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isVercel = Boolean(process.env.VERCEL);
let dbPath = path.resolve(process.cwd(), 'mandirveda.db');

if (isVercel) {
  const tmpDbPath = path.join('/tmp', 'mandirveda.db');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpDbPath);
    } catch (e) {
      console.error('Failed to copy database to /tmp on Vercel:', e);
    }
  }
  dbPath = tmpDbPath;
}

export const db = new DatabaseSync(dbPath);

// Direct atomic commits and concurrency timeout for rock-solid persistence
db.exec(`
  PRAGMA journal_mode = DELETE;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  PRAGMA synchronous = NORMAL;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      address_line TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pujas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      deity TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      price_paise INTEGER NOT NULL,
      duration_mins INTEGER NOT NULL,
      image TEXT,
      required_materials TEXT,
      booking_requirements TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pujaris (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      photo TEXT,
      bio TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      specializations TEXT NOT NULL,
      languages TEXT NOT NULL,
      service_areas TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      rating REAL DEFAULT 4.9,
      review_count INTEGER DEFAULT 36,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price_paise INTEGER NOT NULL,
      image TEXT,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 50,
      is_active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      item_type TEXT NOT NULL, -- 'puja' | 'product'
      puja_id TEXT,
      product_id TEXT,
      scheduled_date TEXT,
      scheduled_time TEXT,
      pujari_id TEXT,
      preferred_language TEXT,
      service_location TEXT,
      additional_notes TEXT,
      price_paise INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (puja_id) REFERENCES pujas(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (pujari_id) REFERENCES pujaris(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      customer_notes TEXT,
      subtotal_paise INTEGER NOT NULL,
      tax_paise INTEGER NOT NULL,
      delivery_paise INTEGER NOT NULL,
      discount_paise INTEGER NOT NULL DEFAULT 0,
      total_paise INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
      booking_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
      payment_id TEXT,
      razorpay_order_id TEXT,
      razorpay_signature TEXT,
      refund_id TEXT,
      refund_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      puja_id TEXT,
      product_id TEXT,
      item_name TEXT NOT NULL,
      price_paise INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      scheduled_date TEXT,
      scheduled_time TEXT,
      pujari_id TEXT,
      pujari_name TEXT,
      preferred_language TEXT,
      service_location TEXT,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      admin_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for high-speed queries and double-booking conflict checks
    CREATE INDEX IF NOT EXISTS idx_order_items_slot ON order_items(scheduled_date, scheduled_time, pujari_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_pujas_slug ON pujas(slug);
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if official admin exists
  const officialAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('pujasathisupport@gmail.com');
  const adminPasswordHash = bcrypt.hashSync('PujaSathiAdmin@2025', 10);
  if (!officialAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, address_line, city, state, pincode)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?, ?)
    `).run(
      'usr_pujasathi_admin',
      'pujasathisupport@gmail.com',
      adminPasswordHash,
      'PujaSathi Administrator',
      '+91 84500 02545',
      'PujaSathi Administrative Block, Temple Road',
      'Varanasi',
      'Uttar Pradesh',
      '221001'
    );
  } else {
    db.prepare('UPDATE users SET password_hash = ?, role = ? WHERE email = ?').run(
      adminPasswordHash,
      'admin',
      'pujasathisupport@gmail.com'
    );
  }

  // Ensure owner Subhayu Roy has permanent Administrator role
  const subhayuAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('subhayuroy666@gmail.com');
  const subhayuPasswordHash = bcrypt.hashSync('Password@123', 10);
  if (!subhayuAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, address_line, city, state, pincode)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?, ?)
    `).run(
      'usr_subhayu_admin',
      'subhayuroy666@gmail.com',
      subhayuPasswordHash,
      'Subhayu Roy (Admin)',
      '+91 98765 43210',
      'Temple Road',
      'Varanasi',
      'Uttar Pradesh',
      '221001'
    );
  } else {
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run('subhayuroy666@gmail.com');
  }

}

