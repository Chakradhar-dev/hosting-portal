"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ShieldCheck, User, Loader2 } from "lucide-react";

export default function TicketConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTicket = () => {
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((data) => setTicket(data.ticket))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");

      setReplyMessage("");
      fetchTicket();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to tickets</span>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span className="font-mono text-indigo-400">{ticket.ticketNumber}</span>
            <span>{ticket.subject}</span>
          </h1>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              ticket.status === "ANSWERED"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
            }`}
          >
            {ticket.status}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Department: <span className="text-slate-200">{ticket.department}</span> • Priority:{" "}
          <span className="text-slate-200">{ticket.priority}</span>
        </p>
      </div>

      {/* Message Thread */}
      <div className="space-y-4">
        {ticket.messages.map((m: any) => {
          const isAdmin = m.senderRole === "ADMIN";
          return (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border ${
                isAdmin
                  ? "bg-indigo-950/40 border-indigo-800/60"
                  : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isAdmin ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-semibold text-slate-200">{m.senderName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin ? "bg-indigo-600/30 text-indigo-300" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {m.senderRole}
                  </span>
                </div>
                <span className="text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
        <form onSubmit={handleSendReply}>
          <textarea
            rows={3}
            required
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Write your reply..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 transition"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
