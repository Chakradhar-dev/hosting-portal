import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; wpId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, wpId } = await params;

    const wp = await prisma.wordpressInstallation.findUnique({
      where: { id: wpId },
      include: {
        hostingAccount: { include: { server: true } },
      },
    });

    if (!wp || wp.hostingAccountId !== id) {
      return NextResponse.json({ error: "WordPress installation not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && wp.hostingAccount.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (wp.hostingAccount.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hosting account is currently inactive or suspended" }, { status: 400 });
    }

    const client = new WhmClient(wp.hostingAccount.server);
    const ssoResult = await client.createWordpressSso(wp.hostingAccount.cpanelUsername, wp.siteUrl);

    if (!ssoResult.success || !ssoResult.url) {
      return NextResponse.json({ error: ssoResult.error || "Failed to generate WP Admin SSO session" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      url: ssoResult.url,
      siteTitle: wp.siteTitle,
      adminUser: wp.adminUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
