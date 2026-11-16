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
    const accounts = await client.listFtpAccounts(service.cpanelUsername);

    return NextResponse.json({
      accounts,
      host: service.server.hostname,
      port: 21,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { ftpUser, password } = await req.json();

    if (!ftpUser || !password) {
      return NextResponse.json({ error: "FTP Username and password are required" }, { status: 400 });
    }

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true },
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const client = new WhmClient(service.server);
    const result = await client.createFtpAccount(service.cpanelUsername, ftpUser, password);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
