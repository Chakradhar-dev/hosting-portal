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

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (service.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hosting account is currently inactive" }, { status: 400 });
    }

    const client = new WhmClient(service.server);
    const builderRes = await client.launchWebsiteBuilder(service.cpanelUsername, service.domain);

    if (!builderRes.success || !builderRes.url) {
      return NextResponse.json({ error: builderRes.error || "Failed to generate Website Builder SSO" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      url: builderRes.url,
      domain: service.domain,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
