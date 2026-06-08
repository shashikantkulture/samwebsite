import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";
import { verifySessionToken } from "../../../lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sam_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET cart items from database
export async function GET() {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const rawUserId = session.id || (await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }))?.id;
    if (!rawUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = Number(rawUserId);

    const cartRows = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

    const cart = cartRows.map((r: any) => {
        const product = r.product;
        let images = [];
        try {
          images = typeof product.images === "string" ? JSON.parse(product.images) : product.images || [];
        } catch (e) {}
        const image = images[0] || "";
        return {
          productId: r.productId,
          productName: product.name,
          productSlug: product.slug,
          image: image,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          quantity: Number(r.quantity),
          selectedColor: r.selectedColor || "",
          selectedLength: r.selectedLength || "",
          selectedBase: r.selectedBase || "",
          sku: r.sku,
        };
      });

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error("Fetch cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST sync/save cart items to database (batch update)
export async function POST(req: Request) {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const rawUserId = session.id || (await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }))?.id;
    if (!rawUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = Number(rawUserId);

    const body = await req.json();
    const { cart } = body;

    if (!Array.isArray(cart)) {
      return NextResponse.json({ error: "Cart data must be an array" }, { status: 400 });
    }

    // Overwrite database cart with synced client cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    await prisma.cartItem.createMany({
      data: cart.map(item => ({
        userId,
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        selectedLength: item.selectedLength || null,
        selectedBase: item.selectedBase || null,
      })),
    });

    return NextResponse.json({ success: true, message: "Cart synced successfully" });
  } catch (error: any) {
    console.error("Sync cart error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
