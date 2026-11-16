/**
 * cPanel File Manager Mock & Virtual File System Engine
 * Mirrors the exact file hierarchy, permissions, and directory structure shown in cPanel Jupiter.
 */

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: string;
  isDir: boolean;
  modified: string;
  type: string;
  permissions: string;
  content?: string;
}

export interface DirectoryNode {
  name: string;
  path: string;
  children?: DirectoryNode[];
}

// In-memory persistent VFS store per service
const serviceVfs: Record<string, FileItem[]> = {};

function getDefaultFiles(username: string): FileItem[] {
  return [
    // public_html folders (matching cPanel screenshot exactly)
    { id: "1", name: "mydashboard", path: "/public_html", size: "4 KB", isDir: true, modified: "Nov 11, 2026, 5:02 AM", type: "httpd/unix-directory", permissions: "0750" },
    { id: "2", name: "oauth", path: "/public_html", size: "4 KB", isDir: true, modified: "Apr 24, 2024, 3:37 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "3", name: "old-whmcs", path: "/public_html", size: "4 KB", isDir: true, modified: "Today, 5:28 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "4", name: "resources", path: "/public_html", size: "4 KB", isDir: true, modified: "Apr 24, 2024, 3:37 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "5", name: "status", path: "/public_html", size: "4 KB", isDir: true, modified: "Apr 24, 2024, 3:37 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "6", name: "tawk_to", path: "/public_html", size: "4 KB", isDir: true, modified: "Oct 7, 2020, 11:55 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "7", name: "templates", path: "/public_html", size: "4 KB", isDir: true, modified: "Aug 15, 2024, 7:11 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "8", name: "templates_c", path: "/public_html", size: "1.33 MB", isDir: true, modified: "Today, 5:32 AM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "9", name: "testwhmcs", path: "/public_html", size: "4 KB", isDir: true, modified: "Nov 24, 2023, 8:12 AM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "10", name: "vendor", path: "/public_html", size: "4 KB", isDir: true, modified: "Today, 1:30 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "11", name: "WHMCS", path: "/public_html", size: "4 KB", isDir: true, modified: "Nov 20, 2024, 7:44 AM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "12", name: "whmcs", path: "/public_html", size: "4 KB", isDir: true, modified: "May 7, 2024, 4:46 PM", type: "httpd/unix-directory", permissions: "0755" },
    { id: "13", name: "wp", path: "/public_html", size: "4 KB", isDir: true, modified: "Nov 12, 2026, 10:22 PM", type: "httpd/unix-directory", permissions: "0755" },
    // files in public_html
    {
      id: "14",
      name: ".htaccess",
      path: "/public_html",
      size: "12.11 KB",
      isDir: false,
      modified: "Nov 11, 2026, 5:02 AM",
      type: "text/x-generic",
      permissions: "0755",
      content: `# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress`,
    },
    {
      id: "15",
      name: ".user.ini",
      path: "/public_html",
      size: "631 bytes",
      isDir: false,
      modified: "Aug 22, 2026, 1:34 PM",
      type: "text/x-generic",
      permissions: "0755",
      content: `; cPanel generated php.ini directives
upload_max_filesize = 128M
post_max_size = 128M
memory_limit = 512M
max_execution_time = 300
max_input_time = 300`,
    },
    {
      id: "16",
      name: "ads.txt",
      path: "/public_html",
      size: "58 bytes",
      isDir: false,
      modified: "Sep 1, 2023, 10:11 PM",
      type: "text/plain",
      permissions: "0755",
      content: `google.com, pub-9182374928172938, DIRECT, f08c47fec0942fa0`,
    },
    {
      id: "17",
      name: "aff.php",
      path: "/public_html",
      size: "1.84 KB",
      isDir: false,
      modified: "Apr 24, 2024, 3:37 PM",
      type: "text/x-generic",
      permissions: "0755",
      content: `<?php
/**
 * Affiliate Redirect Handler
 */
session_start();
$aff = isset($_GET['aff']) ? intval($_GET['aff']) : 0;
setcookie("WHMCSAffiliateID", $aff, time() + (86400 * 90), "/");
header("Location: index.php");
exit();`,
    },
    {
      id: "18",
      name: "affiliates.php",
      path: "/public_html",
      size: "108.66 KB",
      isDir: false,
      modified: "Apr 24, 2024, 3:37 PM",
      type: "text/x-generic",
      permissions: "0755",
      content: `<?php
define("CLIENTAREA", true);
require "init.php";
$ca = new WHMCS_ClientArea();
$ca->setPageTitle("Affiliates Program");
$ca->output();`,
    },
    {
      id: "19",
      name: "index.php",
      path: "/public_html",
      size: "4.20 KB",
      isDir: false,
      modified: "Today, 10:14 AM",
      type: "text/x-generic",
      permissions: "0644",
      content: `<?php
/**
 * Front to the WordPress application.
 */
define( 'WP_USE_THEMES', true );
require __DIR__ . '/wp-blog-header.php';`,
    },
    {
      id: "20",
      name: "wp-config.php",
      path: "/public_html",
      size: "3.80 KB",
      isDir: false,
      modified: "Nov 12, 2026, 10:20 PM",
      type: "text/x-generic",
      permissions: "0640",
      content: `<?php
define( 'DB_NAME', '${username}_wp412' );
define( 'DB_USER', '${username}_u412' );
define( 'DB_PASSWORD', 'SecureDbPass991!' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
$table_prefix = 'wp_';
define( 'WP_DEBUG', false );
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';`,
    },
  ];
}

