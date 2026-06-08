import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("sam_session", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Support GET requests as well for simplicity
export async function GET() {
  return POST();
}
