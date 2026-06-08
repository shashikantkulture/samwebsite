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

// GET orders history
export async function GET() {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let orders;
    if (session.role === "admin") {
      orders = await prisma.order.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      const rawUserId = session.id || (await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }))?.id;
      if (!rawUserId) {
        return NextResponse.json({ orders: [] });
      }
      const userId = Number(rawUserId);
      orders = await prisma.order.findMany({
        where: { userId },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    const formattedOrders = orders.map((o: any) => {
      let items = [];
      try {
        items = typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
      } catch (e) {}
      let address = o.address;
      try {
        if (typeof o.address === "string" && (o.address.startsWith('{') || o.address.startsWith('['))) {
          address = JSON.parse(o.address);
        }
      } catch (e) {}
      const date = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return {
        orderId: o.id,
        itemsCount: items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
        items,
        date,
        total: String(o.totalAmount),
        status: o.orderStatus,
        address,
        payment: o.paymentMethod || "RAZORPAY",
        payment_status: o.paymentStatus,
        email: o.user?.email || session.email,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST place order
export async function POST(req: Request) {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Please log in to place an order." }, { status: 401 });
    }

    
    const body = await req.json();
    const { items, total, address, payment, itemsCount, orderId: bodyOrderId, payment_status } = body;

    if (!items || !total || !address) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    const rawUserId = session.id || (await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } }))?.id;
    if (!rawUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = Number(rawUserId);

    const orderId = bodyOrderId || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const serializedItems = JSON.stringify(items);
    const serializedAddress = typeof address === "object" ? JSON.stringify(address) : address;
    const finalPaymentStatus = payment_status || "Paid";

    await prisma.order.create({
      data: {
        id: orderId,
        userId,
        totalAmount: parseFloat(total),
        orderStatus: "Processing",
        paymentStatus: finalPaymentStatus,
        address: serializedAddress,
        paymentMethod: payment || "RAZORPAY",
        items: serializedItems,
      },
    });

    const newOrder = {
      orderId,
      itemsCount: itemsCount || items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
      items,
      date: new Date().toISOString().split("T")[0],
      total: String(total),
      status: "Processing",
      address,
      payment: payment || "RAZORPAY",
      payment_status: finalPaymentStatus,
      email: session.email,
    };

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Place order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update order status (Admin only)
export async function PUT(req: Request) {
  try {
    // Prisma does not require manual init
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    await prisma.order.update({ where: { id: orderId }, data: { orderStatus: status } });
    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true } } },
    });
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let items = [];
    try {
      items = typeof updated.items === "string" ? JSON.parse(updated.items) : updated.items || [];
    } catch (e) {}
    let address = updated.address;
    try {
      if (typeof updated.address === "string" && (updated.address.startsWith('{') || updated.address.startsWith('['))) {
        address = JSON.parse(updated.address);
      }
    } catch (e) {}
    const updatedOrder = {
      orderId: updated.id,
      itemsCount: items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
      items,
      date: updated.createdAt ? new Date(updated.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      total: String(updated.totalAmount),
      status: updated.orderStatus,
      address,
      payment: updated.paymentMethod || "RAZORPAY",
      payment_status: updated.paymentStatus,
      email: updated.user?.email || "",
    };

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

