"use client";

import { useEffect, useState } from "react";
import { Receipt, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((data) => setInvoices(data.invoices || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const total = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const paidTotal = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices & Billing History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global ledger of customer invoices, paid receipts, and payment automation statuses.
          </p>
        </div>

        <div className="flex space-x-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Total Billed: </span>
            <span className="text-white font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Collected: </span>
            <span className="text-emerald-400 font-bold">${paidTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6 font-semibold">Invoice #</th>
              <th className="py-3 px-6 font-semibold">Client</th>
              <th className="py-3 px-6 font-semibold">Description</th>
              <th className="py-3 px-6 font-semibold">Amount</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6 font-mono font-semibold text-indigo-400">{inv.invoiceNumber}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{inv.user?.name}</div>
                    <div className="text-[11px] text-slate-400">{inv.user?.email}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-200">{inv.title}</td>
                  <td className="py-4 px-6 font-bold text-white">${inv.amount.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold border ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {inv.status === "PAID" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Unpaid</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-slate-400">
                    {new Date(inv.dueDate).toLocaleDateString()}
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
