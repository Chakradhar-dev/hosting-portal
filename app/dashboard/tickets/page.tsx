"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HelpCircle, Plus, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket modal state
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("Technical Support");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = () => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => setTickets(data.tickets || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, department, priority, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket");

      setShowModal(false);
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-slate-400 mt-1">Submit inquiries or technical questions regarding your cPanel services.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Open Ticket</span>
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6 font-semibold">Ticket #</th>
              <th className="py-3 px-6 font-semibold">Subject</th>
              <th className="py-3 px-6 font-semibold">Department</th>
              <th className="py-3 px-6 font-semibold">Priority</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No support tickets found. Click "Open Ticket" if you need assistance.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 font-mono font-semibold text-indigo-400">{t.ticketNumber}</td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="font-medium text-slate-200 hover:text-indigo-400 flex items-center space-x-1.5"
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
                          : "bg-slate-700/50 text-slate-300"
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
                  <td className="py-4 px-6 text-right text-slate-400">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Open Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="cPanel & Domain Setup">cPanel & Domain Setup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed description of your issue..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
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
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
