import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const isAdmin = user.role === "ADMIN";

    const tickets = await prisma.ticket.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { subject, department, priority, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        ticketNumber,
        subject,
        department: department || "Technical Support",
        priority: priority || "MEDIUM",
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            senderName: user.name,
            senderRole: user.role,
            message,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
