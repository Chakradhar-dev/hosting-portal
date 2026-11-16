import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action, reason } = await req.json();

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true, package: true, user: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    const client = new WhmClient(service.server);
    let result: any = null;

    if (action === "provision") {
      result = await client.createAccount({
        username: service.cpanelUsername,
        domain: service.domain,
        plan: service.package.whmPackageName,
        contactEmail: service.user.email,
      });

      if (result.success) {
        await prisma.hostingAccount.update({
          where: { id: service.id },
          data: { status: "ACTIVE", suspendReason: null },
        });
      }
    } else if (action === "suspend") {
      result = await client.suspendAccount(service.cpanelUsername, reason || "Administrative suspension");
      if (result.success) {
        await prisma.hostingAccount.update({
          where: { id: service.id },
          data: { status: "SUSPENDED", suspendReason: reason || "Suspended by Admin" },
        });
      }
    } else if (action === "unsuspend") {
      result = await client.unsuspendAccount(service.cpanelUsername);
      if (result.success) {
        await prisma.hostingAccount.update({
          where: { id: service.id },
          data: { status: "ACTIVE", suspendReason: null },
        });
      }
    } else if (action === "terminate") {
      result = await client.terminateAccount(service.cpanelUsername);
      if (result.success) {
        await prisma.hostingAccount.update({
          where: { id: service.id },
          data: { status: "TERMINATED" },
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      reason: result.reason,
      newStatus: action === "suspend" ? "SUSPENDED" : action === "unsuspend" || action === "provision" ? "ACTIVE" : "TERMINATED",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
