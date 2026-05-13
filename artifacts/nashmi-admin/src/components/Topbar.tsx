import { useState, useEffect, useCallback } from "react";
import { Bell, Search, ChevronDown, ShieldAlert, AlertTriangle, Info, Check, X, Menu, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { adminApi, type AdminNotification } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/i18n/context";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuToggle?: () => void;
}

const notifIcons: Record<string, React.ReactNode> = {
  new_order: <Info size={14} className="text-blue-400" />,
  status_change: <ShieldAlert size={14} className="text-orange-400" />,
  info: <Info size={14} className="text-blue-400" />,
  alert: <ShieldAlert size={14} className="text-red-400" />,
  warning: <AlertTriangle size={14} className="text-orange-400" />,
  success: <Check size={14} className="text-green-400" />,
};

function formatNotifTime(iso: string, t: (key: string) => string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return t("الآن");
    if (diff < 3600) return t("منذ %d دقيقة").replace("%d", String(Math.floor(diff / 60)));
    if (diff < 86400) return t("منذ %d ساعة").replace("%d", String(Math.floor(diff / 3600)));
    return d.toLocaleDateString("ar-JO");
  } catch {
    return iso;
  }
}

export default function Topbar({ sidebarCollapsed, onMenuToggle }: TopbarProps) {
  const { t } = useLang();
  const { logout } = useAdminAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState(true);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [, setLocation] = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const ls = JSON.parse(localStorage.getItem("nashmi_admin_settings") || "{}");
      if (ls.notifications === false) { setNotifications([]); return; }
      const data = await adminApi.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async () => {
    try {
      await adminApi.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleNotifClick = (notif: AdminNotification) => {
    setNotifOpen(false);
    if (notif.orderId) {
      setLocation("/orders");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 h-16 z-30 flex items-center justify-between px-5 border-b border-white/[0.06] transition-all duration-300 ${
        onMenuToggle ? "right-0" : (sidebarCollapsed ? "right-[68px]" : "right-[220px]")
      }`}
      style={{ background: "rgba(9,9,9,0.95)", backdropFilter: "blur(20px)" }}
    >
      {/* Left: Mobile menu + Welcome */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl border border-white/8 text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu size={18} />
          </button>
        )}
        <div>
          <h2 className="text-white font-semibold text-sm leading-none">{t("Welcome Back")}</h2>
          <p className="text-white/40 text-xs mt-0.5">{t("Hey, Admin!")}</p>
        </div>

        {/* Server Status Toggle */}
        <button
          onClick={() => setServerStatus(!serverStatus)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
            serverStatus
              ? "border-green-500/30 text-green-400 bg-green-500/10"
              : "border-red-500/30 text-red-400 bg-red-500/10"
          }`}
          data-testid="button-server-status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${serverStatus ? "bg-green-400" : "bg-red-400"} pulse-dot`}
          />
          {serverStatus ? t("Servers Online") : t("Servers Down")}
        </button>
      </div>

      {/* Right: Search + Notif + Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
          <input
            type="search"
            placeholder={t("Search...")}
            className="bg-white/5 border border-white/8 rounded-xl py-2 pl-8 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/40 transition-colors w-48"
            data-testid="input-search"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) fetchNotifications(); }}
            className="relative p-2 rounded-xl border border-white/8 text-white/50 hover:text-white hover:border-white/15 hover:bg-white/5 transition-all duration-200"
            data-testid="button-notifications"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: "#dc2626", boxShadow: "0 0 8px rgba(220,38,38,0.6)" }}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute left-0 top-12 w-80 rounded-2xl border border-white/8 shadow-2xl z-50 overflow-hidden"
              style={{ background: "rgba(12,12,12,0.98)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <p className="text-white font-semibold text-sm">{t("الإشعارات")}</p>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={handleMarkRead}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                      {t("تعيين الكل مقروء")}
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-white/30 text-sm">{t("لا توجد إشعارات")}</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-right flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.read ? "bg-white/[0.02]" : ""}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notifIcons[n.type] || <Info size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold">{n.title}</p>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                        <p className="text-white/25 text-[10px] mt-1">{formatNotifTime(n.createdAt, t)}</p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all duration-200"
            data-testid="button-profile"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #dc2626, #7f1d1d)" }}
            >
              A
            </div>
            <span className="text-white/80 text-sm font-medium hidden sm:block">Admin</span>
            <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div
              className="absolute left-0 top-12 w-44 rounded-xl border border-white/8 shadow-2xl z-50 overflow-hidden"
              style={{ background: "rgba(12,12,12,0.98)" }}
            >
              <button
                className="w-full text-right px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                onClick={() => { setLocation("/settings"); setProfileOpen(false); }}
              >
                {t("الإعدادات")}
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={() => { logout(); setProfileOpen(false); }}
              >
                <LogOut size={15} />
                {t("تسجيل الخروج")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}