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

function mapDbBooking(b: any) {
  return {
    id: b.id,
    customerName: b.customerName,
    email: b.email,
    phone: b.phone,
    date: b.date,
    timeSlot: b.timeSlot,
    location: b.location,
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt,
  };
}

// GET bookings
export async function GET() {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let rows;
    if (session.role === "admin") {
      rows = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
    } else {
      rows = await prisma.booking.findMany({ where: { email: session.email.toLowerCase() }, orderBy: { createdAt: "desc" } });
    }

    return NextResponse.json({ bookings: rows.map(mapDbBooking) });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST create booking
export async function POST(req: Request) {
  try {
    // Prisma does not require manual init
    const body = await req.json();
    const { customerName, email, phone, date, timeSlot, location, notes } = body;
    if (!customerName || !email || !phone || !date || !timeSlot || !location) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }
    const bookingId = `b-${Date.now()}`;
    const newBooking = await prisma.booking.create({
      data: {
        id: bookingId,
        customerName,
        email: email.toLowerCase().trim(),
        phone,
        date,
        timeSlot,
        location,
        notes: notes || null,
        status: "confirmed",
        createdAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE cancel booking
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions: admin or owner of the booking
    if (session.role !== "admin" && booking.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
    }

    await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });

    const updated = await prisma.booking.findUnique({ where: { id } });
    return NextResponse.json({ success: true, booking: mapDbBooking(updated) });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
