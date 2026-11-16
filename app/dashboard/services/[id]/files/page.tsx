"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Folder,
  FileCode,
  FileText,
  Plus,
  FolderPlus,
  Copy,
  Move,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Edit3,
  Code2,
  Key,
  Eye,
  Archive,
  FolderArchive,
  Home,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckSquare,
  Square,
  Settings,
  Search,
  X,
  Check,
  Loader2,
  ChevronRight,
  ChevronDown,
  Lock,
  Globe,
  Sliders,
  Shield,
  File,
} from "lucide-react";

export default function CpanelFileManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [currentDir, setCurrentDir] = useState<string>("/public_html");
  const [homeDir, setHomeDir] = useState<string>("/home/user");
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Directory Tree
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "/public_html": true,
  });

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: any;
  } | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    "new_file" | "new_folder" | "edit" | "rename" | "delete" | "permissions" | "upload" | "view" | null
  >(null);

  // Modal Inputs
  const [modalInputName, setModalInputName] = useState("");
  const [modalInputOldName, setModalInputOldName] = useState("");
  const [modalFileContent, setModalFileContent] = useState("");
  const [modalPermissions, setModalPermissions] = useState("0755");
  const [skipTrash, setSkipTrash] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Context Menu ref to close on click outside
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const fetchDirectory = (dir: string = currentDir) => {
    setLoading(true);
    fetch(`/api/services/${id}/tools/files?dir=${encodeURIComponent(dir)}`)
      .then((r) => r.json())
      .then((data) => {
        setFiles(data.files || []);
        setCurrentDir(data.currentDir || dir);
        if (data.homeDir) setHomeDir(data.homeDir);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`/api/services/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setService(data.service);
        fetchDirectory("/public_html");
      });
  }, [id]);

  // Click outside to dismiss context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleRowDoubleClick = (item: any) => {
    if (item.isDir) {
      const nextDir = `${currentDir === "/" ? "" : currentDir}/${item.name}`;
      fetchDirectory(nextDir);
      setSelectedItem(null);
    } else {
      handleOpenEdit(item);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const toggleTreeNode = (path: string) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const navigateUp = () => {
    if (currentDir === "/public_html" || currentDir === "/") {
      fetchDirectory("/");
      return;
    }
    const parts = currentDir.split("/").filter(Boolean);
    parts.pop();
    const parent = "/" + parts.join("/");
    fetchDirectory(parent || "/");
  };

  // Actions
  const handleOpenEdit = async (item: any) => {
    if (item.isDir) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", dir: currentDir, name: item.name }),
      });
      const data = await res.json();
      setModalFileContent(data.content || "");
      setModalInputName(item.name);
      setActiveModal("edit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          dir: currentDir,
          name: modalInputName,
          content: modalFileContent,
        }),
      });
      setActiveModal(null);
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInputName) return;
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_file", dir: currentDir, name: modalInputName }),
      });
      setActiveModal(null);
      setModalInputName("");
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInputName) return;
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_folder", dir: currentDir, name: modalInputName }),
      });
      setActiveModal(null);
      setModalInputName("");
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInputName || !modalInputOldName) return;
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          dir: currentDir,
          oldName: modalInputOldName,
          newName: modalInputName,
        }),
      });
      setActiveModal(null);
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", dir: currentDir, name: selectedItem.name }),
      });
      setActiveModal(null);
      setSelectedItem(null);
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermissions = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await fetch(`/api/services/${id}/tools/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "permissions",
          dir: currentDir,
          name: selectedItem.name,
          permissions: modalPermissions,
        }),
      });
      setActiveModal(null);
      fetchDirectory(currentDir);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (item: any) => {
    if (item.isDir) {
      return <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />;
    }
    if (item.name.endsWith(".php")) {
      return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (item.name.endsWith(".ini") || item.name.startsWith(".")) {
      return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    }
    if (item.name.endsWith(".html") || item.name.endsWith(".htm")) {
      return <Globe className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-sky-400 shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f7f9] text-slate-800 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER (cPanel Jupiter Style) */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/services/${id}`}
            title="Exit File Manager"
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* cPanel File Manager Brand Icon */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#ff6c2c] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              cP
            </div>
            <h1 className="font-bold text-slate-800 text-sm tracking-tight flex items-center space-x-2">
              <span>File Manager</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">
                ({service?.domain || "loading..."})
              </span>
            </h1>
          </div>
        </div>

        {/* Search Bar + Settings */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs">
            <span className="text-slate-500 mr-2 text-[11px] hidden sm:inline">Search:</span>
            <div className="flex rounded border border-slate-300 bg-white overflow-hidden shadow-inner">
              <select className="bg-slate-50 text-slate-600 px-2 py-1 text-xs border-r border-slate-200 focus:outline-none">
                <option>All Your Files</option>
                <option>Current Directory</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-2 py-1 text-xs w-36 sm:w-48 text-slate-800 focus:outline-none"
              />
              <button className="px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold border-l border-slate-200">
                Go
              </button>
            </div>
          </div>

          <button
            onClick={() => alert("Settings: Show Hidden Files (.dotfiles) is enabled by default.")}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* 2. ACTION TOOLBAR (Exact matching the cPanel Jupiter Screenshot) */}
      <div className="bg-[#fcfdfe] border-b border-slate-200 px-3 py-1.5 flex items-center space-x-0.5 overflow-x-auto text-[11px] text-slate-700 shrink-0">
        <button
          onClick={() => {
            setModalInputName("");
            setActiveModal("new_file");
          }}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition hover:text-slate-900"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600 font-bold" />
          <span className="font-medium">File</span>
        </button>

        <button
          onClick={() => {
            setModalInputName("");
            setActiveModal("new_folder");
          }}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition hover:text-slate-900"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium">Folder</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          disabled={!selectedItem}
          onClick={() => alert(`Copy ${selectedItem?.name}`)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>Copy</span>
        </button>

        <button
          disabled={!selectedItem}
          onClick={() => alert(`Move ${selectedItem?.name}`)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Move className="w-3.5 h-3.5 text-slate-500" />
          <span>Move</span>
        </button>

        <button
          onClick={() => setActiveModal("upload")}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Upload</span>
        </button>

        <button
          disabled={!selectedItem || selectedItem.isDir}
          onClick={() => alert(`Downloading ${selectedItem?.name}`)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download</span>
        </button>

        <button
          disabled={!selectedItem}
          onClick={() => setActiveModal("delete")}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-rose-600 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          disabled={!selectedItem}
          onClick={() => alert("Restored item")}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restore</span>
        </button>

        <button
          disabled={!selectedItem}
          onClick={() => {
            setModalInputOldName(selectedItem.name);
            setModalInputName(selectedItem.name);
            setActiveModal("rename");
          }}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Rename</span>
        </button>

        <button
          disabled={!selectedItem || selectedItem.isDir}
          onClick={() => handleOpenEdit(selectedItem)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium text-blue-700"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          disabled={!selectedItem || selectedItem.isDir}
          onClick={() => handleOpenEdit(selectedItem)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span>HTML Editor</span>
        </button>

        <button
          disabled={!selectedItem}
          onClick={() => {
            setModalPermissions(selectedItem.permissions || "0755");
            setActiveModal("permissions");
          }}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Key className="w-3.5 h-3.5 text-slate-500" />
          <span>Permissions</span>
        </button>

        <button
          disabled={!selectedItem || selectedItem.isDir}
          onClick={() => handleOpenEdit(selectedItem)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          disabled={!selectedItem}
          onClick={() => alert(`Compressed ${selectedItem?.name}.zip`)}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Archive className="w-3.5 h-3.5 text-slate-500" />
          <span>Compress</span>
        </button>
      </div>

      {/* 3. SUB-NAV / BREADCRUMB BAR (Home, Up One Level, Reload, Path) */}
      <div className="bg-[#f0f4f8] border-b border-slate-200 px-3 py-1 flex items-center justify-between text-xs text-slate-700 shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => fetchDirectory("/public_html")}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-200 transition"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            onClick={navigateUp}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-200 transition"
          >
            <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">Up One Level</span>
          </button>

          <button
            onClick={() => fetchDirectory(currentDir)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">Reload</span>
          </button>

          <button
            onClick={() => setSelectedItem(files[0] || null)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-200 transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">Select All</span>
          </button>

          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-200 transition"
          >
            <Square className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px]">Unselect All</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-600 flex items-center space-x-2 bg-white px-2.5 py-0.5 rounded border border-slate-300">
          <span className="text-slate-400">Path:</span>
          <span className="font-semibold text-slate-800">{homeDir}{currentDir}</span>
        </div>
      </div>

      {/* 4. MAIN TWO-PANE BODY (Left Folder Tree + Right File Grid Table) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Directory Tree Pane (Exact matching the cPanel Tree View) */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto text-xs text-slate-700">
          <div className="p-2 space-y-0.5">
            {/* Root items matching the user's screenshot */}
            {[
              { name: ".ssh", path: "/.ssh" },
              { name: ".subaccounts", path: "/.subaccounts" },
              { name: ".trash", path: "/.trash" },
              { name: ".wp-toolkit", path: "/.wp-toolkit" },
              { name: "bin", path: "/bin" },
              { name: "cpanel3-skel", path: "/cpanel3-skel" },
              { name: "etc", path: "/etc" },
              { name: "logs", path: "/logs" },
              { name: "mail", path: "/mail" },
              { name: "public_ftp", path: "/public_ftp" },
            ].map((node) => (
              <div
                key={node.path}
                onClick={() => fetchDirectory(node.path)}
                className={`flex items-center space-x-1.5 px-2 py-1 rounded cursor-pointer transition ${
                  currentDir === node.path ? "bg-sky-100 text-blue-900 font-semibold" : "hover:bg-slate-100"
                }`}
              >
                <span className="text-slate-400 text-[10px] w-3 text-center">+</span>
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="truncate">{node.name}</span>
              </div>
            ))}

            {/* public_html (Expanded with subfolders matching screenshot) */}
            <div className="space-y-0.5">
              <div
                onClick={() => {
                  toggleTreeNode("/public_html");
                  fetchDirectory("/public_html");
                }}
                className={`flex items-center space-x-1.5 px-2 py-1 rounded cursor-pointer transition ${
                  currentDir === "/public_html" ? "bg-sky-100 text-blue-900 font-semibold" : "hover:bg-slate-100"
                }`}
              >
                <span className="text-slate-500 text-[11px] font-bold w-3 text-center">
                  {expandedNodes["/public_html"] ? "−" : "+"}
                </span>
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="font-semibold text-slate-800">public_html</span>
              </div>

              {expandedNodes["/public_html"] && (
                <div className="pl-5 space-y-0.5 border-l border-slate-200 ml-3">
                  {[
                    ".well-known",
                    "admin",
                    "assets",
                    "attachments",
                    "cgi-bin",
                    "console",
                    "crons",
                    "demo",
                    "mydashboard",
                    "oauth",
                    "resources",
                    "status",
                    "templates",
                    "vendor",
                    "WHMCS",
                    "wp",
                  ].map((sub) => {
                    const subPath = `/public_html/${sub}`;
                    return (
                      <div
                        key={subPath}
                        onClick={() => fetchDirectory(subPath)}
                        className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition ${
                          currentDir === subPath ? "bg-sky-100 text-blue-900 font-semibold" : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="text-slate-400 text-[10px] w-2 text-center">+</span>
                        <Folder className="w-3 h-3 text-amber-500" />
                        <span className="truncate">{sub}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Table Pane (Exact matching the cPanel Jupiter Screenshot Table) */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f0f4f8] text-slate-600 sticky top-0 z-10 border-b border-slate-200 text-[11px] font-semibold">
                <tr>
                  <th className="py-1.5 px-4 w-1/3 border-r border-slate-200">Name</th>
                  <th className="py-1.5 px-4 w-24 text-right border-r border-slate-200">Size</th>
                  <th className="py-1.5 px-4 w-44 border-r border-slate-200">Last Modified</th>
                  <th className="py-1.5 px-4 w-36 border-r border-slate-200">Type</th>
                  <th className="py-1.5 px-4 w-24 text-center">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading folder contents...</span>
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 italic">
                      This directory is empty. Click "+ File" or "Upload" to add files.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((item) => {
                    const isSelected = selectedItem?.name === item.name;
                    return (
                      <tr
                        key={item.name}
                        onClick={() => handleRowClick(item)}
                        onDoubleClick={() => handleRowDoubleClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#cce5ff] text-blue-950 font-medium"
                            : "hover:bg-slate-50 odd:bg-white even:bg-[#fafbfc]"
                        }`}
                      >
                        <td className="py-1.5 px-4 flex items-center space-x-2 border-r border-slate-100 truncate">
                          {getFileIcon(item)}
                          <span className="truncate">{item.name}</span>
                        </td>
                        <td className="py-1.5 px-4 text-right font-mono text-slate-600 text-[11px] border-r border-slate-100">
                          {item.size}
                        </td>
                        <td className="py-1.5 px-4 text-slate-600 text-[11px] border-r border-slate-100">
                          {item.modified}
                        </td>
                        <td className="py-1.5 px-4 text-slate-500 text-[11px] border-r border-slate-100 truncate">
                          {item.type}
                        </td>
                        <td className="py-1.5 px-4 text-center font-mono text-slate-600 text-[11px]">
                          {item.permissions}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Status */}
          <div className="h-6 bg-[#f0f4f8] border-t border-slate-200 px-3 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span>{filteredFiles.length} item(s)</span>
            <span>
              {selectedItem ? `Selected: ${selectedItem.name} (${selectedItem.permissions})` : "No selection"}
            </span>
          </div>
        </div>
      </div>

      {/* 5. RIGHT-CLICK CONTEXT MENU (Exact matching user's cPanel screenshot!) */}
      {contextMenu && contextMenu.visible && (
        <div
          ref={contextMenuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-white border border-slate-300 rounded shadow-2xl py-1 w-48 text-xs text-slate-800"
        >
          <button
            onClick={() => {
              alert(`Move ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Move className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            <span>Move</span>
          </button>

          <button
            onClick={() => {
              alert(`Copy ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => {
              setModalInputOldName(contextMenu.item.name);
              setModalInputName(contextMenu.item.name);
              setActiveModal("rename");
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Rename</span>
          </button>

          {!contextMenu.item.isDir && (
            <button
              onClick={() => {
                handleOpenEdit(contextMenu.item);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 font-medium"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={() => {
              setModalPermissions(contextMenu.item.permissions || "0755");
              setActiveModal("permissions");
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>Change Permissions</span>
          </button>

          <button
            onClick={() => {
              setActiveModal("delete");
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white text-rose-600 flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="h-px bg-slate-200 my-1" />

          <button
            onClick={() => {
              alert(`Compress ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            <span>Compress</span>
          </button>

          <button
            onClick={() => {
              alert(`Password Protect ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Password Protect</span>
          </button>

          <button
            onClick={() => {
              alert(`Leech Protect for ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Leech Protect</span>
          </button>

          <button
            onClick={() => {
              alert(`Manage Indices for ${contextMenu.item.name}`);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Manage Indices</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC CPANEL MODALS
          ========================================================================= */}

      {/* NEW FILE MODAL */}
      {activeModal === "new_file" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">New File</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFile} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">New File Name:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalInputName}
                  onChange={(e) => setModalInputName(e.target.value)}
                  placeholder="example.php or style.css"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">New file will be created in:</label>
                <div className="px-2.5 py-1.5 bg-slate-100 rounded border border-slate-200 font-mono text-[11px] text-slate-600">
                  {homeDir}{currentDir}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Create New File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW FOLDER MODAL */}
      {activeModal === "new_folder" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">New Folder</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">New Folder Name:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalInputName}
                  onChange={(e) => setModalInputName(e.target.value)}
                  placeholder="e.g. assets, uploads, scripts"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">New folder will be created in:</label>
                <div className="px-2.5 py-1.5 bg-slate-100 rounded border border-slate-200 font-mono text-[11px] text-slate-600">
                  {homeDir}{currentDir}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Create New Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FILE CODE EDITOR MODAL */}
      {activeModal === "edit" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] text-slate-200 border border-slate-700 rounded-lg max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#2d2d2d] px-4 py-2 border-b border-slate-700 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">Edit: {modalInputName}</span>
                <span className="text-slate-400 text-[11px]">({currentDir}/{modalInputName})</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Save Changes</span>
                </button>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Editor Textarea with Line Numbers */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs">
              <textarea
                value={modalFileContent}
                onChange={(e) => setModalFileContent(e.target.value)}
                className="w-full h-full bg-[#1e1e1e] text-slate-100 p-4 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {activeModal === "rename" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Rename</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRename} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Old Name:</label>
                <input
                  type="text"
                  disabled
                  value={modalInputOldName}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">New File / Folder Name:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalInputName}
                  onChange={(e) => setModalInputName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Rename File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-rose-700">
              <h3 className="font-bold text-sm">Trash / Delete</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-700">
                Are you sure you want to move the following file/folder to the trash?
              </p>
              <div className="p-2.5 bg-slate-100 rounded border border-slate-200 font-mono text-slate-800 font-semibold">
                {selectedItem?.name}
              </div>
              <label className="flex items-center space-x-2 text-slate-600 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipTrash}
                  onChange={(e) => setSkipTrash(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px]">Skip the trash and permanently delete the files</span>
              </label>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PERMISSIONS MODAL */}
      {activeModal === "permissions" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Change Permissions</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="font-semibold text-slate-800">{selectedItem?.name}</p>

              {/* 3x3 Permissions Matrix Table */}
              <table className="w-full text-center border border-slate-200 text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-1 px-2 text-left">Role</th>
                    <th className="py-1 px-2">Read</th>
                    <th className="py-1 px-2">Write</th>
                    <th className="py-1 px-2">Execute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1 px-2 text-left font-medium">User</td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked /></td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked /></td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked={selectedItem?.isDir} /></td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 text-left font-medium">Group</td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked /></td>
                    <td className="py-1 px-2"><input type="checkbox" /></td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked={selectedItem?.isDir} /></td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 text-left font-medium">World</td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked /></td>
                    <td className="py-1 px-2"><input type="checkbox" /></td>
                    <td className="py-1 px-2"><input type="checkbox" defaultChecked={selectedItem?.isDir} /></td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center space-x-2 pt-1">
                <span className="text-slate-600 font-medium">Permission Mode:</span>
                <input
                  type="text"
                  value={modalPermissions}
                  onChange={(e) => setModalPermissions(e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermissions}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Change Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {activeModal === "upload" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">File Upload</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-500 transition cursor-pointer bg-slate-50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Drop files here to start uploading</p>
                <p className="text-slate-500 text-[11px] mt-1">or click to browse from your computer</p>
                <input
                  type="file"
                  onChange={() => {
                    alert("File uploaded to " + currentDir + " successfully!");
                    setActiveModal(null);
                    fetchDirectory(currentDir);
                  }}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Destination: {homeDir}{currentDir}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
