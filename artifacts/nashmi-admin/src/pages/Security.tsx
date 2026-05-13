import { useState, useEffect } from "react";
import { Shield, UserCheck, ShoppingCart, Smartphone, RefreshCw, Calendar, Mail } from "lucide-react";
import { useLang } from "@/i18n/context";
import { adminApi, type AdminUser } from "@/lib/api";

const SETTINGS_KEY = "nashmi_admin_settings";

export default function Security() {
  const { t } = useLang();
  const [twoFactor, setTwoFactor] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return s.twoFactor === true;
    } catch { return false; }
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.getUsers()]).then(([d, u]) => {
      setStats(d);
      setUsers(u);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
            <Shield size={16} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">{t("الأمان")}</h1>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 border border-white/10 hover:text-white transition-all">
          <RefreshCw size={14} />{t("تحديث")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("المستخدمون المسجلون"), value: String(stats.totalUsers), icon: UserCheck },
          { label: t("إجمالي الطلبات"), value: String(stats.totalOrders), icon: ShoppingCart },
          { label: t("المصادقة الثنائية"), value: twoFactor ? t("مفعلة") : t("غير مفعلة"), icon: Smartphone },
          { label: t("المسؤولون"), value: String(users.filter(u => u.role === "admin").length), icon: Shield },
        ].map((s) => (
          <div key={s.label} className="stat-card py-4 text-center">
            <s.icon size={18} className="text-red-400 mx-auto mb-2" />
            <p className={`text-white font-bold text-lg ${s.label === t("المصادقة الثنائية") ? (twoFactor ? "text-green-400" : "text-white/50") : ""}`} style={{ fontFamily: "'Orbitron', monospace" }}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="stat-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
            <Smartphone size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{t("المصادقة الثنائية")}</p>
            <p className="text-white/40 text-xs">
              {twoFactor ? t("مفعلة — رمز تحقق إضافي مطلوب عند تسجيل الدخول") : t("غير مفعلة — يمكن تفعيلها من صفحة الإعدادات")}
            </p>
          </div>
        </div>
        <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${twoFactor ? "text-green-400 bg-green-500/10 border border-green-500/30" : "text-white/40 bg-white/5 border border-white/10"}`}>
          {twoFactor ? t("مفعلة") : t("غير مفعلة")}
        </div>
      </div>

      <div className="stat-card p-5">
        <h2 className="text-white font-bold text-sm mb-4">{t("المستخدمون")}</h2>
        {loading ? (
          <p className="text-white/30 text-sm text-center py-4">جارٍ التحميل...</p>
        ) : users.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">لا يوجد مستخدمون</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-white/30 text-xs border-b border-white/[0.06]">
                  <th className="pb-3 font-medium">الاسم</th>
                  <th className="pb-3 font-medium">البريد</th>
                  <th className="pb-3 font-medium">الصلاحية</th>
                  <th className="pb-3 font-medium">الطلبات</th>
                  <th className="pb-3 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.03] text-sm hover:bg-white/[0.01]">
                    <td className="py-3 text-white/80 font-medium">{u.name}</td>
                    <td className="py-3 text-white/50 text-xs font-mono" dir="ltr">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"}`}>
                        {u.role === "admin" ? "مدير" : "مستخدم"}
                      </span>
                    </td>
                    <td className="py-3 text-white/60 font-mono text-xs">{u.orderCount}</td>
                    <td className="py-3 text-white/40 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-JO") : "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}