import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prisma";
import { verifySessionToken, hashPassword } from "../../../../lib/auth";

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sam_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET profile
export async function GET() {
  try {
    // Prisma handles DB connection – no init needed
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const u = user;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.fullName ?? u.email,
        phone: u.phone || "",
        role: u.role,
        shippingAddresses: u.addresses.map(a=>({
          id:a.id,
          fullName:a.fullName,
          phone:a.phone,
          line1:a.line1,
          line2:a.line2,
          city:a.city,
          state:a.state,
          country:a.country,
          postalCode:a.postalCode,
          isDefault:a.isDefault,
        })),
      },
    });
  } catch (error: any) {
    console.error("Session profile fetch error:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server error" });
  }
}

// PUT update profile / saved addresses / password settings
export async function PUT(req: Request) {
  try {
    // Prisma does not require manual init
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, password, shippingAddresses } = body;

    const user = await prisma.user.findUnique({ where: { email: session.email }, select: { passwordHash: true } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update query dynamically
    let updateQuery = "UPDATE users SET name = ?, phone = ?";
    const queryParams: any[] = [name ? name.trim() : "", phone ? phone.trim() : null];

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updateQuery += ", password_hash = ?";
      queryParams.push(hashPassword(password));
    }

    if (shippingAddresses) {
      updateQuery += ", shipping_addresses = ?";
      queryParams.push(JSON.stringify(shippingAddresses));
    }

    updateQuery += " WHERE email = ?";
    queryParams.push(session.email);

    await prisma.user.update({
        where: { email: session.email },
        data: {
          fullName: name?.trim() || undefined,
          phone: phone?.trim() || undefined,
          passwordHash: password ? hashPassword(password) : undefined,
          // shipping addresses handled below if provided
        },
      });

    // Fetch updated user details
    const updatedUser = await prisma.user.findUnique({
        where: { email: session.email },
        include: { addresses: true },
      });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found after update" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.fullName ?? updatedUser.email,
        phone: updatedUser.phone || "",
        role: updatedUser.role,
        shippingAddresses: updatedUser.addresses.map(a => ({
          id: a.id,
          fullName: a.fullName,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          state: a.state,
          country: a.country,
          postalCode: a.postalCode,
          isDefault: a.isDefault,
        })),
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
