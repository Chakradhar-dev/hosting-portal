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
      include: {
        wordpressSites: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ wordpressSites: service.wordpressSites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { siteTitle, path = "/", adminUser = "admin", adminPassword, adminEmail } = body;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (service.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hosting account is not active" }, { status: 400 });
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const client = new WhmClient(service.server);

    // Call WHM / cPanel WordPress Installer
    const installResult = await client.installWordpress(service.cpanelUsername, {
      domain: service.domain,
      path: cleanPath,
      siteTitle: siteTitle || `${service.domain} WordPress`,
      adminUser,
      adminPassword,
      adminEmail: adminEmail || user.email,
    });

    if (!installResult.success) {
      return NextResponse.json({ error: installResult.reason || "Installation failed" }, { status: 502 });
    }

    // Persist in Database
    const wpSite = await prisma.wordpressInstallation.create({
      data: {
        hostingAccountId: service.id,
        siteTitle: siteTitle || `${service.domain} WordPress`,
        siteUrl: installResult.siteUrl,
        path: cleanPath,
        adminUser,
        adminEmail: adminEmail || user.email,
        version: installResult.version || "6.7.1",
        dbName: installResult.dbName || `${service.cpanelUsername}_wp`,
        dbUser: installResult.dbUser || `${service.cpanelUsername}_u`,
        maintenanceMode: false,
        autoUpdate: true,
        pluginsCount: 4,
      },
    });

    return NextResponse.json({
      success: true,
      wordpress: wpSite,
      message: "WordPress installed successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
