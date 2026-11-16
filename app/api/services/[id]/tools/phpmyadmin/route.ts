import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true },
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (service.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hosting account is currently inactive" }, { status: 400 });
    }

    const client = new WhmClient(service.server);
    const pmaRes = await client.getPhpMyAdminSession(service.cpanelUsername);

    return NextResponse.json(pmaRes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
