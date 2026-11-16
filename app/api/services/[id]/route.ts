import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: {
        package: true,
        server: { select: { id: true, name: true, hostname: true, ip: true, nameserver1: true, nameserver2: true } },
        user: { select: { id: true, name: true, email: true, company: true } },
        invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Permission check
    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
