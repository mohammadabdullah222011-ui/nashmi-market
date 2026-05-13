import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Globe, Bell, Shield, Palette, RefreshCw, Instagram, Facebook, Eye, EyeOff } from "lucide-react";
import { useLang } from "@/i18n/context";
import { adminApi, type AdminSettings } from "@/lib/api";
import { SiDiscord } from "react-icons/si";

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

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const [local, setLocal] = useState<LocalSettings>(loadLocalSettings);
  const [saved, setSaved] = useState(false);
  const [social, setSocial] = useState({ instagram: "", facebook: "", discord: "", showInstagram: true, showFacebook: true, showDiscord: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSettings().then(s => {
      setSocial({
        instagram: s.instagram || "",
        facebook: s.facebook || "",
        discord: s.discord || "",
        showInstagram: s.showInstagram !== 0,
        showFacebook: s.showFacebook !== 0,
        showDiscord: s.showDiscord !== 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
        discord: social.discord,
        showInstagram: social.showInstagram ? 1 : 0,
        showFacebook: social.showFacebook ? 1 : 0,
        showDiscord: social.showDiscord ? 1 : 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("فشل حفظ الإعدادات");
    }
  };

  const SocialToggle = ({ label, icon: Icon, color, value, onChange }: { label: string; icon: any; color: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-3">
      <Icon size={18} className={`${color} shrink-0`} />
      <input type="text" placeholder={`رابط ${label}`}
        value={value as any} disabled={loading}
        onChange={(e) => {}}
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 opacity-30 cursor-not-allowed" />
    </div>
  );

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
          { icon: Bell, label: t("الإشعارات"), desc: t("إشعارات الطلبات الجديدة"), type: "toggle", value: local.notifications, onChange: () => toggle("notifications") },
          { icon: Shield, label: t("المصادقة"), desc: t("مصادقة ثنائية (2FA)"), type: "toggle", value: local.twoFactor, onChange: () => toggle("twoFactor") },
          { icon: Palette, label: t("المظهر"), desc: t("داكن - الوضع الليلي"), type: "toggle", value: local.darkMode, onChange: () => toggle("darkMode") },
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
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Instagram size={18} className="text-pink-400 shrink-0" />
              <input type="text" placeholder="رابط Instagram"
                value={social.instagram} disabled={loading}
                onChange={(e) => setSocial(p => ({ ...p, instagram: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" />
              <button onClick={() => setSocial(p => ({ ...p, showInstagram: !p.showInstagram }))}
                className={`p-2 rounded-lg border transition-colors ${social.showInstagram ? "border-green-500/40 text-green-400" : "border-white/10 text-white/30"}`}
                title={social.showInstagram ? "ظهر" : "مخفي"}>
                {social.showInstagram ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Facebook size={18} className="text-blue-400 shrink-0" />
              <input type="text" placeholder="رابط Facebook"
                value={social.facebook} disabled={loading}
                onChange={(e) => setSocial(p => ({ ...p, facebook: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" />
              <button onClick={() => setSocial(p => ({ ...p, showFacebook: !p.showFacebook }))}
                className={`p-2 rounded-lg border transition-colors ${social.showFacebook ? "border-green-500/40 text-green-400" : "border-white/10 text-white/30"}`}
                title={social.showFacebook ? "ظهر" : "مخفي"}>
                {social.showFacebook ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <SiDiscord size={18} className="text-indigo-400 shrink-0" />
              <input type="text" placeholder="رابط Discord"
                value={social.discord} disabled={loading}
                onChange={(e) => setSocial(p => ({ ...p, discord: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" />
              <button onClick={() => setSocial(p => ({ ...p, showDiscord: !p.showDiscord }))}
                className={`p-2 rounded-lg border transition-colors ${social.showDiscord ? "border-green-500/40 text-green-400" : "border-white/10 text-white/30"}`}
                title={social.showDiscord ? "ظهر" : "مخفي"}>
                {social.showDiscord ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}