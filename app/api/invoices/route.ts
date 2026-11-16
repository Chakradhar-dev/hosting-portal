import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const isAdmin = user.role === "ADMIN";

    const invoices = await prisma.invoice.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true, company: true } },
        hostingAccount: { select: { domain: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
