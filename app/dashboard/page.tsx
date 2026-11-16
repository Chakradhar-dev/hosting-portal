"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Server, Globe, Receipt, HelpCircle, KeyRound, ExternalLink, ArrowRight, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function ClientDashboardPage() {
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ])
      .then(([sData, iData, tData]) => {
        setServices(sData.services || []);
        setInvoices(iData.invoices || []);
        setTickets(tData.tickets || []);
      })
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

  const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID");
  const activeServices = services.filter((s) => s.status === "ACTIVE");

  return (
    <div className="space-y-8">
      {/* Top Banner if there are unpaid invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm">
              You have <span className="font-bold">{unpaidInvoices.length} unpaid invoice(s)</span> totaling $
              {unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}. Settle your invoice to ensure uninterrupted cPanel hosting.
            </p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shrink-0"
          >
            Pay Now
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Active Services</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{activeServices.length}</p>
          <p className="text-xs text-slate-400 mt-1">Hosting on WHM / cPanel nodes</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Unpaid Invoices</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{unpaidInvoices.length}</p>
          <p className="text-xs text-slate-400 mt-1">
            {unpaidInvoices.length > 0 ? "Pending payment" : "All invoices settled"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Support Tickets</span>
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {tickets.filter((t) => t.status !== "CLOSED").length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Open tickets with help desk</p>
        </div>
      </div>

      {/* Active Hosting Accounts List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>My Hosting Accounts</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {services.length}
            </span>
          </h2>
          <Link
            href="/dashboard/order"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>+ Order New Plan</span>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <Globe className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-200">No active hosting accounts yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">Choose a hosting package to deploy your cPanel website today.</p>
            <Link
              href="/dashboard/order"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
            >
              Browse Hosting Packages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition flex flex-col justify-between"
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
                    Host: {svc.server.hostname}
                  </span>

                  {/* Open Hosting Control Panel (cPanel hidden, native tools panel opened) */}
                  <Link
                    href={`/dashboard/services/${svc.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition"
                  >
                    <span>Manage Hosting Tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
