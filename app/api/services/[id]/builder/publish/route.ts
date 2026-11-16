import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { WhmClient } from "@/lib/whm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { htmlContent } = body;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: {
        server: true,
        builderProjects: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Hosting account not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (service.status !== "ACTIVE") {
      return NextResponse.json({ error: "Hosting account must be active to publish" }, { status: 400 });
    }

    // Call WHM client to publish to public_html
    const client = new WhmClient(service.server);
    const publishResult = await client.publishWebsiteBuilderHtml(
      service.cpanelUsername,
      service.domain,
      htmlContent || "<!-- Published via CloudHost Website Builder -->"
    );

    // Update status in Database
    const project = service.builderProjects[0];
    let updatedProject = null;

    if (project) {
      updatedProject = await prisma.websiteBuilderProject.update({
        where: { id: project.id },
        data: {
          status: "PUBLISHED",
          publishedUrl: publishResult.url,
          lastPublishedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: publishResult.url,
      message: `Website successfully published live to ${service.domain}!`,
      project: updatedProject,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
