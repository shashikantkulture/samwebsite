export interface VariantOption {
  name: string; // e.g. "Color", "Length", "Base Type"
  values: string[]; // e.g. ["Natural Black", "Dark Brown", "Chocolate Brown"]
}

export interface VariantCombo {
  color: string;
  length: string;
  base?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
}

export interface BeforeAfterImage {
  before: string;
  after: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "gowns" | "jumpsuits" | "dresses" | "coords" | "tops" | "accessories";
  solutions: string[]; // ["volume", "length", "coverage", "color", "styling", "hairline", "thinning"]
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  videoUrl?: string; // Showcase video
  variantOptions: VariantOption[];
  variants: VariantCombo[];
  isBestseller?: boolean;
  isNew?: boolean;
  isPromo?: boolean;
  featured?: boolean;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  description: string;
  detailsList: string[];
  careInstructions: string[];
  howToUseVideo?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verified: boolean;
  photos?: string[];
  videos?: string[];
  helpfulCount: number;
}

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  location: "virtual" | "mumbai" | "delhi" | "bangalore";
  notes?: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: "care" | "loss" | "styling" | "guides" | "trends";
  author: string;
  date: string;
  coverImage: string;
  summary: string;
  content: string;
  readTime: string;
  videoUrl?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  selectedColor: string;
  selectedLength: string;
  selectedBase?: string;
  sku: string;
}
