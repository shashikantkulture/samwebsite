import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    // Prisma does not require manual init
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({ where: { resetToken: token }, select: { id: true, resetExpires: true } });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // user fetched above (no change needed)

    // Check if token has expired
    if (user.resetExpires && Date.now() > Number(user.resetExpires)) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
    }

    const newHash = hashPassword(password);

    // Update password and clear reset fields
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, resetToken: null, resetExpires: null } });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
