import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ArrowRight, Phone, User, MapPin, CheckCircle, Loader2, CreditCard, DollarSign } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "click">("cash");

  const handleCheckout = async () => {
    if (!user) return;
    if (!customerName.trim()) { setError("يرجى إدخال الاسم"); return; }
    if (!phone.trim()) { setError("يرجى إدخال رقم الهاتف"); return; }
    if (!address.trim()) { setError("يرجى إدخال العنوان"); return; }
    setChecking(true);
    setError("");
    try {
      const result = await api.createOrder(items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })), phone.trim(), customerName.trim(), address.trim(), paymentMethod);
      setLastOrderId(result.id);
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate("/"), 4000);
    } catch (e: any) {
      setError(e.message || "حدث خطأ أثناء الطلب");
    } finally {
      setChecking(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle size={48} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>تم استلام طلبك!</h1>
          {lastOrderId && (
            <p className="text-red-400 font-bold text-xl mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>رقم الطلب: #{String(lastOrderId).padStart(4, "0")}</p>
          )}
          <p className="text-white/50">سيتم التواصل معك قريباً لتأكيد الطلب والتوصيل</p>
          <Link href="/my-orders" className="inline-block mt-4 px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
            عرض طلباتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/" className="hover:text-white/70 transition-colors">الرئيسية</Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-white/60">إتمام الطلب</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-8" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}>إتمام الطلب</h1>

        {!user ? (
          <div className="text-center py-16 rounded-3xl border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-white/60 text-lg mb-4">يجب تسجيل الدخول أولاً لإتمام الطلب</p>
            <Link href="/login">
              <button className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                تسجيل الدخول
              </button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <ShoppingCart size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-4">السلة فارغة</p>
            <Link href="/products">
              <button className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                تصفح المنتجات
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Order Summary */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">المنتجات ({totalItems})</h2>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-4 rounded-2xl border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{product.name}</p>
                    <p className="text-red-400 font-bold mt-1">{product.price.toLocaleString("en")} د.أ</p>
                    <p className="text-white/40 text-sm mt-1">الكمية: {quantity}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold">{(product.price * quantity).toLocaleString("en")} د.أ</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Checkout Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 p-6 space-y-5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h2 className="text-xl font-bold text-white">معلومات التوصيل</h2>

                <div className="relative">
                  <User size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30" />
                  <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم الكامل *"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" />
                </div>

                <div className="relative">
                  <Phone size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30" />
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="رقم الهاتف *"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors"
                    dir="ltr" />
                </div>

                <div className="relative">
                  <MapPin size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30" />
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="العنوان (المدينة، الحي، الشارع) *"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" />
                </div>

                <div>
                  <h3 className="text-white font-bold mb-3">طريقة الدفع</h3>
                  <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "cash" ? "border-red-500/50 bg-red-500/10" : "border-white/10 hover:border-white/20"}`}>
                      <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="hidden" />
                      <DollarSign size={18} className="text-green-400" />
                      <div>
                        <p className="text-white font-semibold text-sm">الدفع عند الاستلام</p>
                        <p className="text-white/40 text-xs">ادفع نقداً عند استلام الطلب</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "click" ? "border-red-500/50 bg-red-500/10" : "border-white/10 hover:border-white/20"}`}>
                      <input type="radio" name="payment" value="click" checked={paymentMethod === "click"} onChange={() => setPaymentMethod("click")} className="hidden" />
                      <CreditCard size={18} className="text-blue-400" />
                      <div>
                        <p className="text-white font-semibold text-sm">تحويل بنكي / كليك</p>
                        <p className="text-white/40 text-xs">حوالة بنكية أو محفظة إلكترونية</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60">المجموع</span>
                    <span className="text-white font-bold text-lg">{totalPrice.toLocaleString("en")} د.أ</span>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button onClick={handleCheckout} disabled={checking}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}>
                  {checking ? <><Loader2 size={18} className="animate-spin" /> جارٍ إرسال الطلب...</> : "تأكيد الطلب"}
                </button>

                <p className="text-white/30 text-xs text-center">سيتم التواصل معك لتأكيد الطلب خلال 24 ساعة</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
