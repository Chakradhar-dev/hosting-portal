"use client";

import { useEffect, useState } from "react";
import { Receipt, CheckCircle, Clock, CreditCard, Loader2 } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchInvoices = () => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((data) => setInvoices(data.invoices || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "Credit Card (Simulated Gateway)" }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      alert(data.message || "Payment processed successfully!");
      fetchInvoices();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setPayingId(null);
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
        <h1 className="text-2xl font-bold text-white">Billing & Invoices</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your invoices and billing receipts. Settling invoices instantly triggers cPanel auto-provisioning.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">Invoice #</th>
                <th className="py-3 px-6 font-semibold">Description</th>
                <th className="py-3 px-6 font-semibold">Amount</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold">Due Date</th>
                <th className="py-3 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{inv.title}</td>
                    <td className="py-4 px-6 font-bold text-white text-sm">${inv.amount.toFixed(2)}</td>
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
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {inv.status === "UNPAID" ? (
                        <button
                          onClick={() => handlePay(inv.id)}
                          disabled={payingId === inv.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition flex items-center space-x-1.5 ml-auto"
                        >
                          {payingId === inv.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-3 h-3" />
                              <span>Pay Now</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">Settled</span>
                      )}
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
