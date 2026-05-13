import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Package,
  Shield,
  Bell,
  ChevronRight,
  Gamepad2,
  Server,
  FileText,
  Mail,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useLang } from "@/i18n/context";
const logoImg = `${import.meta.env.BASE_URL}logo-nashmi.png`;

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  labelKey: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: LayoutDashboard, labelKey: "لوحة التحكم" },
  { href: "/analytics", icon: BarChart3, labelKey: "التحليلات" },
  { href: "/orders", icon: ShoppingCart, labelKey: "الطلبات" },
  { href: "/products", icon: Package, labelKey: "المنتجات" },
  { href: "/messages", icon: Mail, labelKey: "الرسائل" },
  { href: "/users", icon: Users, labelKey: "المستخدمون" },
  { href: "/reports", icon: FileText, labelKey: "التقارير" },
  { href: "/security", icon: Shield, labelKey: "الأمان" },
  { href: "/server", icon: Server, labelKey: "الخوادم" },
];

const bottomItems: (NavItem & { badge?: boolean })[] = [
  { href: "/notifications", icon: Bell, labelKey: "الإشعارات", badge: true },
  { href: "/settings", icon: Settings, labelKey: "الإعدادات" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  noToggle?: boolean;
}

export default function Sidebar({ collapsed, onToggle, noToggle }: SidebarProps) {
  const [location] = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const { t } = useLang();

  const fetchNotifCount = useCallback(async () => {
    try {
      const data = await adminApi.getUnreadCount();
      setNotifCount(data.count);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifCount]);

  return (
    <aside
      className={`fixed top-0 right-0 h-screen z-40 flex flex-col border-l border-white/[0.06] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[220px]"
      }`}
      style={{ background: "rgba(9,9,9,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-4 border-b border-white/[0.06] ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
              boxShadow: "0 0 15px rgba(220,38,38,0.4)",
            }}
          >
            <Gamepad2 size={18} className="text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full gap-0.5">
            <img
              src={logoImg}
              alt="Nashmi Souq"
              className="h-12 w-auto object-contain"
              style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.5))" }}
            />
            <p className="text-white/30 text-[9px] tracking-widest uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {!collapsed && (
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider px-3 mb-1">
            {t("القائمة الرئيسية")}
          </p>
        )}
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = location === href;
          const label = t(labelKey);
          return (
            <Link key={href} href={href}>
              <div
                className={`sidebar-link ${isActive ? "active" : "text-white/50"} ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? label : undefined}
                data-testid={`sidebar-link-${labelKey}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </div>
            </Link>
          );
        })}

        <div className="mt-4 mb-1">
          {!collapsed && (
            <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider px-3 mb-1">
              {t("أخرى")}
            </p>
          )}
          {bottomItems.map(({ href, icon: Icon, labelKey, badge }) => {
            const isActive = location === href;
            const label = t(labelKey);
            const count = labelKey === "الإشعارات" ? notifCount : 0;
            return (
              <Link key={href} href={href}>
                <div
                  className={`sidebar-link ${isActive ? "active" : "text-white/50"} ${collapsed ? "justify-center px-2" : ""} relative`}
                  data-testid={`sidebar-link-${label}`}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {badge && count > 0 && !collapsed && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1"
                        style={{ background: "#dc2626" }}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span>{label}</span>}
                  {badge && count > 0 && collapsed && (
                    <span
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                      style={{ background: "#dc2626", boxShadow: "0 0 6px rgba(220,38,38,0.7)" }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Toggle button */}
      {!noToggle && (
        <div className="p-2 border-t border-white/[0.06]">
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-center py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200 ${collapsed ? "" : "gap-2 px-3"}`}
            data-testid="button-sidebar-toggle"
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
            />
            {!collapsed && <span className="text-xs">طي القائمة</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
