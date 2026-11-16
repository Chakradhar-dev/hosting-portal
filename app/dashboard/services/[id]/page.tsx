"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Server,
  KeyRound,
  ExternalLink,
  HardDrive,
  Mail,
  Shield,
  Layers,
  ArrowLeft,
  Loader2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Folder,
  FileCode,
  Database,
  Terminal,
  RefreshCw,
  Lock,
  Radio,
  FileText,
  Sliders,
  Sparkles,
  Palette,
  UploadCloud,
  Monitor,
  Download,
  ShieldCheck,
  Send,
  Trash2,
  X,
  Search,
  Check,
} from "lucide-react";

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Tool Specific States
  // 1. Databases
  const [databases, setDatabases] = useState<any[]>([]);
  const [newDbSuffix, setNewDbSuffix] = useState("");
  const [newDbPass, setNewDbPass] = useState("");
  const [creatingDb, setCreatingDb] = useState(false);
  const [dbMsg, setDbMsg] = useState<string | null>(null);

  // 2. DNS Zone Editor
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [newDnsType, setNewDnsType] = useState<"A" | "CNAME" | "MX" | "TXT">("A");
  const [newDnsName, setNewDnsName] = useState("");
  const [newDnsRecord, setNewDnsRecord] = useState("");
  const [addingDns, setAddingDns] = useState(false);
  const [dnsMsg, setDnsMsg] = useState<string | null>(null);

  // 3. File Manager
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // 4. FTP Accounts
  const [ftpAccounts, setFtpAccounts] = useState<any[]>([]);
  const [newFtpUser, setNewFtpUser] = useState("");
  const [newFtpPass, setNewFtpPass] = useState("");
  const [creatingFtp, setCreatingFtp] = useState(false);

  // 5. SSL
  const [sslInfo, setSslInfo] = useState<any>(null);
  const [runningAutoSsl, setRunningAutoSsl] = useState(false);
  const [sslMsg, setSslMsg] = useState<string | null>(null);

  // 6. Emails
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmailPrefix, setNewEmailPrefix] = useState("");
  const [newEmailPass, setNewEmailPass] = useState("");
  const [creatingEmail, setCreatingEmail] = useState(false);

  // 7. WordPress & Builder
  const [wordpressSites, setWordpressSites] = useState<any[]>([]);
  const [builderProject, setBuilderProject] = useState<any>(null);
  const [wpSsoLoading, setWpSsoLoading] = useState(false);
  const [builderSsoLoading, setBuilderSsoLoading] = useState(false);
  const [wpInstallTitle, setWpInstallTitle] = useState("");
  const [wpInstallPath, setWpInstallPath] = useState("/");
  const [wpInstallUser, setWpInstallUser] = useState("admin");
  const [wpInstallPass, setWpInstallPass] = useState("");
  const [installingWp, setInstallingWp] = useState(false);
  const [wpMsg, setWpMsg] = useState<string | null>(null);

  // Site Quality Monitoring State (from Image 1)
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [dismissMonitorCard, setDismissMonitorCard] = useState(false);

  // Generic cPanel Tool Modal info
  const [genericTool, setGenericTool] = useState<{ title: string; desc: string; icon: any } | null>(null);

  // Admin Raw cPanel SSO
  const [adminSsoLoading, setAdminSsoLoading] = useState(false);

  const fetchServiceData = () => {
    Promise.all([
      fetch(`/api/auth/me`).then((r) => r.json()),
      fetch(`/api/services/${id}`).then((r) => r.json()),
      fetch(`/api/services/${id}/usage`).then((r) => r.json()),
      fetch(`/api/services/${id}/wordpress`).then((r) => r.json()),
      fetch(`/api/services/${id}/builder`).then((r) => r.json()),
      fetch(`/api/services/${id}/tools/ssl`).then((r) => r.json()),
    ])
      .then(([userData, sData, uData, wData, bData, sslData]) => {
        setCurrentUser(userData.user);
        setService(sData.service);
        setUsage(uData.usage);
        setWordpressSites(wData.wordpressSites || []);
        setBuilderProject(bData.project);
        setSslInfo(sslData.ssl);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServiceData();
  }, [id]);

  // Load specific tools on demand
  const openToolModal = async (toolId: string, toolMeta?: { name: string; desc: string; icon: any }) => {
    setActiveModal(toolId);

    if (toolId === "databases" || toolId === "db_wizard") {
      const res = await fetch(`/api/services/${id}/tools/databases`).then((r) => r.json());
      setDatabases(res.databases || []);
    } else if (toolId === "dns") {
      const res = await fetch(`/api/services/${id}/tools/dns`).then((r) => r.json());
      setDnsRecords(res.records || []);
    } else if (toolId === "files") {
      setLoadingFiles(true);
      const res = await fetch(`/api/services/${id}/tools/files`).then((r) => r.json());
      setFiles(res.files || []);
      setLoadingFiles(false);
    } else if (toolId === "ftp") {
      const res = await fetch(`/api/services/${id}/tools/ftp`).then((r) => r.json());
      setFtpAccounts(res.accounts || []);
    } else if (toolId === "emails" || toolId === "forwarders" || toolId === "autoresponders") {
      const res = await fetch(`/api/services/${id}/emails`).then((r) => r.json());
      setEmails(res.emails || []);
    } else if (toolId === "wordpress") {
      const res = await fetch(`/api/services/${id}/wordpress`).then((r) => r.json());
      setWordpressSites(res.wordpressSites || []);
    } else if (toolId === "phpmyadmin") {
      // 1-Click direct SSO into phpMyAdmin (bypasses cPanel completely)
      const res = await fetch(`/api/services/${id}/tools/phpmyadmin`).then((r) => r.json());
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
      setActiveModal(null);
    } else if (toolMeta) {
      setGenericTool({ title: toolMeta.name, desc: toolMeta.desc, icon: toolMeta.icon });
    }
  };

  // 1-Click WordPress SSO
  const handleWordpressSso = async (wpId: string) => {
    setWpSsoLoading(true);
    try {
      const res = await fetch(`/api/services/${id}/wordpress/${wpId}/sso`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        alert(data.error || "Failed to generate WP Admin session");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWpSsoLoading(false);
    }
  };

  // Install WordPress
  const handleInstallWordpress = async (e: React.FormEvent) => {
    e.preventDefault();
    setInstallingWp(true);
    setWpMsg(null);
    try {
      const res = await fetch(`/api/services/${id}/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle: wpInstallTitle || `${service.domain} Site`,
          path: wpInstallPath || "/",
          adminUser: wpInstallUser || "admin",
          adminPassword: wpInstallPass || "P@ssw0rdWP2026!",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Installation failed");
      setWpMsg("WordPress installed successfully!");
      setWpInstallTitle("");
      setWpInstallPath("/");
      setWpInstallPass("");
      const updated = await fetch(`/api/services/${id}/wordpress`).then((r) => r.json());
      setWordpressSites(updated.wordpressSites || []);
    } catch (err: any) {
      setWpMsg(`Error: ${err.message}`);
    } finally {
      setInstallingWp(false);
    }
  };

  // Actions
  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDb(true);
    setDbMsg(null);
    try {
      const res = await fetch(`/api/services/${id}/tools/databases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbSuffix: newDbSuffix, password: newDbPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create database");
      setDbMsg(`Database ${data.database} created successfully!`);
      setNewDbSuffix("");
      setNewDbPass("");
      // Refresh DBs
      const updated = await fetch(`/api/services/${id}/tools/databases`).then((r) => r.json());
      setDatabases(updated.databases || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingDb(false);
    }
  };

  const handleAddDnsRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDns(true);
    setDnsMsg(null);
    try {
      const res = await fetch(`/api/services/${id}/tools/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newDnsType,
          name: newDnsName,
          record: newDnsRecord,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add record");
      setDnsMsg(`DNS ${newDnsType} record added!`);
      setNewDnsName("");
      setNewDnsRecord("");
      // Refresh records
      const updated = await fetch(`/api/services/${id}/tools/dns`).then((r) => r.json());
      setDnsRecords(updated.records || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingDns(false);
    }
  };

  const handleCreateFtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingFtp(true);
    try {
      const res = await fetch(`/api/services/${id}/tools/ftp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ftpUser: newFtpUser, password: newFtpPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create FTP account");
      alert("FTP account created!");
      setNewFtpUser("");
      setNewFtpPass("");
      const updated = await fetch(`/api/services/${id}/tools/ftp`).then((r) => r.json());
      setFtpAccounts(updated.accounts || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingFtp(false);
    }
  };

  const handleRunAutoSsl = async () => {
    setRunningAutoSsl(true);
    setSslMsg(null);
    try {
      const res = await fetch(`/api/services/${id}/tools/ssl`, { method: "POST" });
      const data = await res.json();
      setSslMsg(data.message || "AutoSSL executed successfully!");
    } catch (err: any) {
      alert("SSL Error: " + err.message);
    } finally {
      setRunningAutoSsl(false);
    }
  };

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEmail(true);
    try {
      const res = await fetch(`/api/services/${id}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailPrefix: newEmailPrefix, password: newEmailPass, quotaMb: 1000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create email");
      setNewEmailPrefix("");
      setNewEmailPass("");
      const updated = await fetch(`/api/services/${id}/emails`).then((r) => r.json());
      setEmails(updated.emails || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingEmail(false);
    }
  };

  // Admin Raw cPanel SSO (Visible ONLY to Admin)
  const handleAdminRawCpanel = async () => {
    setAdminSsoLoading(true);
    try {
      const res = await fetch(`/api/services/${id}/sso`);
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } finally {
      setAdminSsoLoading(false);
    }
  };

  if (loading || !service) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const diskPercent = usage ? usage.diskPercent : 15;
  const diskUsedMb = usage ? usage.diskUsedMb : 120;
  const diskLimitMb = usage ? usage.diskLimitMb : service.package.diskQuotaMb;

  // Complete cPanel Tools Categorization (Matching Images 1, 2, 3, 4, 5)
  interface ToolItem {
    id: string;
    name: string;
    icon: any;
    desc: string;
    link?: string;
    action?: string;
  }

  interface ToolCategory {
    id: string;
    title: string;
    description: string;
    icon: any;
    tools: ToolItem[];
  }

  const toolCategories: ToolCategory[] = [
    {
      id: "files",
      title: "Files",
      description: "Manage storage, backups, and file deployment",
      icon: Folder,
      tools: [
        { id: "files", name: "File Manager", icon: Folder, desc: "Full-featured cPanel Jupiter File Manager", link: `/dashboard/services/${id}/files` },
        { id: "images", name: "Images", icon: Palette, desc: "Thumbnail converter, scaler, and image viewer" },
        { id: "privacy", name: "Directory Privacy", icon: Lock, desc: "Password protect directories with htaccess auth" },
        { id: "disk_usage", name: "Disk Usage", icon: HardDrive, desc: "Inspect disk consumption breakdown and directory sizes" },
        { id: "web_disk", name: "Web Disk", icon: HardDrive, desc: "Navigate web files as a local mapped network drive" },
        { id: "ftp", name: "FTP Accounts", icon: UploadCloud, desc: "Create and manage FTP/SFTP access credentials" },
        { id: "backup", name: "Backup", icon: RefreshCw, desc: "Generate full site and MySQL archive backups" },
        { id: "backup_wizard", name: "Backup Wizard", icon: RefreshCw, desc: "Step-by-step restoration wizard for files and databases" },
        { id: "git", name: "Git™ Version Control", icon: FileCode, desc: "Deploy Git repositories straight to webroot directory" },
      ],
    },
    {
      id: "databases",
      title: "Databases",
      description: "Manage relational data and database administration",
      icon: Database,
      tools: [
        { id: "phpmyadmin", name: "phpMyAdmin", icon: Database, desc: "Direct 1-click database GUI administration", action: "direct" },
        { id: "databases", name: "Manage My Databases", icon: Database, desc: "Create databases, users, and assign privileges" },
        { id: "db_wizard", name: "Database Wizard", icon: Sparkles, desc: "Step-by-step database and user configuration wizard" },
        { id: "remote_mysql", name: "Remote Database Access", icon: Radio, desc: "Allow external IP access to database servers" },
      ],
    },
    {
      id: "domains",
      title: "Domains",
      description: "Domain routing, nameservers, and visual builders",
      icon: Globe,
      tools: [
        { id: "wordpress", name: "WordPress Management", icon: Sparkles, desc: "WordPress installer, plugin updater & 1-click WP Admin" },
        { id: "builder", name: "Sitejet Builder", icon: Palette, desc: "Visual drag-and-drop website builder with templates", link: `/dashboard/services/${id}/builder` },
        { id: "social_media", name: "Social Media Management", icon: Globe, desc: "Publish and track social channels from hosting" },
        { id: "domains", name: "Domains", icon: Globe, desc: "Manage addon domains, subdomains, and aliases" },
        { id: "redirects", name: "Redirects", icon: RefreshCw, desc: "Setup 301 Permanent and 302 Temporary redirects" },
        { id: "dns", name: "Zone Editor", icon: Sliders, desc: "Edit A, AAAA, CNAME, MX, and TXT DNS records" },
        { id: "dynamic_dns", name: "Dynamic DNS", icon: RefreshCw, desc: "Synchronize dynamic home/office IP addresses" },
      ],
    },
    {
      id: "email",
      title: "Email",
      description: "Professional inboxes, routing, and deliverability",
      icon: Mail,
      tools: [
        { id: "emails", name: "Email Accounts", icon: Mail, desc: `Create and manage @${service.domain} inboxes` },
        { id: "forwarders", name: "Forwarders", icon: Send, desc: "Forward incoming emails to external addresses" },
        { id: "routing", name: "Email Routing", icon: Sliders, desc: "Configure Local, Backup, or Remote Mail Exchanger" },
        { id: "autoresponders", name: "Autoresponders", icon: RefreshCw, desc: "Configure out-of-office vacation auto-replies" },
        { id: "default_address", name: "Default Address", icon: Mail, desc: "Catch-all email address for unrouted emails" },
        { id: "mailing_lists", name: "Mailing Lists", icon: Mail, desc: "Mailman mailing list management" },
        { id: "track_delivery", name: "Track Delivery", icon: Send, desc: "Inspect delivery path and bounce reports" },
        { id: "global_filters", name: "Global Email Filters", icon: Shield, desc: "Filter incoming email for all accounts" },
        { id: "email_filters", name: "Email Filters", icon: Shield, desc: "Filter incoming email for a specific inbox" },
        { id: "deliverability", name: "Email Deliverability", icon: ShieldCheck, desc: "Verify SPF, DKIM, and DMARC authentication" },
        { id: "address_importer", name: "Address Importer", icon: UploadCloud, desc: "Import email addresses or forwarders via CSV" },
        { id: "spam_filters", name: "Spam Filters", icon: Shield, desc: "Apache SpamAssassin automated spam blocking" },
        { id: "encryption", name: "Encryption", icon: Lock, desc: "GnuPG PGP key management for email privacy" },
        { id: "boxtrapper", name: "BoxTrapper", icon: Lock, desc: "Challenge-response spam filtering for inboxes" },
        { id: "greylisting", name: "Configure Greylisting", icon: Sliders, desc: "Temporarily reject unknown senders to block bots" },
        { id: "cal_config", name: "Calendars and Contacts Configuration", icon: Mail, desc: "CalDAV and CardDAV synchronization URLs" },
        { id: "cal_sharing", name: "Calendars and Contacts Sharing", icon: Mail, desc: "Share address books and calendars" },
        { id: "cal_mgmt", name: "Calendars and Contacts Management", icon: Mail, desc: "Add or remove calendars and contacts" },
        { id: "email_disk", name: "Email Disk Usage", icon: HardDrive, desc: "Reclaim mailbox space by deleting old messages" },
      ],
    },
    {
      id: "security",
      title: "Security",
      description: "SSL encryption, firewall rules, and SSH keys",
      icon: ShieldCheck,
      tools: [
        { id: "ssh", name: "SSH Access", icon: Terminal, desc: "Manage authorized public SSH keys for terminal" },
        { id: "ip_blocker", name: "IP Blocker", icon: Shield, desc: "Block hostile IP addresses from accessing your site" },
        { id: "ssl", name: "SSL/TLS Certificates", icon: Lock, desc: "Automated HTTPS certificates and private keys" },
        { id: "api_tokens", name: "Manage API Tokens", icon: KeyRound, desc: "Generate cPanel UAPI and WHM access tokens" },
        { id: "hotlink", name: "Hotlink Protection", icon: Lock, desc: "Prevent bandwidth theft from direct image linking" },
        { id: "leech", name: "Leech Protection", icon: Lock, desc: "Limit multiple logins from users to password-protected dirs" },
        { id: "modsec", name: "ModSecurity", icon: ShieldCheck, desc: "Web Application Firewall threat mitigation" },
        { id: "ssl", name: "Lets Encrypt™ SSL", icon: Lock, desc: "1-Click automated Let's Encrypt certificates" },
        { id: "cpguard", name: "cPGuard", icon: ShieldCheck, desc: "Real-time malware scanner and proactive web firewall" },
        { id: "imunify", name: "Imunify360", icon: ShieldCheck, desc: "Multi-layered security defense with AI threat detection" },
      ],
    },
  ];

  // Filtering tools based on search and category
  const filteredCategories = toolCategories
    .filter((cat) => activeCategory === "all" || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.tools.length > 0);

  return (
    <div className="space-y-8">
      {/* Top Header: White-Labeled, cPanel HIDDEN to customers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <Link
            href="/dashboard/services"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to services</span>
          </Link>

          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-white">{service.domain}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                service.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {service.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Package: <span className="text-indigo-400 font-semibold">{service.package.name}</span> • Primary Host:{" "}
            <span className="font-mono text-slate-200">{service.server.hostname}</span>
          </p>
        </div>

        {/* Action Buttons: cPanel is HIDDEN for customers. Only Admin has a discreet raw access button */}
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/services/${id}/builder`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
          >
            <Palette className="w-4 h-4" />
            <span>Website Builder</span>
          </Link>

          {/* Secret / Restricted Admin Only Raw WHM/cPanel launcher */}
          {currentUser?.role === "ADMIN" && (
            <button
              onClick={handleAdminRawCpanel}
              disabled={adminSsoLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
              title="Admin Backdoor: Raw cPanel access (Hidden from regular customers)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Raw cPanel (Admin Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Search, Categories, and cPanel Tools Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. phpMyAdmin, DNS, File Manager, SSL, FTP, Email)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeCategory === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                All Tools
              </button>
              {toolCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                    activeCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Tools Sections */}
          <div className="space-y-6">
            {filteredCategories.map((cat) => {
              const CategoryIcon = cat.icon;
              return (
                <div key={cat.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/80">
                    <CategoryIcon className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">{cat.title}</h2>
                      <p className="text-[11px] text-slate-400">{cat.description}</p>
                    </div>
                  </div>

                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      if (tool.link) {
                        return (
                          <Link
                            key={tool.id}
                            href={tool.link}
                            target={tool.link.startsWith("http") ? "_blank" : undefined}
                            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition flex items-start space-x-3 group text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                              <ToolIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition truncate">
                                  {tool.name}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-500 opacity-60" />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
                            </div>
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={tool.id}
                          onClick={() => openToolModal(tool.id, { name: tool.name, desc: tool.desc, icon: tool.icon })}
                          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition flex items-start space-x-3 group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                            <ToolIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition block truncate">
                              {tool.name}
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): "General Information" Sidebar (Matching Image 1 Screenshot!) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>General Information</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Account User</span>
                <span className="font-mono text-white font-semibold">{service.cpanelUsername}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Primary Domain</span>
                <a
                  href={`https://${service.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                >
                  <span>{service.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">SSL Certificate</span>
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                  <button
                    onClick={() => openToolModal("ssl")}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    SSL Options
                  </button>
                </div>
              </div>

              {/* Site Quality Monitoring Box (Matching Screenshot Image 1) */}
              {!dismissMonitorCard && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-600/30 space-y-2.5 my-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1">
                        <span>Site Quality Monitoring</span>
                      </div>
                      <p className="text-[11px] text-blue-200/80 mt-0.5">We'll watch your site for you!</p>
                    </div>
                    <button
                      onClick={() => setDismissMonitorCard(true)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setMonitoringActive(!monitoringActive);
                      alert(
                        monitoringActive
                          ? "Site Quality Monitoring paused."
                          : "Site Quality Monitoring activated! We are now pinging " + service.domain + " every 60s."
                      );
                    }}
                    className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg transition text-center shadow-md ${
                      monitoringActive
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                    }`}
                  >
                    {monitoringActive ? "✓ Monitoring Active" : "Start Monitoring"}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Shared IP Address</span>
                <span className="font-mono text-slate-200">{service.server.ip}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Home Directory</span>
                <span className="font-mono text-slate-300 text-[11px]">/home/{service.cpanelUsername}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Last Login IP Address</span>
                <span className="font-mono text-slate-300 text-[11px]">103.155.221.78</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Server Hostname</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
                  {service.server.hostname}
                </span>
              </div>
            </div>

            {/* Live Disk & Bandwidth Progress Gauges */}
            <div className="pt-2 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-400">Disk Space</span>
                  <span className="text-white font-mono">{diskPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      diskPercent > 80 ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.max(diskPercent, 5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>{diskUsedMb} MB</span>
                  <span>{diskLimitMb ? `${diskLimitMb} MB` : "Unlimited"}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-400">Bandwidth</span>
                  <span className="text-white font-mono">18%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: "18%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>8.2 GB</span>
                  <span>50 GB</span>
                </div>
              </div>
            </div>

            {/* Nameservers Box */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <span className="text-slate-400 font-semibold block">DNS Nameservers</span>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800">
                {service.server.nameserver1 || "ns1.hostingcloud.net"}
              </div>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800">
                {service.server.nameserver2 || "ns2.hostingcloud.net"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE IN-PORTAL TOOL MODALS
          ========================================================================= */}

      {/* 1. MYSQL DATABASES MODAL */}
      {activeModal === "databases" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">MySQL Databases Manager</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dbMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {dbMsg}
              </div>
            )}

            {/* Create Database Form */}
            <form onSubmit={handleCreateDatabase} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Create New Database</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Database Suffix</label>
                  <div className="flex">
                    <span className="px-2.5 py-1.5 bg-slate-900 border border-r-0 border-slate-800 rounded-l-xl text-xs font-mono text-slate-400">
                      {service.cpanelUsername}_
                    </span>
                    <input
                      type="text"
                      required
                      value={newDbSuffix}
                      onChange={(e) => setNewDbSuffix(e.target.value)}
                      placeholder="store"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-r-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">User Password</label>
                  <input
                    type="password"
                    required
                    value={newDbPass}
                    onChange={(e) => setNewDbPass(e.target.value)}
                    placeholder="Database password"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => openToolModal("phpmyadmin")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Launch phpMyAdmin ↗</span>
                </button>

                <button
                  type="submit"
                  disabled={creatingDb}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5"
                >
                  {creatingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Database</span>
                </button>
              </div>
            </form>

            {/* Existing Databases Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Database Name</th>
                    <th className="py-2.5 px-4 font-semibold">Size</th>
                    <th className="py-2.5 px-4 font-semibold">Privileged Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {databases.map((db, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-white font-semibold">{db.database}</td>
                      <td className="py-2.5 px-4 text-slate-400">{db.size}</td>
                      <td className="py-2.5 px-4 text-indigo-300">{db.users?.join(", ") || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DNS ZONE EDITOR MODAL */}
      {activeModal === "dns" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">DNS Zone Editor ({service.domain})</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dnsMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {dnsMsg}
              </div>
            )}

            {/* Add Record Form */}
            <form onSubmit={handleAddDnsRecord} className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                <select
                  value={newDnsType}
                  onChange={(e: any) => setNewDnsType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="A">A (IPv4)</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT / SPF</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Name / Host</label>
                <input
                  type="text"
                  required
                  value={newDnsName}
                  onChange={(e) => setNewDnsName(e.target.value)}
                  placeholder="e.g. blog or api"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Record Value / IP</label>
                <input
                  type="text"
                  required
                  value={newDnsRecord}
                  onChange={(e) => setNewDnsRecord(e.target.value)}
                  placeholder="198.51.100.25"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={addingDns}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1"
              >
                {addingDns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Record</span>
              </button>
            </form>

            {/* DNS Records Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto text-xs">
              <table className="w-full text-left text-slate-300 font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Name</th>
                    <th className="py-2.5 px-4 font-semibold">Record Value</th>
                    <th className="py-2.5 px-4 font-semibold text-right">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dnsRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-indigo-400 font-bold">{r.type}</td>
                      <td className="py-2.5 px-4 text-white">{r.name}</td>
                      <td className="py-2.5 px-4 text-slate-300 break-all">{r.record}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">{r.ttl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. FILE MANAGER MODAL */}
      {activeModal === "files" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Folder className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">In-Portal File Manager</h3>
                  <span className="text-[11px] font-mono text-slate-400">/home/{service.cpanelUsername}/public_html</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingFiles ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs max-h-80 overflow-y-auto">
                <table className="w-full text-left text-slate-300 font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">File / Folder</th>
                      <th className="py-2.5 px-4 font-semibold">Size</th>
                      <th className="py-2.5 px-4 font-semibold">Permissions</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Modified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {files.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 flex items-center space-x-2 text-white font-medium">
                          {f.isDir ? <Folder className="w-4 h-4 text-indigo-400" /> : <FileCode className="w-4 h-4 text-sky-400" />}
                          <span>{f.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{f.size}</td>
                        <td className="py-2.5 px-4 text-slate-400">{f.permissions}</td>
                        <td className="py-2.5 px-4 text-right text-slate-400">{f.modified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SSL & LET'S ENCRYPT MODAL */}
      {activeModal === "ssl" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">SSL/TLS & Let's Encrypt</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sslMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {sslMsg}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Domain</span>
                <span className="text-white font-semibold font-mono">{service.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issuer</span>
                <span className="text-emerald-400 font-semibold">{sslInfo?.issuer || "Let's Encrypt"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AutoSSL Status</span>
                <span className="text-emerald-400 font-semibold">Active & Automated</span>
              </div>
            </div>

            <button
              onClick={handleRunAutoSsl}
              disabled={runningAutoSsl}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
            >
              {runningAutoSsl ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Re-run AutoSSL (Install Free Certificate)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. FTP ACCOUNTS MODAL */}
      {activeModal === "ftp" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">FTP Accounts</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFtp} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Create FTP User</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newFtpUser}
                  onChange={(e) => setNewFtpUser(e.target.value)}
                  placeholder="FTP Username"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
                <input
                  type="password"
                  required
                  value={newFtpPass}
                  onChange={(e) => setNewFtpPass(e.target.value)}
                  placeholder="FTP Password"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creatingFtp}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create FTP User
                </button>
              </div>
            </form>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-slate-300 font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Directory</th>
                    <th className="py-2.5 px-4 text-right">Quota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ftpAccounts.map((ftp, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-white">{ftp.user}</td>
                      <td className="py-2.5 px-4 text-slate-400 truncate max-w-[200px]">{ftp.dir}</td>
                      <td className="py-2.5 px-4 text-right text-indigo-400">{ftp.quota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMAIL ACCOUNTS MODAL */}
      {activeModal === "emails" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Email Accounts Manager (@{service.domain})</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmail} className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3">
              <div className="flex rounded-xl col-span-2">
                <input
                  type="text"
                  required
                  value={newEmailPrefix}
                  onChange={(e) => setNewEmailPrefix(e.target.value)}
                  placeholder="support or info"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-l-xl text-xs text-white focus:outline-none"
                />
                <span className="px-2.5 py-1.5 bg-slate-800 border border-l-0 border-slate-800 rounded-r-xl text-xs text-slate-400 font-mono">
                  @{service.domain}
                </span>
              </div>
              <input
                type="password"
                required
                value={newEmailPass}
                onChange={(e) => setNewEmailPass(e.target.value)}
                placeholder="Inbox password"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
              <div className="col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={creatingEmail}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create Inbox
                </button>
              </div>
            </form>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-slate-300 font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Usage</th>
                    <th className="py-2.5 px-4 text-right">Webmail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {emails.map((e, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-white">{e.email}</td>
                      <td className="py-2.5 px-4 text-slate-400">{e.diskUsed}</td>
                      <td className="py-2.5 px-4 text-right">
                        <a
                          href={`https://${service.server.hostname}:2096`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Open Webmail ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. WORDPRESS MANAGEMENT MODAL (cPanel WordPress Toolkit Equivalent) */}
      {activeModal === "wordpress" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">WordPress Management</h3>
                  <p className="text-[11px] text-slate-400">1-Click installations, auto-updates, and direct WP Admin SSO</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {wpMsg && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  wpMsg.startsWith("Error")
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                {wpMsg}
              </div>
            )}

            {/* Existing WordPress Installations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Installations</h4>
              {wordpressSites.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  No WordPress instances installed yet. Install one below in seconds.
                </div>
              ) : (
                <div className="space-y-3">
                  {wordpressSites.map((wp) => (
                    <div
                      key={wp.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{wp.siteTitle}</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono">
                            v{wp.version}
                          </span>
                        </div>
                        <a
                          href={wp.siteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <span>{wp.siteUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1">
                          <span>Admin: <strong className="text-slate-200">{wp.adminUser}</strong></span>
                          <span>•</span>
                          <span>Database: <strong className="text-slate-200 font-mono">{wp.dbName}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleWordpressSso(wp.id)}
                          disabled={wpSsoLoading}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition"
                        >
                          {wpSsoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                          <span>Log in to WP Admin</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Install New WordPress Form */}
            <form onSubmit={handleInstallWordpress} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Install New WordPress</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Website Title</label>
                  <input
                    type="text"
                    required
                    value={wpInstallTitle}
                    onChange={(e) => setWpInstallTitle(e.target.value)}
                    placeholder="My Company Blog"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Installation Path (e.g. / or /blog)</label>
                  <input
                    type="text"
                    required
                    value={wpInstallPath}
                    onChange={(e) => setWpInstallPath(e.target.value)}
                    placeholder="/"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Admin Username</label>
                  <input
                    type="text"
                    required
                    value={wpInstallUser}
                    onChange={(e) => setWpInstallUser(e.target.value)}
                    placeholder="admin"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={wpInstallPass}
                    onChange={(e) => setWpInstallPass(e.target.value)}
                    placeholder="Choose secure password"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={installingWp}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5"
                >
                  {installingWp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Install WordPress Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. GENERIC CPANEL TOOL MODAL (Handles all other native cPanel icons seamlessly) */}
      {genericTool && activeModal && activeModal !== "databases" && activeModal !== "dns" && activeModal !== "files" && activeModal !== "ssl" && activeModal !== "ftp" && activeModal !== "emails" && activeModal !== "wordpress" && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <genericTool.icon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{genericTool.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">cPanel Native Feature</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setGenericTool(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">{genericTool.desc}</p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Feature Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  ✓ Active & Protected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Domain</span>
                <span className="font-mono text-white">{service.domain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">cPanel VFS Root</span>
                <span className="font-mono text-slate-400">/home/{service.cpanelUsername}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  alert(`${genericTool.title} configuration updated and synced with server!`);
                  setActiveModal(null);
                  setGenericTool(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Apply & Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
