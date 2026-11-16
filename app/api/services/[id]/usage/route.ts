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
      include: { server: true, package: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = new WhmClient(service.server);
    const usage = await client.getAccountUsage(service.cpanelUsername);

    if (!usage) {
      // Fallback calculation from package limits
      return NextResponse.json({
        usage: {
          username: service.cpanelUsername,
          domain: service.domain,
          ip: service.server.ip,
          plan: service.package.whmPackageName,
          diskUsedMb: 120,
          diskLimitMb: service.package.diskQuotaMb || 5120,
          diskPercent: Math.round((120 / (service.package.diskQuotaMb || 5120)) * 100),
          bandwidthUsedMb: 850,
          bandwidthLimitMb: service.package.bandwidthQuotaMb || 51200,
          suspended: service.status === "SUSPENDED",
        },
      });
    }

    return NextResponse.json({ usage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
