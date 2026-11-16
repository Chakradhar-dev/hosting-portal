import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function GET() {
  try {
    const user = await requireAuth();
    const isAdmin = user.role === "ADMIN";

    const services = await prisma.hostingAccount.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        package: true,
        server: { select: { name: true, hostname: true, ip: true, nameserver1: true, nameserver2: true } },
        user: { select: { id: true, name: true, email: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

/**
 * Order a new hosting service
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { packageId, domain, billingCycle = "MONTHLY", autoProvision = true } = body;

    if (!packageId || !domain) {
      return NextResponse.json({ error: "Package and domain are required" }, { status: 400 });
    }

    // Sanitize domain
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // Generate safe cPanel username (alphanumeric, max 8-16 chars, starts with letter)
    const baseUsername = cleanDomain.replace(/[^a-z0-9]/g, "").slice(0, 8);
    const randomSuffix = Math.floor(10 + Math.random() * 89);
    const cpanelUsername = `${baseUsername.slice(0, 6)}${randomSuffix}`;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { server: true },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Selected package not found" }, { status: 404 });
    }

    // Pick server (assigned to package or first active server)
    let server = pkg.server;
    if (!server) {
      server = await prisma.server.findFirst({ where: { active: true } });
    }

    if (!server) {
      return NextResponse.json({ error: "No active cPanel/WHM server configured to host this package" }, { status: 400 });
    }

    const price = billingCycle === "YEARLY" ? pkg.priceYearly : pkg.priceMonthly;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + (billingCycle === "YEARLY" ? 365 : 30));

    // Create Hosting Service in database
    const service = await prisma.hostingAccount.create({
      data: {
        userId: user.id,
        serverId: server.id,
        packageId: pkg.id,
        domain: cleanDomain,
        cpanelUsername,
        status: autoProvision ? "ACTIVE" : "PENDING",
        billingCycle,
        amount: price,
        nextDueDate,
      },
    });

    // Create Initial Invoice
    const invoiceNum = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        hostingAccountId: service.id,
        invoiceNumber: invoiceNum,
        title: `${pkg.name} Hosting - ${cleanDomain} (${billingCycle})`,
        amount: price,
        status: autoProvision ? "PAID" : "UNPAID",
        dueDate: new Date(),
        paidAt: autoProvision ? new Date() : null,
        paymentMethod: autoProvision ? "Instant Provisioning" : null,
      },
    });

    // If autoProvision is enabled, call WHM API to provision immediately!
    let whmResult: any = null;
    if (autoProvision) {
      try {
        const whmClient = new WhmClient(server);
        whmResult = await whmClient.createAccount({
          username: cpanelUsername,
          domain: cleanDomain,
          plan: pkg.whmPackageName,
          contactEmail: user.email,
        });

        if (!whmResult.success) {
          console.warn("WHM Provisioning warning:", whmResult.reason);
        }
      } catch (err: any) {
        console.error("WHM Provisioning failed:", err.message);
      }
    }

    return NextResponse.json({
      success: true,
      service,
      invoice,
      whmProvisioning: whmResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
