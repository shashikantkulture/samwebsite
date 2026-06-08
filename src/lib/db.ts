import fs from "fs";
import path from "path";
import { Product, Review, Booking, BlogArticle } from "../types";
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_BLOGS } from "../data/mockDb";
import { hashPassword } from "./auth";

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "customer";
  createdAt: string;
}

export interface HomepageSettings {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  categoryJumpsuitsImage: string;
  categoryGownsImage: string;
  categoryAccessoriesImage: string;
  influencer1Image: string;
  influencer1Name: string;
  influencer1Text: string;
  influencer2Image: string;
  influencer2Name: string;
  influencer2Text: string;
}

export interface Order {
  orderId: string;
  itemsCount: number;
  items: any[];
  date: string;
  total: string;
  status: string;
  address: string;
  payment: string;
  email: string;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  bookings: Booking[];
  reviews: Review[];
  blogs: BlogArticle[];
  settings: HomepageSettings;
}

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Default initial settings for homepage
const DEFAULT_SETTINGS: HomepageSettings = {
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

// Seeder logic to create db.json if it does not exist
function initializeDb(): DatabaseSchema {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse db.json, re-initializing", e);
    }
  }

  // Create default db schema
  const db: DatabaseSchema = {
    users: [
      {
        id: "u-admin",
        email: "admin@sam.com",
        name: "Admin User",
        passwordHash: hashPassword("admin123"),
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "u-customer",
        email: "customer@sam.com",
        name: "Sanya Customer",
        passwordHash: hashPassword("customer123"),
        role: "customer",
        createdAt: new Date().toISOString(),
      },
    ],
    products: MOCK_PRODUCTS,
    orders: [
      {
        orderId: "ORD-94812",
        itemsCount: 1,
        items: [
          {
            productId: "p1",
            productName: "Women’s Corset Jumpsuit - High-Waisted Wide Leg One-Piece Bodice Suit",
            image: "https://cdn.shopify.com/s/files/1/0932/4796/3414/files/PRELIMENARY-34.png?v=1771478209",
            price: 7299,
            quantity: 1,
            selectedColor: "maroon",
            selectedLength: "Standard",
            sku: "SR-10416570466582-0",
          },
        ],
        date: new Date().toISOString().split("T")[0],
        total: "7449.00",
        status: "Delivered",
        address: "Bandra West Apt 4B, Linking Road, Mumbai, MH, 400050",
        payment: "STRIPE",
        email: "customer@sam.com",
      },
    ],
    bookings: [
      {
        id: "b-1",
        customerName: "Riddhi Sen",
        email: "riddhi@example.com",
        phone: "+91 98765 43210",
        date: "2026-06-03",
        timeSlot: "11:00 AM - 11:30 AM",
        location: "virtual",
        notes: "Need shade matching help for Classic Clip-ins.",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      },
    ],
    reviews: MOCK_REVIEWS,
    blogs: MOCK_BLOGS,
    settings: DEFAULT_SETTINGS,
  };

  saveDb(db);
  return db;
}

// Global read/write helper
export function getDb(): DatabaseSchema {
  return initializeDb();
}

export function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to db.json", e);
  }
}
