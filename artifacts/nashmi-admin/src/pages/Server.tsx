import { useState, useEffect } from "react";
import { Server, Activity, Database, RefreshCw, CheckCircle, XCircle, Globe, Cpu, Clock, Zap, Loader2 } from "lucide-react";
import { useLang } from "@/i18n/context";

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || "https://nashmi-market.onrender.com/api";

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "checking";
  latency: string;
  detail: string;
}

export default function ServerPage() {
  const { t } = useLang();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Server", status: "checking", latency: "...", detail: "Render" },
    { name: "قاعدة البيانات", status: "checking", latency: "...", detail: "SQLite" },
    { name: "المتجر", status: "checking", latency: "...", detail: "Vercel" },
    { name: "لوحة الإدارة", status: "online", latency: "محلي", detail: "Vite" },
  ]);
  const [checkTime, setCheckTime] = useState("");

  const check = async () => {
    setServices(prev => prev.map(s => s.name !== "لوحة الإدارة" ? { ...s, status: "checking" as const, latency: "..." } : s));

    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/dashboard`, { signal: AbortSignal.timeout(8000) });
      const ms = Date.now() - start;
      setServices(prev => prev.map(s =>
        s.name === "API Server" ? { ...s, status: res.ok ? "online" : "offline", latency: `${ms}ms` } :
        s.name === "قاعدة البيانات" ? { ...s, status: res.ok ? "online" : "offline", latency: `${ms}ms` } : s
      ));
    } catch {
      setServices(prev => prev.map(s =>
        s.name === "API Server" || s.name === "قاعدة البيانات" ? { ...s, status: "offline", latency: "غير متصل" } : s
      ));
    }

    try {
      const start = Date.now();
      const res = await fetch("https://nashmi-market-nashmi-store.vercel.app", { signal: AbortSignal.timeout(8000) });
      const ms = Date.now() - start;
      setServices(prev => prev.map(s =>
        s.name === "المتجر" ? { ...s, status: res.ok ? "online" : "offline", latency: `${ms}ms` } : s
      ));
    } catch {
      setServices(prev => prev.map(s =>
        s.name === "المتجر" ? { ...s, status: "offline", latency: "غير متصل" } : s
      ));
    }

    setCheckTime(new Date().toLocaleTimeString("ar-JO"));
  };

  useEffect(() => { check(); }, []);

  const onlineCount = services.filter(s => s.status === "online").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
            <Server size={16} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">{t("حالة الخوادم")}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${onlineCount === services.length ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
            {onlineCount}/{services.length} نشط
          </span>
        </div>
        <button onClick={check}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 border border-white/10 hover:text-white transition-all">
          <RefreshCw size={14} />{t("فحص الآن")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.name} className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  s.status === "online" ? "bg-green-500/15" :
                  s.status === "checking" ? "bg-yellow-500/15" : "bg-red-500/15"
                }`}>
                  {s.status === "checking" ? (
                    <Loader2 size={18} className="animate-spin text-yellow-400" />
                  ) : (
                    <Globe size={18} className={s.status === "online" ? "text-green-400" : "text-red-400"} />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{s.name}</p>
                  <p className="text-white/40 text-xs">{s.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.status === "checking" ? (
                  <Loader2 size={14} className="animate-spin text-yellow-400" />
                ) : s.status === "online" ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <XCircle size={14} className="text-red-400" />
                )}
                <span className={`text-xs font-semibold ${
                  s.status === "online" ? "text-green-400" :
                  s.status === "checking" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {s.status === "online" ? t("نشط") : s.status === "checking" ? t("فحص...") : t("معطل")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-white/40">وقت الاستجابة:
                <span className={`font-mono mr-1 ${
                  s.status === "online" ? "text-green-400" :
                  s.status === "checking" ? "text-yellow-400" : "text-red-400"
                }`}>{s.latency}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="stat-card p-5">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Cpu size={14} className="text-red-400" />
          {t("معلومات النظام")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "رابط API", value: API_BASE, icon: Globe },
            { label: t("آخر فحص"), value: checkTime || "---", icon: Clock },
            { label: t("الخدمات النشطة"), value: `${onlineCount}/${services.length}`, icon: Zap },
            { label: t("عدد الخدمات"), value: services.length.toString(), icon: Activity },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 rounded-xl border border-white/[0.06]">
              <m.icon size={16} className="text-white/30 mx-auto mb-1" />
              <p className="text-white font-bold text-xs truncate" style={{ fontFamily: "'Orbitron', monospace" }} dir="ltr">{m.value}</p>
              <p className="text-white/40 text-[10px]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}