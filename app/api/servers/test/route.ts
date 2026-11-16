import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { serverId, hostname, ip, port, username, apiToken, useSsl } = body;

    let targetServer: {
      hostname: string;
      ip: string;
      port?: number;
      username?: string;
      apiToken: string;
      useSsl?: boolean;
    };

    if (serverId) {
      const server = await prisma.server.findUnique({ where: { id: serverId } });
      if (!server) {
        return NextResponse.json({ error: "Server not found" }, { status: 404 });
      }
      targetServer = server;
    } else {
      if (!hostname || !apiToken) {
        return NextResponse.json({ error: "Hostname and API Token required to test" }, { status: 400 });
      }
      targetServer = {
        hostname,
        ip: ip || hostname,
        port: port ? parseInt(port, 10) : 2087,
        username: username || "root",
        apiToken,
        useSsl: useSsl ?? true,
      };
    }

    const client = new WhmClient(targetServer);
    const result = await client.testConnection();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
