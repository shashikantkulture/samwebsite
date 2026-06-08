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

// GET homepage settings
export async function GET() {
  try {
        const rows = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST update homepage settings (Admin only)
export async function POST(req: Request) {
  try {
        if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const newSettings = await req.json();

    for (const [key, val] of Object.entries(newSettings)) {
      if (val !== undefined && val !== null) {
        await prisma.setting.upsert({
            where: { setting_key: key },
            update: { setting_value: String(val) },
            create: { setting_key: key, setting_value: String(val) },
          });
      }
    }

        const rows = await prisma.setting.findMany();
     const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
