import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Hosting Portal database...");

  // 1. Create Admin & Client users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hostingportal.com" },
    update: {},
    create: {
      name: "Portal Administrator",
      email: "admin@hostingportal.com",
      password: adminPassword,
      role: "ADMIN",
      company: "Cloud Hosting Ltd.",
      phone: "+1-555-0199",
    },
  });

  const clientPassword = await bcrypt.hash("client123", 10);
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "client@example.com",
      password: clientPassword,
      role: "CLIENT",
      company: "Johnson Digital Studio",
      phone: "+1-555-0142",
      address: "100 Market St, San Francisco, CA",
    },
  });

  console.log("✅ Users created: admin@hostingportal.com and client@example.com");

  // 2. Create WHM Server
  const server = await prisma.server.upsert({
    where: { id: "server-whm-primary" },
    update: {},
    create: {
      id: "server-whm-primary",
      name: "cPanel Node US-East (Primary)",
      hostname: "srv1.hostingcloud.net",
      ip: "198.51.100.25",
      port: 2087,
      username: "root",
      apiToken: "demo_token_whm_secret_key_88412",
      nameserver1: "ns1.hostingcloud.net",
      nameserver2: "ns2.hostingcloud.net",
      useSsl: true,
      active: true,
    },
  });

  console.log("✅ Server created:", server.name);

  // 3. Create Packages
  const starterPkg = await prisma.package.upsert({
    where: { id: "pkg-starter" },
    update: {},
    create: {
      id: "pkg-starter",
      serverId: server.id,
      name: "cPanel Starter",
      whmPackageName: "cPanel_Starter",
      description: "Ideal for personal websites, blogs, and portfolio projects with high performance SSD storage.",
      priceMonthly: 4.99,
      priceYearly: 49.99,
      diskQuotaMb: 5120, // 5GB
      bandwidthQuotaMb: 51200, // 50GB
      maxEmailAccounts: 5,
      maxDatabases: 2,
      maxSubdomains: 3,
      featured: false,
    },
  });

  const businessPkg = await prisma.package.upsert({
    where: { id: "pkg-business" },
    update: {},
    create: {
      id: "pkg-business",
      serverId: server.id,
      name: "cPanel Business Pro",
      whmPackageName: "cPanel_Business",
      description: "Engineered for high-traffic websites, e-commerce stores, and active client agencies.",
      priceMonthly: 12.99,
      priceYearly: 129.99,
      diskQuotaMb: 25600, // 25GB
      bandwidthQuotaMb: 256000, // 250GB
      maxEmailAccounts: 25,
      maxDatabases: 15,
      maxSubdomains: 20,
      featured: true,
    },
  });

  const enterprisePkg = await prisma.package.upsert({
    where: { id: "pkg-enterprise" },
    update: {},
    create: {
      id: "pkg-enterprise",
      serverId: server.id,
      name: "cPanel Enterprise Cloud",
      whmPackageName: "cPanel_Enterprise",
      description: "Dedicated resources, unlimited inboxes, automated daily off-site backups, and priority support.",
      priceMonthly: 29.99,
      priceYearly: 299.99,
      diskQuotaMb: 102400, // 100GB
      bandwidthQuotaMb: 1024000, // 1TB
      maxEmailAccounts: 100,
      maxDatabases: 50,
      maxSubdomains: 50,
      featured: false,
    },
  });

  console.log("✅ Packages created: Starter, Business Pro, Enterprise Cloud");

  // 4. Create Active Hosting Service for client
  const hostingService = await prisma.hostingAccount.upsert({
    where: { id: "service-alex-1" },
    update: {},
    create: {
      id: "service-alex-1",
      userId: client.id,
      serverId: server.id,
      packageId: businessPkg.id,
      domain: "myawesomeapp.com",
      cpanelUsername: "awesomeapp",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      amount: 12.99,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
    },
  });

  console.log("✅ Active hosting account created for:", hostingService.domain);

  // 4b. WordPress Installation
  await prisma.wordpressInstallation.upsert({
    where: { id: "wp-alex-primary" },
    update: {},
    create: {
      id: "wp-alex-primary",
      hostingAccountId: hostingService.id,
      siteTitle: "My Awesome WordPress Store",
      siteUrl: "https://myawesomeapp.com",
      path: "/",
      adminUser: "alex_admin",
      adminEmail: "alex@example.com",
      version: "6.7.1",
      dbName: "awesomeapp_wp412",
      dbUser: "awesomeapp_u412",
      maintenanceMode: false,
      autoUpdate: true,
      pluginsCount: 6,
    },
  });
  console.log("✅ WordPress installation created for:", hostingService.domain);

  // 4c. Website Builder Project
  const initialBuilderConfig = JSON.stringify({
    businessName: "Johnson Creative Studio",
    tagline: "High-impact digital design and cloud engineering",
    heroHeading: "Scale Your Business With Stunning Web Experiences",
    heroSubheading: "We design, build, and deploy lightning-fast digital products tailored to convert visitors into loyal clients.",
    primaryCtaText: "Get Free Consultation",
    secondaryCtaText: "View Our Work",
    themeColor: "#4f46e5",
    features: [
      { title: "Custom Web Design", description: "Bespoke, conversion-focused websites built with modern web technologies." },
      { title: "Cloud Optimization", description: "Enterprise-grade speed, 99.99% uptime, and global CDN delivery." },
      { title: "SEO & Growth", description: "Targeted organic search engine optimization to drive continuous organic traffic." }
    ],
    contactEmail: "hello@johnsonstudio.com",
    contactPhone: "+1 (555) 234-5678"
  });

  await prisma.websiteBuilderProject.upsert({
    where: { id: "builder-alex-primary" },
    update: {},
    create: {
      id: "builder-alex-primary",
      hostingAccountId: hostingService.id,
      siteTitle: "Johnson Creative Studio",
      template: "agency",
      status: "PUBLISHED",
      publishedUrl: `https://${hostingService.domain}`,
      config: initialBuilderConfig,
      lastPublishedAt: new Date(),
    },
  });
  console.log("✅ Website Builder project created for:", hostingService.domain);

  // 5. Invoices
  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-1001" },
    update: {},
    create: {
      userId: client.id,
      hostingAccountId: hostingService.id,
      invoiceNumber: "INV-1001",
      title: "cPanel Business Pro - Initial Setup (1 Month)",
      amount: 12.99,
      status: "PAID",
      dueDate: new Date(),
      paidAt: new Date(),
      paymentMethod: "Credit Card (Stripe)",
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-1002" },
    update: {},
    create: {
      userId: client.id,
      hostingAccountId: hostingService.id,
      invoiceNumber: "INV-1002",
      title: "cPanel Business Pro - Renewal (Next Month)",
      amount: 12.99,
      status: "UNPAID",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Invoices created: INV-1001 (PAID) and INV-1002 (UNPAID)");

  // 6. Support Ticket
  const ticket = await prisma.ticket.upsert({
    where: { ticketNumber: "TICK-7821" },
    update: {},
    create: {
      userId: client.id,
      ticketNumber: "TICK-7821",
      subject: "Help configuring AutoSSL for my domain",
      department: "Technical Support",
      priority: "MEDIUM",
      status: "ANSWERED",
    },
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket.id,
        senderId: client.id,
        senderName: client.name,
        senderRole: "CLIENT",
        message: "Hello, I recently pointed my nameservers to ns1.hostingcloud.net. How do I enable Free SSL in my cPanel?",
      },
      {
        ticketId: ticket.id,
        senderId: admin.id,
        senderName: "Support Team (Admin)",
        senderRole: "ADMIN",
        message: "Hi Alex! AutoSSL runs automatically within 1 hour after DNS propagation. You can also trigger it manually inside your cPanel under SSL/TLS Status > Run AutoSSL.",
      },
    ],
  });

  console.log("✅ Demo Ticket and replies created.");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
