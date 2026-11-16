"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare, Loader2 } from "lucide-react";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-white">Support Desk Queue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Respond to customer technical questions, cPanel inquiries, and billing issues.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6 font-semibold">Ticket #</th>
              <th className="py-3 px-6 font-semibold">Client</th>
              <th className="py-3 px-6 font-semibold">Subject</th>
              <th className="py-3 px-6 font-semibold">Department</th>
              <th className="py-3 px-6 font-semibold">Priority</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No support tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6 font-mono font-semibold text-indigo-400">{t.ticketNumber}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{t.user?.name}</div>
                    <div className="text-[11px] text-slate-400">{t.user?.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="font-semibold text-slate-200 hover:text-indigo-400 flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.subject}</span>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{t.department}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        t.priority === "HIGH" || t.priority === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                        t.status === "ANSWERED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : t.status === "OPEN"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30 transition text-xs"
                    >
                      Reply / View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
