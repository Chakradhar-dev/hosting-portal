"use client";

import { useEffect, useState } from "react";
import { Server, Plus, RefreshCw, CheckCircle2, AlertCircle, Shield, Globe, Loader2 } from "lucide-react";

export default function AdminServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; version?: string; error?: string }>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<Record<string, string>>({});

  // Add Server Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("2087");
  const [username, setUsername] = useState("root");
  const [apiToken, setApiToken] = useState("");
  const [nameserver1, setNameserver1] = useState("ns1.example.com");
  const [nameserver2, setNameserver2] = useState("ns2.example.com");
  const [useSsl, setUseSsl] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchServers = () => {
    fetch("/api/servers")
      .then((r) => r.json())
      .then((data) => setServers(data.servers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleTestConnection = async (serverId: string) => {
    setTestingId(serverId);
    try {
      const res = await fetch("/api/servers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [serverId]: data }));
    } catch (err: any) {
      setTestResults((prev) => ({ ...prev, [serverId]: { success: false, error: err.message } }));
    } finally {
      setTestingId(null);
    }
  };

  const handleSyncPackages = async (serverId: string) => {
    setSyncingId(serverId);
    try {
      const res = await fetch("/api/servers/sync-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      setSyncMsg((prev) => ({
        ...prev,
        [serverId]: `Synced ${data.found} WHM packages (${data.imported} newly created in portal).`,
      }));
    } catch (err: any) {
      alert("Sync error: " + err.message);
    } finally {
      setSyncingId(null);
    }
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          hostname,
          ip,
          port: parseInt(port, 10),
          username,
          apiToken,
          nameserver1,
          nameserver2,
          useSsl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add server");

      setShowAddModal(false);
      setName("");
      setHostname("");
      setIp("");
      setApiToken("");
      fetchServers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WHM Server Nodes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect cPanel/WHM server clusters via API 1 tokens for zero-touch provisioning and automated management.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add WHM Server</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {servers.map((srv) => {
          const test = testResults[srv.id];
          return (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{srv.name}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      https://{srv.hostname}:{srv.port} • IP: {srv.ip}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>Root/User: <span className="text-slate-200 font-mono">{srv.username}</span></span>
                      <span>•</span>
                      <span>API Token: <span className="text-slate-200 font-mono">{srv.apiToken}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Test Connection Button */}
                  <button
                    onClick={() => handleTestConnection(srv.id)}
                    disabled={testingId === srv.id}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
                  >
                    {testingId === srv.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>Test Connection</span>
                  </button>

                  {/* Sync Packages Button */}
                  <button
                    onClick={() => handleSyncPackages(srv.id)}
                    disabled={syncingId === srv.id}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition border border-indigo-500/30"
                  >
                    {syncingId === srv.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Sync WHM Packages</span>
                  </button>
                </div>
              </div>

              {/* Live Test Connection Result Banner */}
              {test && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                    test.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {test.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Connection Successful! Online: {test.version}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>WHM Connection Failed: {test.error}</span>
                    </>
                  )}
                </div>
              )}

              {/* Sync Message */}
              {syncMsg[srv.id] && (
                <div className="p-3 rounded-xl text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncMsg[srv.id]}</span>
                </div>
              )}

              {/* Server Stats & NS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block">Hosted Accounts</span>
                  <span className="text-white font-bold text-sm">
                    {srv._count?.hostingAccounts ?? 0} cPanel Accounts
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block">Primary Nameserver</span>
                  <span className="text-white font-mono">{srv.nameserver1 || "ns1.hostingcloud.net"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block">Secondary Nameserver</span>
                  <span className="text-white font-mono">{srv.nameserver2 || "ns2.hostingcloud.net"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add WHM Server Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add WHM Server Node</h2>
            <form onSubmit={handleAddServer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Server Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. cPanel Node US-East"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hostname / FQDN</label>
                  <input
                    type="text"
                    required
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    placeholder="srv1.yourhosting.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Server IP Address</label>
                  <input
                    type="text"
                    required
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="198.51.100.25"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WHM Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WHM Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="root"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WHM API Token</label>
                  <input
                    type="password"
                    required
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Manage API Tokens key"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Nameserver</label>
                  <input
                    type="text"
                    value={nameserver1}
                    onChange={(e) => setNameserver1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Nameserver</label>
                  <input
                    type="text"
                    value={nameserver2}
                    onChange={(e) => setNameserver2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {saving ? "Saving Server..." : "Save WHM Server"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
