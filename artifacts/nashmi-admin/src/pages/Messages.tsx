import { useState, useEffect, useCallback } from "react";
import { Mail, MessageSquare, RefreshCw, Loader2, Check, Eye, Clock, User, AtSign, Send } from "lucide-react";
import { adminApi, type ContactMessage } from "@/lib/api";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminApi.getContactMessages();
      setMessages(data);
      setError("");
    } catch {
      setError("فشل تحميل الرسائل");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleMarkRead = async (id: number) => {
    try {
      const updated = await adminApi.markContactMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
      if (selected?.id === id) setSelected(updated);
    } catch { /* ignore */ }
  };

  const unread = messages.filter(m => !m.read).length;

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diff < 60) return "الآن";
      if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
      if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
      return d.toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
            <Mail size={16} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">رسائل التواصل</h1>
          <span className="text-white/30 text-sm">({messages.length})</span>
          {unread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {unread} غير مقروءة
            </span>
          )}
          <button onClick={() => fetchMessages()} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/25 text-red-400 text-sm" style={{ background: "rgba(220,38,38,0.08)" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List — takes 2/5 */}
        <div className="lg:col-span-2 stat-card p-0 overflow-hidden max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-red-500" />
              <span className="text-white/40 text-sm">جارٍ التحميل...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">لا توجد رسائل</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {messages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => { setSelected(msg); if (!msg.read) handleMarkRead(msg.id); }}
                  className={`w-full text-right px-4 py-4 hover:bg-white/[0.02] transition-colors flex items-start gap-3 ${!msg.read ? "bg-white/[0.02]" : ""} ${selected?.id === msg.id ? "bg-red-500/10 border-r-2 border-red-500" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.read ? "bg-red-500/20" : "bg-white/5"}`}>
                    <MessageSquare size={16} className={!msg.read ? "text-red-400" : "text-white/30"} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!msg.read ? "text-white font-bold" : "text-white/60"}`}>{msg.name}</p>
                      <span className="text-white/25 text-[10px] shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-white/40 text-[11px] mt-0.5 truncate">{msg.email}</p>
                    <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_6px_rgba(220,38,38,0.7)]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail — takes 3/5 */}
        <div className="lg:col-span-3 stat-card p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <Mail size={64} strokeWidth={1} />
              <p className="mt-4 text-sm">اختر رسالة من القائمة لعرض التفاصيل</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!selected.read ? "bg-red-500/20" : "bg-white/5"}`}>
                    <User size={22} className={!selected.read ? "text-red-400" : "text-white/30"} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} className="text-red-400/80 hover:text-red-400 text-sm font-mono transition-colors" dir="ltr">
                      {selected.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selected.read && (
                    <button onClick={() => handleMarkRead(selected.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-green-400 hover:bg-green-500/10 border border-green-500/20 transition-all">
                      <Check size={12} /> تحديد مقروء
                    </button>
                  )}
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
                    <Send size={12} /> رد
                  </a>
                </div>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-4 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{formatDate(selected.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={12} />
                  <span>{selected.read ? "مقروءة" : "غير مقروءة"}</span>
                </div>
              </div>

              {/* Message body */}
              <div className="p-5 rounded-2xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-white/80 text-base leading-loose whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}