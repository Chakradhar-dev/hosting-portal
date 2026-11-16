import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const packages = await prisma.package.findMany({
      where: isAdmin ? {} : { active: true },
      include: {
        server: {
          select: { id: true, name: true, hostname: true },
        },
      },
      orderBy: { priceMonthly: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      name,
      whmPackageName,
      serverId,
      description,
      priceMonthly,
      priceYearly,
      diskQuotaMb,
      bandwidthQuotaMb,
      maxEmailAccounts,
      maxDatabases,
      maxSubdomains,
      featured,
    } = body;

    if (!name || !whmPackageName) {
      return NextResponse.json({ error: "Package name and WHM package name are required" }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        whmPackageName,
        serverId: serverId || null,
        description,
        priceMonthly: parseFloat(priceMonthly) || 0,
        priceYearly: parseFloat(priceYearly) || 0,
        diskQuotaMb: parseInt(diskQuotaMb, 10) || 5120,
        bandwidthQuotaMb: parseInt(bandwidthQuotaMb, 10) || 51200,
        maxEmailAccounts: parseInt(maxEmailAccounts, 10) || 10,
        maxDatabases: parseInt(maxDatabases, 10) || 5,
        maxSubdomains: parseInt(maxSubdomains, 10) || 5,
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
