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
      return NextResponse.json({ error: "Forbidden: Not your hosting account" }, { status: 403 });
    }

    if (service.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account is suspended. Please settle overdue invoices first." }, { status: 400 });
    }

    if (service.status === "TERMINATED") {
      return NextResponse.json({ error: "This hosting account has been terminated." }, { status: 400 });
    }

    // Call WHM API to create single-use session for cPanel
    const client = new WhmClient(service.server);
    const sessionRes = await client.createCpanelSession(service.cpanelUsername);

    if (!sessionRes.success || !sessionRes.url) {
      return NextResponse.json(
        { error: sessionRes.error || "Failed to generate cPanel SSO token from server" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: sessionRes.url,
      username: service.cpanelUsername,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
