import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";
import { verifySessionToken } from "../../../lib/auth";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sam_session")?.value;
  if (!token) return false;
  const payload = verifySessionToken(token);
  return payload?.role === "admin";
}

function mapDbReview(r: any) {
  return {
    id: r.id,
    productId: r.productId,
    productName: r.productName,
    userName: r.userName,
    rating: Number(r.rating),
    date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    title: r.title,
    text: r.text,
    verified: Boolean(r.verified),
    helpfulCount: Number(r.helpfulCount),
    photos: [],
    videos: [],
  };
}

// GET reviews
export async function GET() {
  try {
    const rows = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ reviews: rows.map(mapDbReview) });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST submit review
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, userName, rating, title, text } = body;

    if (!productId || !productName || !userName || !rating || !title || !text) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId: Number(productId),
        productName,
        userName,
        rating: Number(rating),
        title,
        text,
        verified: true,
        helpfulCount: 0,
      },
    });

    const newReview = {
      id: review.id,
      productId: review.productId,
      productName: review.productName,
      userName: review.userName,
      rating: review.rating,
      date: review.createdAt.toISOString().split('T')[0],
      title: review.title,
      text: review.text,
      verified: review.verified,
      photos: [],
      videos: [],
      helpfulCount: review.helpfulCount,
    };

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT moderate review (Admin only)
export async function PUT(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id, action } = await req.json(); // action = "approve" | "reject"

    if (!id || !action) {
      return NextResponse.json({ error: "Review ID and action are required" }, { status: 400 });
    }

    if (action === "reject") {
      await prisma.review.delete({ where: { id: Number(id) } });
    } else {
      await prisma.review.update({
        where: { id: Number(id) },
        data: { verified: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Moderate review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
