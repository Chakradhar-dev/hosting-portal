import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { serverId } = await req.json();

    if (!serverId) {
      return NextResponse.json({ error: "serverId is required" }, { status: 400 });
    }

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const client = new WhmClient(server);
    const whmPkgs = await client.listPackages();

    let createdCount = 0;
    for (const pkg of whmPkgs) {
      const existing = await prisma.package.findFirst({
        where: { serverId: server.id, whmPackageName: pkg.name },
      });

      if (!existing) {
        const quotaMb = pkg.quota === "unlimited" ? 0 : parseInt(pkg.quota, 10) || 5120;
        await prisma.package.create({
          data: {
            serverId: server.id,
            name: pkg.name.replace(/_/g, " "),
            whmPackageName: pkg.name,
            description: `Auto-synced package from WHM (${pkg.name})`,
            priceMonthly: 9.99,
            priceYearly: 99.99,
            diskQuotaMb: quotaMb,
            bandwidthQuotaMb: 51200,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      found: whmPkgs.length,
      imported: createdCount,
      packages: whmPkgs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
