import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { builderProjects: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let project = service.builderProjects[0];

    // If no project exists yet, generate initial template project
    if (!project) {
      const initialConfig = JSON.stringify({
        businessName: service.domain.replace(/\.[^/.]+$/, "").toUpperCase(),
        tagline: "Innovative digital solutions crafted for modern business",
        heroHeading: "Empowering Modern Businesses to Scale Faster",
        heroSubheading: "We deliver exceptional web experiences, cloud scalability, and digital products tailored to your audience.",
        primaryCtaText: "Get Started Now",
        secondaryCtaText: "Explore Services",
        themeColor: "#4f46e5",
        features: [
          { title: "Fast Performance", description: "Ultra-fast load times optimized for desktop and mobile devices." },
          { title: "Secure & Reliable", description: "Free SSL certificates, DDoS protection, and automated cloud backups." },
          { title: "24/7 Dedicated Support", description: "Round-the-clock technical assistance from our expert team." },
        ],
        contactEmail: `contact@${service.domain}`,
        contactPhone: "+1 (555) 019-2831",
      });

      project = await prisma.websiteBuilderProject.create({
        data: {
          hostingAccountId: service.id,
          siteTitle: `${service.domain} Official Website`,
          template: "agency",
          status: "DRAFT",
          publishedUrl: `https://${service.domain}`,
          config: initialConfig,
        },
      });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { siteTitle, template, config } = body;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { builderProjects: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let project = service.builderProjects[0];

    if (project) {
      project = await prisma.websiteBuilderProject.update({
        where: { id: project.id },
        data: {
          siteTitle: siteTitle || project.siteTitle,
          template: template || project.template,
          config: typeof config === "string" ? config : JSON.stringify(config),
        },
      });
    } else {
      project = await prisma.websiteBuilderProject.create({
        data: {
          hostingAccountId: service.id,
          siteTitle: siteTitle || `${service.domain} Website`,
          template: template || "agency",
          status: "DRAFT",
          publishedUrl: `https://${service.domain}`,
          config: typeof config === "string" ? config : JSON.stringify(config || {}),
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
