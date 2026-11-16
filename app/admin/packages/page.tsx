"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Server, CheckCircle2, HardDrive, Loader2 } from "lucide-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Package Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [whmPackageName, setWhmPackageName] = useState("");
  const [serverId, setServerId] = useState("");
  const [description, setDescription] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("9.99");
  const [priceYearly, setPriceYearly] = useState("99.99");
  const [diskQuotaMb, setDiskQuotaMb] = useState("10240");
  const [bandwidthQuotaMb, setBandwidthQuotaMb] = useState("102400");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPackages = () => {
    Promise.all([
      fetch("/api/packages").then((r) => r.json()),
      fetch("/api/servers").then((r) => r.json()),
    ])
      .then(([pData, sData]) => {
        setPackages(pData.packages || []);
        const sList = sData.servers || [];
        setServers(sList);
        if (sList.length > 0) setServerId(sList[0].id);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          whmPackageName,
          serverId,
          description,
          priceMonthly: parseFloat(priceMonthly),
          priceYearly: parseFloat(priceYearly),
          diskQuotaMb: parseInt(diskQuotaMb, 10),
          bandwidthQuotaMb: parseInt(bandwidthQuotaMb, 10),
          featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create package");

      setShowModal(false);
      setName("");
      setWhmPackageName("");
      fetchPackages();
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
          <h1 className="text-2xl font-bold text-white">Hosting Packages & Plans</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define pricing, resource quotas, and map them directly to WHM packages.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs font-mono text-indigo-400 mt-0.5">WHM: {pkg.whmPackageName}</p>
                </div>
                {pkg.featured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Price:</span>
                  <span className="text-white font-bold">${pkg.priceMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Yearly Price:</span>
                  <span className="text-white font-bold">${pkg.priceYearly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Disk Quota:</span>
                  <span className="text-slate-200 font-mono">
                    {pkg.diskQuotaMb ? `${pkg.diskQuotaMb} MB` : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Default Server:</span>
                  <span className="text-slate-200 font-mono">{pkg.server?.name || "Any Active Server"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Package Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Hosting Package</h2>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. cPanel SSD Pro"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WHM Package Name</label>
                  <input
                    type="text"
                    required
                    value={whmPackageName}
                    onChange={(e) => setWhmPackageName(e.target.value)}
                    placeholder="e.g. cPanel_Pro"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target WHM Server</label>
                <select
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.hostname})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan summary..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Yearly Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Disk Quota (MB)</label>
                  <input
                    type="number"
                    value={diskQuotaMb}
                    onChange={(e) => setDiskQuotaMb(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bandwidth (MB)</label>
                  <input
                    type="number"
                    value={bandwidthQuotaMb}
                    onChange={(e) => setBandwidthQuotaMb(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured" className="text-xs text-slate-300">
                  Feature this package prominently on homepage
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {saving ? "Saving..." : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
