import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// Old MySQL helper removed – using Prisma client
import { hashPassword, generateSessionToken } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password, phone } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in MySQL
    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

    const passwordHash = hashPassword(password);
    const phoneNumber = phone ? phone.trim() : null;

    // Create user via Prisma
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: name.trim(),
        passwordHash,
        phone: phoneNumber,
        role: "customer",
      },
    });

    const token = generateSessionToken({
      id: String(user.id),
      email: user.email,
      name: user.fullName ?? user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("sam_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName ?? user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
