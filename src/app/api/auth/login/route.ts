import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// Old MySQL helper removed – using Prisma client
import { comparePassword, generateSessionToken } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

          // Verify bcrypt password hash
      const isPasswordValid = comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

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
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
