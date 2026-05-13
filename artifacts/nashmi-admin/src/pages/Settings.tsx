import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Globe, Bell, Shield, Palette, RefreshCw, Instagram, Facebook } from "lucide-react";

import { useLang } from "@/i18n/context";
import { adminApi, type AdminSettings } from "@/lib/api";

const SETTINGS_KEY = "nashmi_admin_settings";

interface LocalSettings {
  notifications: boolean;
  twoFactor: boolean;
  darkMode: boolean;
}

function loadLocalSettings(): LocalSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || { notifications: true, twoFactor: false, darkMode: true };
  } catch {
    return { notifications: true, twoFactor: false, darkMode: true };
  }
}

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const [local, setLocal] = useState<LocalSettings>(loadLocalSettings);
  const [saved, setSaved] = useState(false);
  const [social, setSocial] = useState({ instagram: "", facebook: "", showInstagram: true, showFacebook: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSettings().then(s => {
      setSocial({
        instagram: s.instagram || "",
        facebook: s.facebook || "",
        showInstagram: s.showInstagram !== 0,
        showFacebook: s.showFacebook !== 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyTheme(local.darkMode);
  }, [local.darkMode]);

  const toggle = (key: keyof LocalSettings) => {
    const next = { ...local, [key]: !local[key] };
    setLocal(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const handleSave = async () => {
    try {
      await adminApi.updateSettings({
        instagram: social.instagram,
        facebook: social.facebook,
        showInstagram: social.showInstagram ? 1 : 0,
        showFacebook: social.showFacebook ? 1 : 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("فشل حفظ الإعدادات");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
            <SettingsIcon size={16} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">{t("الإعدادات")}</h1>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "rgba(220,38,38,0.85)", boxShadow: "0 0 15px rgba(220,38,38,0.3)" }}>
          {saved ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? t("تم الحفظ!") : t("حفظ الإعدادات")}
        </button>
      </div>

      <div className="space-y-4">
        {[
          { icon: Globe, label: t("اللغة"), desc: t("Arabic (الأردن)"), type: "select", value: lang, onChange: (v: string) => setLang(v as "ar" | "en"), options: [{ label: t("العربية"), value: "ar" }, { label: t("English"), value: "en" }] },
          { icon: Bell, label: t("الإشعارات"), desc: t(local.notifications ? "تفعيل إشعارات الطلبات والرسائل الجديدة" : "إيقاف الإشعارات — لن يتم جلب الإشعارات"), type: "toggle", value: local.notifications, onChange: () => toggle("notifications") },
          { icon: Shield, label: t("المصادقة الثنائية"), desc: t(local.twoFactor ? "مفعلة — رمز تحقق إضافي مطلوب عند تسجيل الدخول" : "غير مفعلة — يوصى بتفعيلها لحماية إضافية"), type: "toggle", value: local.twoFactor, onChange: () => toggle("twoFactor") },
          { icon: Palette, label: t("المظهر"), desc: t(local.darkMode ? "داكن - الوضع الليلي" : "فاتح - الوضع النهاري"), type: "toggle", value: local.darkMode, onChange: () => toggle("darkMode") },
        ].map((s: any) => (
          <div key={s.label} className="stat-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
                <s.icon size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-white/40 text-xs">{s.desc}</p>
              </div>
            </div>
            {s.type === "select" ? (
              <select value={s.value} onChange={(e) => s.onChange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                {s.options?.map((o: any) => <option key={o.value} value={o.value} style={{ background: "#111" }}>{o.label}</option>)}
              </select>
            ) : (
              <button type="button" onClick={s.onChange}
                className={`w-10 h-5 rounded-full relative transition-colors ${s.value ? "bg-red-500/60" : "bg-white/10"}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${s.value ? "right-5" : "right-0.5"}`} />
              </button>
            )}
          </div>
        ))}

        <div className="stat-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">{t("روابط التواصل الاجتماعي")}</h3>
          <div className="space-y-4">
            {[
              { key: "instagram", icon: Instagram, color: "text-pink-400", label: "Instagram", showKey: "showInstagram" as const },
              { key: "facebook", icon: Facebook, color: "text-blue-400", label: "Facebook", showKey: "showFacebook" as const },
            ].map(({ key, icon: Icon, color, label, showKey }) => (
              <div key={key} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSocial(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${social[showKey] ? "bg-red-500/60" : "bg-white/10"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${social[showKey] ? "right-[18px]" : "right-0.5"}`} />
                </button>
                <Icon size={18} className={`${color} shrink-0`} />
                <input type="text" placeholder={`رابط ${label}`}
                  value={(social as any)[key]} disabled={loading || !social[showKey]}
                  onChange={(e) => setSocial(p => ({ ...p, [key]: e.target.value }))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 disabled:opacity-30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}