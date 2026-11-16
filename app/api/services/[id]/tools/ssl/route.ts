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

    const client = new WhmClient(service.server);
    const sslStatus = await client.getSslStatus(service.cpanelUsername, service.domain);

    return NextResponse.json({ ssl: sslStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const client = new WhmClient(service.server);
    const result = await client.runAutoSsl(service.cpanelUsername);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
