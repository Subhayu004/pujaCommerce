import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'mandirveda.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance & ACID concurrency
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
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

  // Check if legacy admin exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@mandirveda.com');
  if (!existingAdmin) {
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, address_line, city, state, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr_admin_01',
      'admin@mandirveda.com',
      adminPasswordHash,
      'Acharya Shankarananda (Administrator)',
      'admin',
      '+91 98765 43210',
      'Shri Mandir Administrative Block, Temple Road',
      'Varanasi',
      'Uttar Pradesh',
      '221001'
    );

    insertUser.run(
      'usr_customer_01',
      'arjun.sharma@example.com',
      customerPasswordHash,
      'Arjun Sharma (Devotee)',
      'customer',
      '+91 91234 56789',
      'Flat 402, Shanti Vihar, Indiranagar',
      'Bengaluru',
      'Karnataka',
      '560038'
    );
  }

  // Check if pujas exist
  const existingPuja = db.prepare('SELECT count(*) as count FROM pujas').get() as { count: number };
  if (existingPuja.count === 0) {
    const insertPuja = db.prepare(`
      INSERT INTO pujas (id, name, slug, deity, short_description, description, price_paise, duration_mins, image, required_materials, booking_requirements, is_active, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPuja.run(
      'puj_rudra',
      'Vedic Rudrabhishek Puja',
      'vedic-rudrabhishek-puja',
      'Lord Shiva',
      'Sacred chanting of Sri Rudram and continuous Panchamrit abhishek for health, peace, and spiritual upliftment.',
      'Rudrabhishek is one of the most powerful Vedic rituals dedicated to Lord Shiva. Chanted directly from the Krishna Yajurveda (Taittiriya Samhita), the sacred hymns invoke the benevolent and fierce aspects of the Divine to dissolve karmic obstacles, chronic illnesses, and negative planetary influences. The ritual includes Ganapati Puja, Kalash Sthapana, continuous abhishek with milk, honey, ghee, sugarcane juice, and sacred Gangajal, followed by Bilva Patra archana and Maha Mangal Aarti.',
      510000, // ₹5,100
      120,
      'rudra',
      'Panchamrit (Milk, Curd, Ghee, Honey, Sugar), Bilva leaves, White flowers, Dhatura, Bhasma, Gangajal.',
      'Sankalpa details (Name, Gotra, Nakshatra), clean peaceful room with east-facing altar, wooden chowki for Shiva Lingam.',
      1,
      1
    );

    insertPuja.run(
      'puj_griha',
      'Griha Pravesh & Vastu Shanti Havan',
      'griha-pravesh-vastu-shanti-havan',
      'Vastu Purusha & Lord Ganesha',
      'Auspicious housewarming ritual with Navagraha peace and Vastu Purusha invocation to sanctify new homes.',
      'Moving into a new dwelling requires aligning the cosmic directional energies and appeasing the Vastu Purusha. This Vedic ceremony combines Dwara Puja (threshold blessing), Gauri-Ganesh Pujan, Navagraha Havan, and sacred milk boiling ceremony (Doodh Ubalna). It drives away lingering negative energies, purifies every corner with holy mantras, and invites Goddess Lakshmi and positive vibrations into the home.',
      1100000, // ₹11,000
      210,
      'griha',
      'Mango leaves, Copper Kalash, Coconut, Dry Havan samidha, Cow ghee, Navadhanya (9 grains), Navagraha cloth.',
      'Floor space for Havan Kund with proper ventilation, Sankalpa details of homeowner and family members.',
      1,
      1
    );

    insertPuja.run(
      'puj_satyanarayan',
      'Shri Satyanarayan Vrat Katha',
      'shri-satyanarayan-vrat-katha',
      'Lord Vishnu (Satyanarayan)',
      'Traditional narration of the five divine stories from the Skanda Purana with Panchamrit and Sheera prasad.',
      'Performed on Purnima, Sankranti, or auspicious milestone occasions, the Satyanarayan Vrat Katha celebrates truth, righteousness, and divine benevolence. Acharya leads the detailed worship of Lord Vishnu, reads the sacred five chapters depicting stories of faith, followed by distribution of the sacred Sapath / Sheera (panjiri) prasad.',
      350000, // ₹3,500
      90,
      'satyanarayan',
      'Wheat flour, semolina, sugar, ghee, bananas, basil (Tulsi) leaves, betel nuts (supari), yellow flowers.',
      'Altar table, banana stem decorations if available, prepared Sheera prasad ingredients.',
      1,
      1
    );

    insertPuja.run(
      'puj_mahamrityunjaya',
      'Maha Mrityunjaya Jaap & Anushthan',
      'maha-mrityunjaya-jaap-anushthan',
      'Lord Shiva (Mrityunjaya)',
      'Intensive Vedic recitation of the life-restoring mantra for profound healing and overcoming life crises.',
      'The Maha Mrityunjaya Mantra from the Rigveda is revered as the moksha and rejuvenative mantra of Sanatana Dharma. Our senior Vedic scholars perform 11,000 or 21,000 repetitions with samputita chants, concluding with an authentic ahuti havan. Highly recommended for family members facing grave health conditions, untimely obstacles, or severe Saturn/Rahu Sade Sati.',
      1500000, // ₹15,000
      240,
      'mahamrityunjaya',
      'Bel leaves, black sesame seeds, Guggul, Camphor, Mustard seeds, Ghee, Havan Samidha.',
      'Patient or seeker full birth details (Date, Time, Place of birth, Gotra), clean sacred sanctum.',
      1,
      0
    );

    insertPuja.run(
      'puj_lakshmi_kuber',
      'Lakshmi Kuber Dhan Prapti Puja',
      'lakshmi-kuber-dhan-prapti-puja',
      'Maa Mahalakshmi & Lord Kuber',
      'Sacred Sri Suktam chanting and Kanakadhara stotram for financial stability, wealth, and commercial success.',
      'Conducted with authentic Tantrokt and Vedokt rites, this ceremony invokes Maa Mahalakshmi alongside Lord Kuber—the celestial treasurer. Includes Sri Yantra archana, 108 lotus petal offerings, Kanakadhara Stotram recitation, and auspicious Kuber mudra havan for unhindered business prosperity.',
      750000, // ₹7,500
      150,
      'lakshmi',
      'Lotus flowers, Kamalgatta (lotus seeds), Silver coins or Lakshmi idol, Kesar (saffron), Red cloth.',
      'Sankalpa details, business name if for shop/enterprise, clean brass or silver puja utensils.',
      1,
      1
    );

    insertPuja.run(
      'puj_navagraha',
      'Navagraha Shanti & Dosha Nivarana Havan',
      'navagraha-shanti-dosha-nivarana-havan',
      'Nine Planetary Deities (Navagrahas)',
      'Systematic appeasement of the nine celestial planetary forces to eliminate horoscope afflictions.',
      'Planetary transits and natal doshas can introduce friction in career, health, and marriage. This ritual pacifies Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, and Ketu using their dedicated planetary grains, colored cloths, and specific medicinal wood sticks (Samidha).',
      610000, // ₹6,100
      150,
      'navagraha',
      'Navagraha sticks (Arka, Khadira, Apamarga, Ashvattha, Shami, etc.), 9 distinct pulses, 9 colored fabrics.',
      'Horoscope chart or birth data of the primary native; family members can participate in Ahuti.',
      1,
      0
    );
  }

  // Check if pujaris exist
  const existingPujari = db.prepare('SELECT count(*) as count FROM pujaris').get() as { count: number };
  if (existingPujari.count === 0) {
    const insertPujari = db.prepare(`
      INSERT INTO pujaris (id, name, slug, photo, bio, experience_years, specializations, languages, service_areas, phone, email, is_active, rating, review_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPujari.run(
      'pujari_01',
      'Pt. Raghunath Shastri',
      'pt-raghunath-shastri',
      'raghunath',
      'Varanasi-trained Acharya with Rigveda specialization from Sampurnanand Sanskrit Vishwavidyalaya. Renowned for strict adherence to Shastric discipline, melodious Sanskrit uccharan, and lucid explanations of Vedic symbolism to modern devotees.',
      18,
      'Rudrabhishek, Maha Mrityunjaya Anushthan, Griha Pravesh, Vastu Shanti',
      'Hindi, Sanskrit, English',
      'Varanasi, Delhi NCR, Lucknow, Online Pan-India',
      '+91 98112 34567',
      'raghunath.shastri@mandirveda.com',
      1,
      4.95,
      142
    );

    insertPujari.run(
      'pujari_02',
      'Acharya Vidyadhar Joshi',
      'acharya-vidyadhar-joshi',
      'vidyadhar',
      'Hailing from a revered family of Vedic scholars in Pune and Trimbakeshwar, Acharya Vidyadhar specializes in Krishna Yajurveda rituals, Shanti Havans, and Vivah Sanskar ceremonies with warmth and traditional precision.',
      15,
      'Griha Pravesh, Satyanarayan Katha, Vivah Sanskar, Navagraha Shanti',
      'Hindi, Marathi, Sanskrit, English',
      'Mumbai, Pune, Nashik, Bengaluru',
      '+91 98223 45678',
      'vidyadhar.joshi@mandirveda.com',
      1,
      4.92,
      98
    );

    insertPujari.run(
      'pujari_03',
      'Pt. Narayana Namboodiri',
      'pt-narayana-namboodiri',
      'narayana',
      'Steeped in the pristine Tantric and Vedic traditions of Kerala temples, Pt. Narayana brings over two decades of experience in sacred Sudarshana Havan, Ganapati Homam, and Bhagavati Seva rituals.',
      22,
      'Maha Sudarshana Havan, Ganapati Homam, Lakshmi Kuber Puja, Chandi Path',
      'Malayalam, Tamil, Sanskrit, English, Hindi',
      'Bengaluru, Chennai, Kochi, Hyderabad',
      '+91 94471 23456',
      'narayana.namboodiri@mandirveda.com',
      1,
      4.98,
      184
    );

    insertPujari.run(
      'pujari_04',
      'Acharya Someshwar Pathak',
      'acharya-someshwar-pathak',
      'someshwar',
      'Trained at Tirupati Veda Pathashala in Shukla Yajurveda, Acharya Someshwar is loved by tech professionals and young families for his articulate guidance in both English and vernacular languages.',
      12,
      'Satyanarayan Katha, Rudrabhishek, Baby Naming (Namakaran), Office Inauguration',
      'Telugu, Hindi, Sanskrit, English',
      'Hyderabad, Bengaluru, Chennai, Vizag',
      '+91 97011 22334',
      'someshwar.pathak@mandirveda.com',
      1,
      4.89,
      76
    );
  }

  // Check if products exist
  const existingProduct = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
  if (existingProduct.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, slug, description, price_paise, image, category, stock, is_active, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(
      'prod_thali',
      'Handcrafted Brass Meenakari Puja Thali Set (7-Piece)',
      'handcrafted-brass-meenakari-puja-thali-set',
      'Premium heavy brass puja thali with intricate traditional engravings. Includes oil diya, engraved bell, panchamrit spoon, kumkum katori, agarbatti holder, and holy water kalash.',
      249900, // ₹2,499
      'thali',
      'Puja Thalis & Vessels',
      45,
      1,
      1
    );

    insertProduct.run(
      'prod_diya',
      'Royal Akhand Jyot Heavyweight Brass Diya',
      'royal-akhand-jyot-brass-diya',
      'Traditional glass-enclosed brass deepam designed for continuous 24-hour flame during auspicious festivals and daily morning sandhya.',
      119900, // ₹1,199
      'diya',
      'Brass Diyas & Lamps',
      60,
      1,
      1
    );

    insertProduct.run(
      'prod_ghee_wicks',
      'Organic Desi Cow Ghee Diya Wicks (Pack of 108)',
      'organic-cow-ghee-diya-wicks',
      'Handmade pure A2 Desi Gir Cow Ghee battis infused with camphor and sandalwood oil. Clean burning with zero soot and lasting fragrant aroma.',
      44900, // ₹449
      'ghee_wicks',
      'Diyas & Camphor',
      120,
      1,
      1
    );

    insertProduct.run(
      'prod_gangajal',
      'Certified Gangajal from Haridwar Brahmakund (500ml)',
      'certified-gangajal-haridwar-500ml',
      'Pure, untouched holy water collected directly from the Brahmakund at Har ki Pauri, Haridwar, sealed in airtight copper-tinted sacred container.',
      29900, // ₹299
      'gangajal',
      'Holy Water & Panchamrit',
      200,
      1,
      1
    );

    insertProduct.run(
      'prod_dhoop',
      'Temple Grade Kasturi & Chandan Dhoop Cones (200g)',
      'temple-grade-kasturi-chandan-dhoop-cones',
      'Charcoal-free natural temple dhoop made from pure Mysore sandalwood powder, desi cow dung base, and therapeutic Himalayan aromatic herbs.',
      39900, // ₹399
      'dhoop',
      'Incense & Dhoop',
      85,
      1,
      1
    );

    insertProduct.run(
      'prod_tika',
      'Pure Roli Kumkum & Ashta Gandha Chandan Kit',
      'pure-roli-kumkum-ashta-gandha-chandan-kit',
      'Authentic organic turmeric-based vermilion (Roli) paired with natural eight-herb saffron sandalwood paste for sacred forehead tilak.',
      34900, // ₹349
      'tika',
      'Kumkum & Sandalwood',
      150,
      1,
      1
    );

    insertProduct.run(
      'prod_dhoti',
      'Handloom Pure Silk Vedic Puja Dhoti & Angavastram',
      'handloom-pure-silk-puja-dhoti-angavastram',
      'Traditional unstitched pure silk pitambari dhoti (4.2 meters) with zari border and matching angavastram shawl for sacred ceremonies.',
      289900, // ₹2,899
      'dhoti',
      'Sacred Attire & Vastra',
      30,
      1,
      1
    );

    insertProduct.run(
      'prod_havan_kit',
      'Complete Navagraha & Havan Samagri Box (32 Sacred Herbs)',
      'complete-navagraha-havan-samagri-box',
      'A comprehensive 1.5kg collection of authentic havan ingredients including dry coconut (Gola), Guggal, Jatamansi, Bhojpatra, and sacred samidha.',
      89900, // ₹899
      'havan_kit',
      'Havan & Samagri Kits',
      70,
      1,
      1
    );
  }

  // Seed sample initial completed / pending orders for realistic metrics & testing
  const existingOrder = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
  if (existingOrder.count === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, customer_phone, address_line, city, state, pincode, country, customer_notes, subtotal_paise, tax_paise, delivery_paise, discount_paise, total_paise, payment_status, booking_status, payment_id, razorpay_order_id, razorpay_signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 days'))
    `);

    insertOrder.run(
      'ord_seed_101',
      'MV-2026-10189',
      'usr_customer_01',
      'Arjun Sharma',
      'arjun.sharma@example.com',
      '+91 91234 56789',
      'Flat 402, Shanti Vihar, Indiranagar',
      'Bengaluru',
      'Karnataka',
      '560038',
      'India',
      'Please arrive by 8:30 AM for the sankalpa preparation.',
      554900, // 5100 + 449
      27745,  // 5% tax
      0,      // Free delivery
      0,
      582645,
      'paid',
      'confirmed',
      'pay_RzSeed_98127394',
      'order_RzSeed_98127394',
      'sig_mock_signature_verified',
    );

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (id, order_id, item_type, puja_id, product_id, item_name, price_paise, quantity, scheduled_date, scheduled_time, pujari_id, pujari_name, preferred_language, service_location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrderItem.run(
      'oit_seed_01',
      'ord_seed_101',
      'puja',
      'puj_rudra',
      null,
      'Vedic Rudrabhishek Puja',
      510000,
      1,
      '2026-10-20',
      '09:00 AM - 11:00 AM',
      'pujari_01',
      'Pt. Raghunath Shastri',
      'Hindi, Sanskrit',
      'Home Visit (Indiranagar, Bengaluru)',
      'For family health and prosperity'
    );

    insertOrderItem.run(
      'oit_seed_02',
      'ord_seed_101',
      'product',
      null,
      'prod_ghee_wicks',
      'Organic Desi Cow Ghee Diya Wicks (Pack of 108)',
      44900,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, admin_id, admin_email, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'aud_init_01',
      'usr_admin_01',
      'admin@mandirveda.com',
      'CONFIRM_BOOKING',
      'order',
      'ord_seed_101',
      'System confirmed booking for Vedic Rudrabhishek Puja and assigned Pt. Raghunath Shastri'
    );
  }
}
