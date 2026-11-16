"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Server,
  Globe,
  Receipt,
  HelpCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/servers").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ])
      .then(([srvData, svcData, invData, tData]) => {
        setServers(srvData.servers || []);
        setServices(svcData.services || []);
        setInvoices(invData.invoices || []);
        setTickets(tData.tickets || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeServices = services.filter((s) => s.status === "ACTIVE").length;
  const suspendedServices = services.filter((s) => s.status === "SUSPENDED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System & Hosting Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your WHM server nodes, client cPanel accounts, automation, and revenues.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>WHM Server Nodes</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{servers.length}</p>
          <p className="text-xs text-slate-400 mt-1">{servers.filter((s) => s.active).length} connected & active</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active cPanel Accounts</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{activeServices}</p>
          <p className="text-xs text-slate-400 mt-1">{suspendedServices} suspended accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Settled Revenue</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{invoices.filter((i) => i.status === "PAID").length} paid invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Open Support Tickets</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{tickets.filter((t) => t.status !== "CLOSED").length}</p>
          <p className="text-xs text-slate-400 mt-1">Pending admin reply</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/servers"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition flex items-center space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">WHM Server Nodes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Test API tokens and sync WHM packages</p>
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition flex items-center space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Client cPanel Accounts</h3>
            <p className="text-xs text-slate-400 mt-0.5">Suspend, unsuspend, terminate accounts</p>
          </div>
        </Link>

        <Link
          href="/admin/packages"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition flex items-center space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-600/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hosting Packages</h3>
            <p className="text-xs text-slate-400 mt-0.5">Map plans directly to WHM packages</p>
          </div>
        </Link>
      </div>

      {/* Recent Client Services Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Client Hosting Accounts</h2>
          <Link href="/admin/services" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            View All Services →
          </Link>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6 font-semibold">Client</th>
              <th className="py-3 px-6 font-semibold">Domain</th>
              <th className="py-3 px-6 font-semibold">cPanel User</th>
              <th className="py-3 px-6 font-semibold">Package</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {services.slice(0, 5).map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-6 font-medium text-white">{s.user?.name || "Client"}</td>
                <td className="py-3.5 px-6 font-semibold text-indigo-400">{s.domain}</td>
                <td className="py-3.5 px-6 font-mono text-slate-300">{s.cpanelUsername}</td>
                <td className="py-3.5 px-6 text-slate-300">{s.package?.name}</td>
                <td className="py-3.5 px-6">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold border ${
                      s.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right text-slate-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
