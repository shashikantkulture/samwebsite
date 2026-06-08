import mysql from "mysql2/promise";
import { Product, Review, Booking } from "../types";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "../data/mockDb";

const connectionUri = process.env.DATABASE_URL;

let pool: mysql.Pool = null as any;

try {
  if (connectionUri) {
    pool = mysql.createPool(connectionUri);
  } else {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sam_website",
      port: Number(process.env.DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
} catch (error) {
  console.error("Error creating MySQL connection pool:", error);
}

// Query helper
export async function query(sql: string, params?: any[]): Promise<any> {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Convert JSON text fields to objects when reading product from MySQL
export function deserializeProduct(p: any): Product {
  return {
    ...p,
    id: String(p.id),
    price: Number(p.price),
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    rating: Number(p.rating),
    reviewCount: Number(p.review_count),
    featured: Boolean(p.featured),
    isBestseller: Boolean(p.is_bestseller),
    isNew: Boolean(p.is_new),
    isPromo: Boolean(p.is_promo),
    images: typeof p.images === "string" ? JSON.parse(p.images) : p.images || [],
    solutions: typeof p.solutions === "string" ? JSON.parse(p.solutions) : p.solutions || [],
    detailsList: typeof p.details_list === "string" ? JSON.parse(p.details_list) : p.details_list || [],
    careInstructions: typeof p.care_instructions === "string" ? JSON.parse(p.care_instructions) : p.care_instructions || [],
    variantOptions: typeof p.variant_options === "string" ? JSON.parse(p.variant_options) : p.variant_options || [],
    variants: typeof p.variants === "string" ? JSON.parse(p.variants) : p.variants || [],
  };
}

// Initialize tables and seed default records
let isInitialized = false;

export async function initializeMySQLTables() {
  if (isInitialized) return;

  try {
    // 1. Create Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        reset_token VARCHAR(255) NULL,
        reset_token_expiry BIGINT NULL,
        shipping_addresses TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create Products Table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        sale_price DECIMAL(10,2) NULL,
        category VARCHAR(100) NOT NULL,
        images TEXT NULL,
        stock INT DEFAULT 15,
        rating DECIMAL(3,2) DEFAULT 5.0,
        review_count INT DEFAULT 0,
        featured TINYINT(1) DEFAULT 0,
        is_bestseller TINYINT(1) DEFAULT 0,
        is_new TINYINT(1) DEFAULT 0,
        is_promo TINYINT(1) DEFAULT 0,
        solutions TEXT NULL,
        details_list TEXT NULL,
        care_instructions TEXT NULL,
        variants TEXT NULL,
        variant_options TEXT NULL,
        stock_status VARCHAR(50) DEFAULT 'in_stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Orders Table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        order_status VARCHAR(50) DEFAULT 'Processing',
        payment_status VARCHAR(50) DEFAULT 'Unpaid',
        address TEXT NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'RAZORPAY',
        items TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Cart Table
    try {
      const columns = await query("SHOW COLUMNS FROM cart");
      const hasSku = columns.some((c: any) => c.Field === "sku");
      if (!hasSku) {
        await query("DROP TABLE IF EXISTS cart");
      }
    } catch (e) {
      // Table doesn't exist yet
    }

    await query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        sku VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        selected_color VARCHAR(100) NULL,
        selected_length VARCHAR(100) NULL,
        selected_base VARCHAR(100) NULL,
        UNIQUE KEY user_sku (user_id, sku)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Bookings Table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time_slot VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        notes TEXT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create Reviews Table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        date VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        verified TINYINT(1) DEFAULT 1,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // --- SEED SECTIONS ---

    // A. Seed Default Users
    const usersCount = await query("SELECT COUNT(*) as count FROM users");
    if (usersCount[0].count === 0) {
      const bcrypt = require("bcryptjs");
      const adminHash = bcrypt.hashSync("admin123", 10);
      const customerHash = bcrypt.hashSync("customer123", 10);

      await query(
        "INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
        ["u-admin", "Admin User", "admin@sam.com", "+91 99999 99999", adminHash, "admin"]
      );
      await query(
        "INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
        ["u-customer", "Sanya Customer", "customer@sam.com", "+91 98765 43210", customerHash, "customer"]
      );
      console.log("MySQL users table seeded.");
    }

    // B. Seed Default Products
    const productsCount = await query("SELECT COUNT(*) as count FROM products");
    if (productsCount[0].count === 0) {
      for (const p of MOCK_PRODUCTS) {
        await query(`
          INSERT INTO products (
            id, name, slug, description, price, sale_price, category, images, stock, rating, review_count,
            featured, is_bestseller, is_new, is_promo, solutions, details_list, care_instructions, variants, variant_options, stock_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id,
          p.name,
          p.slug,
          p.description,
          p.price,
          p.salePrice || null,
          p.category,
          JSON.stringify(p.images),
          15,
          p.rating,
          p.reviewCount,
          p.featured ? 1 : 0,
          p.isBestseller ? 1 : 0,
          p.isNew ? 1 : 0,
          p.isPromo ? 1 : 0,
          JSON.stringify(p.solutions || []),
          JSON.stringify(p.detailsList || []),
          JSON.stringify(p.careInstructions || []),
          JSON.stringify(p.variants || []),
          JSON.stringify(p.variantOptions || []),
          p.stockStatus || "in_stock",
        ]);
      }
      console.log("MySQL products table seeded.");
    }

    // C. Seed Default Reviews
    const reviewsCount = await query("SELECT COUNT(*) as count FROM reviews");
    if (reviewsCount[0].count === 0) {
      for (const r of MOCK_REVIEWS) {
        await query(`
          INSERT INTO reviews (id, product_id, product_name, user_name, rating, date, title, text, verified, helpful_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          r.id,
          r.productId,
          r.productName,
          r.userName,
          r.rating,
          r.date,
          r.title,
          r.text,
          r.verified ? 1 : 0,
          r.helpfulCount,
        ]);
      }
      console.log("MySQL reviews table seeded.");
    }

    // D. Seed Default Settings
    const settingsCount = await query("SELECT COUNT(*) as count FROM settings");
    if (settingsCount[0].count === 0) {
      const DEFAULT_SETTINGS = {
        heroImage: "https://www.sammrenaissance.com/cdn/shop/files/PRELIMENARY_-_43.png?v=1770894391",
        heroTitle: "Unveil Your Elegance.\nExquisite Custom Wear.",
        heroSubtitle: "Exquisite corset jumpsuits, kids fairy-style gowns, co-ords, and luxury accessories designed to make every occasion a fairytale.",
        categoryJumpsuitsImage: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209",
        categoryGownsImage: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/Untitleddesign_2.png?v=1771474477",
        categoryAccessoriesImage: "https://www.sammrenaissance.com/cdn/shop/files/5_d0f6184b-9364-41f7-af7d-2386c70cb427.png?v=1745742797",
        influencer1Image: "https://images.unsplash.com/photo-1595959183079-c1b0a865578a?w=600&auto=format&fit=crop",
        influencer1Name: "Celebrity Feature: Sanya Sen",
        influencer1Text: "We styled Sanya for the Filmfare Red Carpet using our Corset Jumpsuit. The structured bodice matches natural contours flawlessly.",
        influencer2Image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        influencer2Name: "Stylist Masterclass: Mira Kapoor",
        influencer2Text: "Our co-ord sets are Sanya's go-to for smart travel luxury. Very comfortable yet tailored.",
      };

      for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
        await query("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)", [key, val]);
      }
      console.log("MySQL settings table seeded.");
    }

    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize MySQL tables:", error);
  }
}
export default pool;
