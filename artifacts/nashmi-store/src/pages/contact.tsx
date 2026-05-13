import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react";
import { SiInstagram, SiFacebook } from "react-icons/si";

const DEFAULT_SETTINGS = {
  instagram: "#",
  facebook: "#",
  showInstagram: true,
  showFacebook: true,
};

const API_BASE = (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) || "https://nashmi-market.onrender.com/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [social, setSocial] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSocial({
            instagram: data.instagram || "#",
            facebook: data.facebook || "#",
            showInstagram: data.showInstagram !== 0,
            showFacebook: data.showFacebook !== 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل الإرسال");
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "البريد الإلكتروني", value: "info@nashmi.jo" },
    { icon: Phone, label: "رقم الجوال", value: "+962 79 000 0000" },
    { icon: MapPin, label: "العنوان", value: "عمّان، المملكة الأردنية الهاشمية" },
  ];

  const socialLinks = [
    { href: social.instagram, icon: SiInstagram, show: social.showInstagram, label: "إنستغرام", hoverColor: "hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-600/10" },
    { href: social.facebook, icon: SiFacebook, show: social.showFacebook, label: "فيسبوك", hoverColor: "hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-600/10" },
  ].filter(s => s.show);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            تواصل معنا
          </h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/8"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(220,38,38,0.12)" }}
                >
                  <Icon size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}

            {/* Social */}
            {socialLinks.length > 0 && (
              <div
                className="p-5 rounded-2xl border border-white/8"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">
                  تابعنا
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank" rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/50 ${s.hoverColor} transition-all duration-200`}
                    >
                      <s.icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Hours */}
            <div
              className="p-5 rounded-2xl border border-red-900/20"
              style={{ background: "rgba(220,38,38,0.04)" }}
            >
              <p className="text-red-400 text-sm font-bold mb-3">ساعات الدعم</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">الأحد - الخميس</span>
                  <span className="text-white/80 font-medium">9ص - 6م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">الجمعة - السبت</span>
                  <span className="text-white/80 font-medium">10ص - 4م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div
              className="rounded-3xl p-8 border border-white/8"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                  >
                    <CheckCircle size={40} className="text-green-400" />
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3">تم الإرسال!</h3>
                  <p className="text-white/50">شكراً لتواصلك معنا. سنرد عليك قريباً.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="text-white font-bold text-xl mb-2">أرسل رسالة</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-sm mb-2 font-medium">
                        الاسم
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="اسمك الكريم"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-sm mb-2 font-medium">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="بريدك الإلكتروني"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/50 text-sm mb-2 font-medium">
                      الرسالة
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                      data-testid="input-contact-message"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                  <button
                    type="submit" disabled={sending}
                    className="flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      boxShadow: "0 0 20px rgba(220,38,38,0.4)",
                    }}
                    data-testid="button-contact-submit"
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    {sending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}