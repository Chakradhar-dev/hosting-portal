"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  KeyRound,
  ExternalLink,
  ShieldAlert,
  Play,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchServices = () => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAction = async (serviceId: string, action: string, reason?: string) => {
    if (action === "terminate" && !confirm("Are you sure you want to permanently terminate this cPanel account on WHM?")) {
      return;
    }

    setActionLoading(`${serviceId}-${action}`);
    try {
      const res = await fetch(`/api/services/${serviceId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      alert(`Action '${action}' executed successfully on WHM server!`);
      fetchServices();
    } catch (err: any) {
      alert("WHM Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminSso = async (serviceId: string) => {
    setActionLoading(`${serviceId}-sso`);
    try {
      const res = await fetch(`/api/services/${serviceId}/sso`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate SSO");
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      alert("SSO Error: " + err.message);
    } finally {
      setActionLoading(null);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Client cPanel Accounts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform live WHM operations: instant suspension, unsuspension, account termination, and admin 1-click SSO.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">Client</th>
                <th className="py-3 px-6 font-semibold">Domain</th>
                <th className="py-3 px-6 font-semibold">cPanel User</th>
                <th className="py-3 px-6 font-semibold">Server & Package</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">WHM Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No hosting services found.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{svc.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{svc.user?.email}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-indigo-400 flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{svc.domain}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-200">{svc.cpanelUsername}</td>

                    <td className="py-4 px-6">
                      <div className="text-slate-200 font-medium">{svc.package?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{svc.server?.hostname}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                          svc.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : svc.status === "SUSPENDED"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {svc.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Admin 1-Click SSO into cPanel */}
                        <button
                          onClick={() => handleAdminSso(svc.id)}
                          disabled={actionLoading === `${svc.id}-sso`}
                          title="Admin 1-Click SSO into cPanel"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center space-x-1 transition"
                        >
                          {actionLoading === `${svc.id}-sso` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <KeyRound className="w-3 h-3" />
                          )}
                          <span>SSO</span>
                        </button>

                        {/* If Pending -> Force Provision on WHM */}
                        {svc.status === "PENDING" && (
                          <button
                            onClick={() => handleAction(svc.id, "provision")}
                            disabled={actionLoading === `${svc.id}-provision`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center space-x-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Provision</span>
                          </button>
                        )}

                        {/* If Active -> Suspend */}
                        {svc.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAction(svc.id, "suspend", "Suspended by Administrator")}
                            disabled={actionLoading === `${svc.id}-suspend`}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30 flex items-center space-x-1"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}

                        {/* If Suspended -> Unsuspend */}
                        {svc.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleAction(svc.id, "unsuspend")}
                            disabled={actionLoading === `${svc.id}-unsuspend`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Unsuspend</span>
                          </button>
                        )}

                        {/* Terminate */}
                        {svc.status !== "TERMINATED" && (
                          <button
                            onClick={() => handleAction(svc.id, "terminate")}
                            disabled={actionLoading === `${svc.id}-terminate`}
                            title="Terminate Account on WHM"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
