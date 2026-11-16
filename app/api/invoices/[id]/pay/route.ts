import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const paymentMethod = body.paymentMethod || "Credit Card (Instant)";

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        hostingAccount: {
          include: { server: true, package: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && invoice.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ message: "Invoice is already paid" });
    }

    // 1. Mark invoice as PAID
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod,
      },
    });

    let automationMessage = "Payment processed successfully.";

    // 2. Automated WHM Provisioning or Unsuspension
    if (invoice.hostingAccount) {
      const ha = invoice.hostingAccount;
      const client = new WhmClient(ha.server);

      // If pending -> provision on WHM
      if (ha.status === "PENDING") {
        try {
          const prov = await client.createAccount({
            username: ha.cpanelUsername,
            domain: ha.domain,
            plan: ha.package.whmPackageName,
            contactEmail: user.email,
          });

          await prisma.hostingAccount.update({
            where: { id: ha.id },
            data: { status: "ACTIVE" },
          });

          automationMessage = `Payment settled & cPanel account for ${ha.domain} was automatically provisioned on WHM!`;
        } catch (err: any) {
          automationMessage = `Payment accepted. WHM provisioning logged: ${err.message}`;
        }
      } else if (ha.status === "SUSPENDED") {
        // If suspended -> auto-unsuspend on WHM
        try {
          await client.unsuspendAccount(ha.cpanelUsername);
          await prisma.hostingAccount.update({
            where: { id: ha.id },
            data: { status: "ACTIVE", suspendReason: null },
          });
          automationMessage = `Payment settled & cPanel account for ${ha.domain} was automatically unsuspended on WHM!`;
        } catch (err: any) {
          automationMessage = `Payment accepted. WHM unsuspend logged: ${err.message}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: automationMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