export function getVfs(username: string): FileItem[] {
  if (!serviceVfs[username]) {
    serviceVfs[username] = getDefaultFiles(username);
  }
  return serviceVfs[username];
}

export function listDirectory(username: string, dirPath: string = "/public_html"): FileItem[] {
  const vfs = getVfs(username);
  const normalized = dirPath.startsWith("/") ? dirPath : `/${dirPath}`;
  return vfs.filter((item) => item.path === normalized);
}

export function getFileContent(username: string, dir: string, fileName: string): string {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const file = vfs.find((item) => item.path === normalized && item.name === fileName && !item.isDir);
  return file?.content || `/* Empty file: ${fileName} */`;
}

export function saveFileContent(username: string, dir: string, fileName: string, content: string): boolean {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const file = vfs.find((item) => item.path === normalized && item.name === fileName);
  if (file) {
    file.content = content;
    file.size = `${(content.length / 1024).toFixed(2)} KB`;
    file.modified = "Today, just now";
    return true;
  }
  return false;
}

export function createFile(username: string, dir: string, fileName: string, content: string = ""): FileItem {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const newItem: FileItem = {
    id: String(Date.now()),
    name: fileName,
    path: normalized,
    size: `${(content.length / 1024).toFixed(2)} KB`,
    isDir: false,
    modified: "Today, just now",
    type: fileName.endsWith(".php") ? "text/x-generic" : fileName.endsWith(".html") ? "text/html" : "text/plain",
    permissions: "0644",
    content: content || "<?php\n\n// New file created via CloudHost File Manager\n",
  };
  vfs.push(newItem);
  return newItem;
}

export function createFolder(username: string, dir: string, folderName: string): FileItem {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const newItem: FileItem = {
    id: String(Date.now()),
    name: folderName,
    path: normalized,
    size: "4 KB",
    isDir: true,
    modified: "Today, just now",
    type: "httpd/unix-directory",
    permissions: "0755",
  };
  vfs.push(newItem);
  return newItem;
}

export function renameItem(username: string, dir: string, oldName: string, newName: string): boolean {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const item = vfs.find((i) => i.path === normalized && i.name === oldName);
  if (item) {
    item.name = newName;
    item.modified = "Today, just now";
    return true;
  }
  return false;
}

export function deleteItem(username: string, dir: string, name: string): boolean {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const idx = vfs.findIndex((i) => i.path === normalized && i.name === name);
  if (idx !== -1) {
    vfs.splice(idx, 1);
    return true;
  }
  return false;
}

export function updatePermissions(username: string, dir: string, name: string, permissions: string): boolean {
  const vfs = getVfs(username);
  const normalized = dir.startsWith("/") ? dir : `/${dir}`;
  const item = vfs.find((i) => i.path === normalized && i.name === name);
  if (item) {
    item.permissions = permissions;
    return true;
  }
  return false;
}
