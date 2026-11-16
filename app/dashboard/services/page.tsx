"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, KeyRound, ExternalLink, ArrowRight, Loader2 } from "lucide-react";

export default function ServicesListPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .finally(() => setLoading(false));
  }, []);

  const handleCpanelSso = async (serviceId: string) => {
    setSsoLoading(serviceId);
    try {
      const res = await fetch(`/api/services/${serviceId}/sso`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate cPanel SSO token");
        return;
      }
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      alert("SSO Connection Error: " + err.message);
    } finally {
      setSsoLoading(null);
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
          <h1 className="text-2xl font-bold text-white">My Hosting Services</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your domains, cPanel accounts, and web hosting resources.</p>
        </div>
        <Link
          href="/dashboard/order"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
        >
          + Order New Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    {svc.package.name}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{svc.domain}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    cPanel User: <span className="text-slate-200 font-semibold">{svc.cpanelUsername}</span>
                  </p>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    svc.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : svc.status === "SUSPENDED"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {svc.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <span className="text-slate-400 block">Server Hostname</span>
                  <span className="text-slate-200 font-mono truncate block">{svc.server.hostname}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">IP Address</span>
                  <span className="text-slate-200 font-mono">{svc.server.ip}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-400">
                User: {svc.cpanelUsername}
              </span>

              <Link
                href={`/dashboard/services/${svc.id}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
              >
                <span>Control Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
