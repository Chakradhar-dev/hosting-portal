import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; wpId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, wpId } = await params;
    const { action } = await req.json();

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

    const client = new WhmClient(wp.hostingAccount.server);

    if (action === "toggle_maintenance") {
      const newStatus = !wp.maintenanceMode;
      await client.toggleWordpressMaintenance(wp.hostingAccount.cpanelUsername, wp.siteUrl, newStatus);
      const updated = await prisma.wordpressInstallation.update({
        where: { id: wpId },
        data: { maintenanceMode: newStatus },
      });
      return NextResponse.json({ success: true, wordpress: updated });
    }

    if (action === "toggle_autoupdate") {
      const newStatus = !wp.autoUpdate;
      const updated = await prisma.wordpressInstallation.update({
        where: { id: wpId },
        data: { autoUpdate: newStatus },
      });
      return NextResponse.json({ success: true, wordpress: updated });
    }

    if (action === "delete") {
      await prisma.wordpressInstallation.delete({ where: { id: wpId } });
      return NextResponse.json({ success: true, message: "WordPress installation removed" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
