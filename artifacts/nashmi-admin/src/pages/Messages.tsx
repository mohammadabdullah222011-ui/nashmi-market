import { useState, useEffect, useCallback } from "react";
import { Mail, MessageSquare, RefreshCw, Loader2, Check, Eye, Clock, User, AtSign } from "lucide-react";
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
      return d.toLocaleDateString("ar-JO");
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="stat-card p-0 overflow-hidden">
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
                  className={`w-full text-right px-4 py-3.5 hover:bg-white/[0.02] transition-colors flex items-start gap-3 ${!msg.read ? "bg-white/[0.02]" : ""} ${selected?.id === msg.id ? "bg-red-500/5" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!msg.read ? "bg-red-500/20" : "bg-white/5"}`}>
                    <MessageSquare size={14} className={!msg.read ? "text-red-400" : "text-white/30"} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!msg.read ? "text-white font-semibold" : "text-white/60"}`}>{msg.name}</p>
                      <span className="text-white/25 text-[10px] shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{msg.message}</p>
                  </div>
                  {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="stat-card p-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/20">
              <Mail size={48} />
              <p className="mt-3 text-sm">اختر رسالة لعرضها</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base">تفاصيل الرسالة</h3>
                {!selected.read && (
                  <button onClick={() => handleMarkRead(selected.id)}
                    className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                    <Check size={12} /> تحديد كمقروء
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <User size={12} className="text-white/30" />
                    <span className="text-white/40 text-[10px]">الاسم</span>
                  </div>
                  <p className="text-white text-sm font-semibold">{selected.name}</p>
                </div>
                <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AtSign size={12} className="text-white/30" />
                    <span className="text-white/40 text-[10px]">البريد</span>
                  </div>
                  <p className="text-white/80 text-sm font-mono" dir="ltr">{selected.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Clock size={12} />
                <span>{formatDate(selected.createdAt)}</span>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-white/40 text-xs mb-2">الرسالة</p>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}