import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const servers = await prisma.server.findMany({
      include: {
        _count: {
          select: { hostingAccounts: true, packages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask API token for security in listing
    const sanitized = servers.map((s) => ({
      ...s,
      apiToken: s.apiToken ? `${s.apiToken.substring(0, 6)}...` : "",
    }));

    return NextResponse.json({ servers: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { name, hostname, ip, port, username, apiToken, nameserver1, nameserver2, useSsl } = body;

    if (!name || !hostname || !ip || !apiToken) {
      return NextResponse.json({ error: "Name, hostname, IP, and API Token are required" }, { status: 400 });
    }

    const server = await prisma.server.create({
      data: {
        name,
        hostname,
        ip,
        port: port ? parseInt(port, 10) : 2087,
        username: username || "root",
        apiToken,
        nameserver1,
        nameserver2,
        useSsl: useSsl ?? true,
      },
    });

    return NextResponse.json({ success: true, server });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
