import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Package, ArrowRight, Phone, MapPin, CreditCard, DollarSign, Loader2, Save, X, Eye, Edit3, ChevronDown, ChevronUp, Trash2, Minus, Plus, AlertTriangle } from "lucide-react";
import { api, type ApiOrder } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const statusKeyMap: Record<string, string> = {
  pending: "معلق",
  shipped: "قيد الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  shipped: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function MyOrdersPage() {
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ phone: "", address: "", paymentMethod: "cash" as "cash" | "click" });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [editingItemsId, setEditingItemsId] = useState<number | null>(null);
  const [editItemsForm, setEditItemsForm] = useState<{ product_id: number; quantity: number }[]>([]);
  const [savingItems, setSavingItems] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.myOrders();
      setOrders(data);
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (order: ApiOrder) => {
    setEditingId(order.id);
    setEditForm({ phone: order.phone, address: order.address, paymentMethod: order.paymentMethod as "cash" | "click" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      await api.updateMyOrder(id, editForm);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...editForm } : o));
      setEditingId(null);
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = (id: number) => {
    setCancelConfirmId(id);
  };

  const handleCancelConfirm = async () => {
    if (cancelConfirmId === null) return;
    setCancelling(true);
    try {
      await api.cancelMyOrder(cancelConfirmId);
      setOrders(prev => prev.map(o => o.id === cancelConfirmId ? { ...o, status: "cancelled" } : o));
      setCancelConfirmId(null);
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    } finally {
      setCancelling(false);
    }
  };

  const startEditItems = (order: ApiOrder) => {
    setEditingItemsId(order.id);
    setEditItemsForm(
      (order.items || []).map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );
  };

  const cancelEditItems = () => {
    setEditingItemsId(null);
    setEditItemsForm([]);
  };

  const updateItemQuantity = (productId: number, delta: number) => {
    setEditItemsForm(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const saveEditItems = async () => {
    if (editingItemsId === null) return;
    if (editItemsForm.length === 0) { setError("يجب أن يحتوي الطلب على منتج واحد على الأقل"); return; }
    setSavingItems(true);
    try {
      const updated = await api.updateMyOrderItems(editingItemsId, editItemsForm);
      setOrders(prev => prev.map(o => o.id === editingItemsId ? updated : o));
      setEditingItemsId(null);
      setEditItemsForm([]);
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    } finally {
      setSavingItems(false);
    }
  };

  const toggleExpand = (id: number) => {
    if (editingItemsId === id) return;
    setExpandedId(expandedId === id ? null : id);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/" className="hover:text-white/70 transition-colors">الرئيسية</Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-white/60">طلباتي</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-8" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}>طلباتي</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-red-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-3xl border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-red-400">{error}</p>
            <button onClick={loadOrders} className="mt-4 px-6 py-2 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
              إعادة المحاولة
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Package size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-4">لا توجد طلبات بعد</p>
            <Link href="/products">
              <button className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                تسوق الآن
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                {/* Order header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-right"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.1)" }}>
                      <Package size={22} className="text-red-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">طلب #{String(order.id).padStart(4, "0")}</p>
                      <p className="text-white/40 text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || "text-white/40 border-white/10"}`}>
                      {statusKeyMap[order.status] || order.status}
                    </span>
                    <span className="text-white font-bold">{order.total.toLocaleString("en")} د.أ</span>
                    {expandedId === order.id ? <ChevronUp size={18} className="text-white/30" /> : <ChevronDown size={18} className="text-white/30" />}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === order.id && (
                  <div className="px-5 pb-5 border-t border-white/8 pt-4">
                    {/* Order items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-white/50 text-xs font-medium mb-2">المنتجات</p>
                        {(editingItemsId === order.id ? editItemsForm : order.items).map((item: any, idx: number) => {
                          const origItem = order.items?.[idx];
                          const isEditing = editingItemsId === order.id;
                          return (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                              {origItem?.imageUrl && (
                                <img src={origItem.imageUrl} alt={origItem.name} className="w-12 h-12 object-cover rounded-lg" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{origItem?.name || `منتج #${item.product_id}`}</p>
                                {isEditing ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button onClick={() => updateItemQuantity(item.product_id, -1)}
                                      className="w-7 h-7 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-red-500/30 hover:bg-red-500/10 transition-all flex items-center justify-center">
                                      <Minus size={12} />
                                    </button>
                                    <span className="text-white font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateItemQuantity(item.product_id, 1)}
                                      className="w-7 h-7 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-green-500/30 hover:bg-green-500/10 transition-all flex items-center justify-center">
                                      <Plus size={12} />
                                    </button>
                                    <span className="text-white/40 text-xs mr-2">{(origItem?.price || 0) * item.quantity} د.أ</span>
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-xs">{item.quantity} × {item.price?.toLocaleString?.("en") || 0} د.أ</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {editingItemsId !== order.id && (
                          <p className="text-white/30 text-sm mt-2">المجموع: <span className="text-white font-bold">{order.total.toLocaleString("en")} د.أ</span></p>
                        )}
                      </div>
                    )}

                    {/* Editing items form */}
                    {editingItemsId === order.id ? (
                      <div className="space-y-3 rounded-xl p-4 border border-blue-500/20" style={{ background: "rgba(59,130,246,0.05)" }}>
                        <p className="text-white font-semibold text-sm flex items-center gap-2">
                          <Edit3 size={14} className="text-blue-400" />
                          تعديل المنتجات
                        </p>
                        <div className="flex gap-2">
                          <button onClick={saveEditItems} disabled={savingItems}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
                            {savingItems ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            حفظ
                          </button>
                          <button onClick={cancelEditItems}
                            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:bg-white/5 transition-all">
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : editingId === order.id ? (
                      <div className="space-y-3 rounded-xl p-4 border border-red-500/20" style={{ background: "rgba(220,38,38,0.05)" }}>
                        <p className="text-white font-semibold text-sm flex items-center gap-2">
                          <Edit3 size={14} className="text-red-400" />
                          تعديل معلومات التوصيل
                        </p>
                        <div className="relative">
                          <Phone size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30" />
                          <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="رقم الهاتف"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-9 pl-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20"
                            dir="ltr" />
                        </div>
                        <div className="relative">
                          <MapPin size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/30" />
                          <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            placeholder="العنوان (المدينة، الحي، الشارع)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-9 pl-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20" />
                        </div>
                        <div>
                          <div className="flex gap-2">
                            <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${editForm.paymentMethod === "cash" ? "border-red-500/50 bg-red-500/10" : "border-white/10 hover:border-white/20"}`}>
                              <input type="radio" name="edit-payment" value="cash" checked={editForm.paymentMethod === "cash"}
                                onChange={() => setEditForm({ ...editForm, paymentMethod: "cash" })} className="hidden" />
                              <DollarSign size={16} className="text-green-400" />
                              <span className="text-white text-xs font-semibold">كاش</span>
                            </label>
                            <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${editForm.paymentMethod === "click" ? "border-red-500/50 bg-red-500/10" : "border-white/10 hover:border-white/20"}`}>
                              <input type="radio" name="edit-payment" value="click" checked={editForm.paymentMethod === "click"}
                                onChange={() => setEditForm({ ...editForm, paymentMethod: "click" })} className="hidden" />
                              <CreditCard size={16} className="text-blue-400" />
                              <span className="text-white text-xs font-semibold">تحويل</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => saveEdit(order.id)} disabled={saving}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            حفظ التعديلات
                          </button>
                          <button onClick={cancelEdit}
                            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:bg-white/5 transition-all">
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={13} className="text-white/30" />
                          <span className="text-white/60">{order.phone || "غير متوفر"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={13} className="text-white/30" />
                          <span className="text-white/60">{order.address || "غير متوفر"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {order.paymentMethod === "cash" ? <DollarSign size={13} className="text-green-400" /> : <CreditCard size={13} className="text-blue-400" />}
                          <span className="text-white/60">{order.paymentMethod === "cash" ? "الدفع عند الاستلام" : "تحويل بنكي / كليك"}</span>
                        </div>
                        {order.status === "pending" && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button onClick={() => startEdit(order)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all">
                              <Edit3 size={14} />
                              تعديل التوصيل
                            </button>
                            <button onClick={() => startEditItems(order)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/10 transition-all">
                              <Package size={14} />
                              تعديل المنتجات
                            </button>
                            <button onClick={() => handleCancelClick(order.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400/70 text-sm hover:text-red-400 hover:bg-red-500/8 transition-all">
                              <Trash2 size={14} />
                              إلغاء الطلب
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel confirmation modal */}
        {cancelConfirmId !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setCancelConfirmId(null)}
          >
            <div
              className="w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
              style={{ background: "rgba(10,10,10,0.98)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">إلغاء الطلب</h2>
                <p className="text-white/50 text-sm mb-6">هل أنت متأكد من إلغاء الطلب رقم #{String(cancelConfirmId).padStart(4, "0")}؟</p>
                <div className="flex gap-3">
                  <button onClick={handleCancelConfirm} disabled={cancelling}
                    className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>
                    {cancelling ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    تأكيد الإلغاء
                  </button>
                  <button onClick={() => setCancelConfirmId(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:bg-white/5 transition-all">
                    رجوع
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
