import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Loader2, BarChart3, TrendingUp, DollarSign, ShoppingCart, Package, Users, Clock, ChevronLeft } from "lucide-react";
import { adminApi, type AdminOrder } from "@/lib/api";
import { useLang } from "@/i18n/context";
import { useLocation } from "wouter";

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" }); } catch { return iso; }
}

export default function Reports() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [d, o] = await Promise.all([adminApi.dashboard(), adminApi.getOrders()]);
      setStats(d);
      setOrders(o.slice(0, 10));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const reports = [
    { label: t("إجمالي الإيرادات"), icon: DollarSign, value: `${stats.totalRevenue.toLocaleString("en")} JD`, color: "text-green-400" },
    { label: t("إجمالي الطلبات"), icon: ShoppingCart, value: `${stats.totalOrders}`, color: "text-blue-400" },
    { label: t("المنتجات"), icon: Package, value: `${stats.totalProducts}`, color: "text-orange-400" },
    { label: t("المستخدمون"), icon: Users, value: `${stats.totalUsers}`, color: "text-purple-400" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-red-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
            <FileText size={16} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">{t("التقارير")}</h1>
        </div>
        <button onClick={() => { const csv = reports.map(r => `${r.label},${r.value}`).join("\n"); navigator.clipboard.writeText(csv); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "rgba(220,38,38,0.85)" }}>
          <Download size={15} />{t("نسخ التقرير")}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reports.map((r) => (
          <div key={r.label} className="stat-card p-4 text-center">
            <r.icon size={20} className={`mx-auto mb-2 ${r.color}`} />
            <p className="text-white font-bold text-lg" style={{ fontFamily: "'Orbitron', monospace" }}>{r.value}</p>
            <p className="text-white/40 text-xs mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="stat-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">آخر الطلبات</h2>
          <button onClick={() => setLocation("/orders")} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
            عرض الكل <ChevronLeft size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/[0.06]">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">العميل</th>
                <th className="pb-3 font-medium">المبلغ</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-white/30 text-sm py-8">لا توجد طلبات</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-white/[0.03] text-sm hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 text-white/50 font-mono">#{String(o.id).padStart(4, "0")}</td>
                  <td className="py-3 text-white/80 font-medium">{o.customerName}</td>
                  <td className="py-3 text-white font-mono">{o.total.toLocaleString("en")} JD</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "completed" || o.status === "مكتمل" ? "bg-green-500/15 text-green-400" : o.status === "cancelled" || o.status === "ملغي" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-white/40 text-xs">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}