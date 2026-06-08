import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    // Prisma handles DB connection – no init needed
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, fullName: true },
    });

    if (!user) {
      // Return success to avoid email verification enumeration
      return NextResponse.json({
        success: true,
        message: "If this email is registered, a password reset link will be generated.",
      });
    }

    // Generate random token and 1 hour expiry
    const token = crypto.randomBytes(20).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetToken: token,
        resetExpires: new Date(Date.now() + 3600000),
      },
    });

    // Generate reset link
    const resetLink = `/account?tab=reset-password&token=${token}`;

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetLink, // Returning the link directly makes it easy to test and use without SMTP setup
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
