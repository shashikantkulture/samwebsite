import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";
import { verifySessionToken } from "../../../lib/auth";
import { Product } from "../../../types";
import { MOCK_PRODUCTS } from "../../../data/mockDb";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sam_session")?.value;
  if (!token) return false;
  const payload = verifySessionToken(token);
  return payload?.role === "admin";
}

// GET products list with search & category filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Use MOCK_PRODUCTS — the current Prisma schema stores variantOptions/variants
    // as relational tables, not as the JSON shape the frontend expects.
    let products: Product[] = [...MOCK_PRODUCTS];

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const term = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term)
      );
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST create product (Admin only)
export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      category,
      price,
      salePrice,
      description,
      images,
      variantOptions,
      variants,
      solutions,
      detailsList,
      careInstructions,
      stock,
      featured,
      stockStatus,
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const productId = `p-${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        id: productId as any,
        name,
        slug,
        description: description || "",
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        category,
        images: images || [],
        stock: stock !== undefined ? Number(stock) : 15,
        featured: !!featured,
        solutions: solutions || [],
        detailsList: detailsList || [],
        careInstructions: careInstructions || [],
        variants: variants || [],
        variantOptions: variantOptions || [],
        stockStatus: stockStatus || "in_stock",
      } as any,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update product (Admin only)
export async function PUT(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      name,
      category,
      price,
      salePrice,
      description,
      images,
      variantOptions,
      variants,
      solutions,
      detailsList,
      careInstructions,
      stock,
      featured,
      stockStatus,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    await prisma.product.update({
      where: { id } as any,
      data: {
        name,
        slug,
        description: description || "",
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        category,
        images: images || [],
        stock: Number(stock),
        featured: !!featured,
        solutions: solutions || [],
        detailsList: detailsList || [],
        careInstructions: careInstructions || [],
        variants: variants || [],
        variantOptions: variantOptions || [],
        stockStatus: stockStatus || "in_stock",
      } as any,
    });
    const updatedProduct = await prisma.product.findUnique({ where: { id } as any });
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE delete product (Admin only)
export async function DELETE(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    const existing = await prisma.product.findUnique({ where: { id } as any });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prisma.product.delete({ where: { id } as any });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
