import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  listDirectory,
  getFileContent,
  saveFileContent,
  createFile,
  createFolder,
  renameItem,
  deleteItem,
  updatePermissions,
} from "@/lib/fileManager";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const url = new URL(req.url);
    const targetDir = url.searchParams.get("dir") || "/public_html";

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true },
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const files = listDirectory(service.cpanelUsername, targetDir);

    // Default Directory Tree matching the cPanel Jupiter screenshot
    const directoryTree = [
      { name: ".ssh", path: "/.ssh", hasChildren: false },
      { name: ".subaccounts", path: "/.subaccounts", hasChildren: false },
      { name: ".trash", path: "/.trash", hasChildren: false },
      { name: ".wp-toolkit", path: "/.wp-toolkit", hasChildren: false },
      { name: "bin", path: "/bin", hasChildren: false },
      { name: "cpanel3-skel", path: "/cpanel3-skel", hasChildren: false },
      { name: "etc", path: "/etc", hasChildren: false },
      { name: "logs", path: "/logs", hasChildren: false },
      { name: "mail", path: "/mail", hasChildren: false },
      { name: "public_ftp", path: "/public_ftp", hasChildren: false },
      {
        name: "public_html",
        path: "/public_html",
        hasChildren: true,
        children: [
          { name: ".well-known", path: "/public_html/.well-known" },
          { name: "admin", path: "/public_html/admin" },
          { name: "assets", path: "/public_html/assets" },
          { name: "attachments", path: "/public_html/attachments" },
          { name: "cgi-bin", path: "/public_html/cgi-bin" },
          { name: "console", path: "/public_html/console" },
          { name: "crons", path: "/public_html/crons" },
          { name: "demo", path: "/public_html/demo" },
        ],
      },
    ];

    return NextResponse.json({
      files,
      currentDir: targetDir,
      homeDir: `/home/${service.cpanelUsername}`,
      directoryTree,
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { action, dir = "/public_html", name, oldName, newName, content, permissions } = body;

    const service = await prisma.hostingAccount.findUnique({
      where: { id },
      include: { server: true },
    });

    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    if (user.role !== "ADMIN" && service.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const username = service.cpanelUsername;

    if (action === "read") {
      const fileContent = getFileContent(username, dir, name);
      return NextResponse.json({ content: fileContent });
    }

    if (action === "save") {
      const saved = saveFileContent(username, dir, name, content || "");
      return NextResponse.json({ success: saved });
    }

    if (action === "create_file") {
      const newFile = createFile(username, dir, name, content || "");
      return NextResponse.json({ success: true, file: newFile });
    }

    if (action === "create_folder") {
      const newFolder = createFolder(username, dir, name);
      return NextResponse.json({ success: true, folder: newFolder });
    }

    if (action === "rename") {
      const renamed = renameItem(username, dir, oldName, newName);
      return NextResponse.json({ success: renamed });
    }

    if (action === "delete") {
      const deleted = deleteItem(username, dir, name);
      return NextResponse.json({ success: deleted });
    }

    if (action === "permissions") {
      const updated = updatePermissions(username, dir, name, permissions);
      return NextResponse.json({ success: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
