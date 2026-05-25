import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Download, RefreshCw, Loader2, ChevronDown, Plus, X, Eye, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { adminApi, type AdminOrder } from "@/lib/api";
import OrderDetailModal from "@/components/OrderDetailModal";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/i18n/context";

const statusKeyMap: Record<string, string> = {
  pending: "معلق",
  shipped: "قيد الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusStyles: Record<string, string> = {
  "مكتمل": "text-green-400 bg-green-400/10 border-green-400/20",
  "قيد الشحن": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "معلق": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "ملغي": "text-red-400 bg-red-400/10 border-red-400/20",
};

function formatDate(iso: string, t: (key: string) => string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return t("الآن");
    if (diff < 3600) return t("منذ %d دقيقة").replace("%d", String(Math.floor(diff / 60)));
    if (diff < 86400) return t("منذ %d ساعة").replace("%d", String(Math.floor(diff / 3600)));
    if (diff < 172800) return t("أمس");
    return d.toLocaleDateString("ar-JO");
  } catch {
    return iso;
  }
}

function DeleteConfirmModal({ order, onClose, onConfirm, deleting }: { order: AdminOrder; onClose: () => void; onConfirm: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6 border border-white/10" style={{ background: "linear-gradient(135deg, rgba(20,20,20,0.98), rgba(10,10,10,0.98))" }}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/15 border border-red-500/30">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">حذف الطلب</h2>
            <p className="text-white/50 text-sm mt-2">هل أنت متأكد من حذف الطلب #{String(order.id).padStart(4, "0")}؟</p>
            <p className="text-white/30 text-xs mt-1">العميل: {order.customerName} — {order.total.toLocaleString("en")} JD</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button onClick={onClose} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition-all disabled:opacity-50">
              إلغاء
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "rgba(220,38,38,0.85)" }}>
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditOrderModal({ order, onClose, onSaved, t }: { order: AdminOrder; onClose: () => void; onSaved: (o: AdminOrder) => void; t: (k: string) => string }) {
  const [customerName, setCustomerName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.phone || "");
  const [address, setAddress] = useState(order.address || "");
  const [total, setTotal] = useState(String(order.total));
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !total) return;
    setLoading(true);
    setError("");
    try {
      const updated = await adminApi.updateOrder(order.id, {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        total: Number(total),
        status,
      });
      onSaved(updated);
      onClose();
    } catch (e: any) {
      setError(e.message || "فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 border border-white/10" style={{ background: "linear-gradient(135deg, rgba(20,20,20,0.98), rgba(10,10,10,0.98))" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-red-400" />
            <h2 className="text-white font-bold text-lg">تعديل الطلب #{String(order.id).padStart(4, "0")}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">العميل *</label>
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50" />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">رقم الهاتف</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">العنوان</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">المبلغ (JD)</label>
              <input required type="number" min="0" step="0.01" value={total} onChange={e => setTotal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50" dir="ltr" />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <option value="pending" style={{ background: "#111" }}>معلق</option>
                <option value="shipped" style={{ background: "#111" }}>قيد الشحن</option>
                <option value="completed" style={{ background: "#111" }}>مكتمل</option>
                <option value="cancelled" style={{ background: "#111" }}>ملغي</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition-all">
              إلغاء
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "rgba(220,38,38,0.85)", boxShadow: "0 0 15px rgba(220,38,38,0.3)" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Edit3 size={16} />}
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddOrderModal({ onClose, onAdded, t }: { onClose: () => void; onAdded: (o: AdminOrder) => void; t: (k: string) => string }) {
  const [customerName, setCustomerName] = useState("");
  const [total, setTotal] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !total) return;
    setLoading(true);
    setError("");
    try {
      const order = await adminApi.createManualOrder(customerName.trim(), Number(total), status);
      onAdded(order);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 border border-white/10"
        style={{ background: "linear-gradient(135deg, rgba(20,20,20,0.98), rgba(10,10,10,0.98))" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{t("إضافة طلب يدوي")}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">{t("العميل")} *</label>
            <input required type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("العميل")}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">{t("المبلغ")} (JD) *</label>
            <input required type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-red-500/50 transition-colors" dir="ltr" />
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">{t("الحالة")}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <option value="pending" style={{ background: "#111" }}>{t("معلق")}</option>
              <option value="shipped" style={{ background: "#111" }}>{t("قيد الشحن")}</option>
              <option value="completed" style={{ background: "#111" }}>{t("مكتمل")}</option>
              <option value="cancelled" style={{ background: "#111" }}>{t("ملغي")}</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-semibold transition-all">
              {t("إلغاء")}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "rgba(220,38,38,0.85)", boxShadow: "0 0 15px rgba(220,38,38,0.3)" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {t("إضافة الطلب")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Orders() {
  const { t } = useLang();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<AdminOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const lastMaxId = useRef(0);
  const { toast } = useToast();

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data);
      setError("");

      if (Array.isArray(data) && data.length > 0) {
        const maxId = data.reduce((max, o) => Math.max(max, o.id), 0);
        if (lastMaxId.current > 0 && maxId > lastMaxId.current) {
          const newOrders = data.filter(o => o.id > lastMaxId.current);
          newOrders.forEach(order => {
            toast({ title: "🛒 طلب جديد", description: `طلب #${String(order.id).padStart(4, "0")} من ${order.customerName} — ${order.total.toLocaleString("en")} JD` });
          });
        }
        lastMaxId.current = maxId;
      }
    } catch (e: any) {
      if (!silent) setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const statusToEn: Record<string, string> = {
    [t("معلق")]: "pending",
    [t("قيد الشحن")]: "shipped",
    [t("مكتمل")]: "completed",
    [t("ملغي")]: "cancelled",
  };

  const handleStatusChange = async (id: number, arStatus: string) => {
    const enStatus = statusToEn[arStatus] || arStatus;
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateOrderStatus(id, enStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      await adminApi.deleteOrder(deleteOrder.id);
      setOrders(prev => prev.filter(o => o.id !== deleteOrder.id));
      setDeleteOrder(null);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const ordersArray = Array.isArray(orders) ? orders : [];
  const filtered = ordersArray.filter((o) =>
    o.customerName.includes(search) ||
    String(o.id).includes(search)
  );

  const totalRevenue = ordersArray.reduce((s, o) => s + o.total, 0);
  const pendingCount = ordersArray.filter((o) => o.status === "pending").length;
  const completedCount = ordersArray.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-6">
      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />

      {showAddModal && (
        <AddOrderModal t={t} onClose={() => setShowAddModal(false)} onAdded={(order) => { setOrders((prev) => [order, ...prev]); fetchOrders(true); }} />
      )}

      {editOrder && (
        <EditOrderModal order={editOrder} t={t} onClose={() => setEditOrder(null)} onSaved={(updated) => {
          setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
        }} />
      )}

      {deleteOrder && (
        <DeleteConfirmModal order={deleteOrder} deleting={deleting} onClose={() => setDeleteOrder(null)} onConfirm={handleDelete} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-2xl font-bold">{t("الطلبات")}</h1>
          <span className="text-white/30 text-sm">({orders.length})</span>
          <button onClick={() => fetchOrders()} title={t("تحديث")}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgba(220,38,38,0.85)", boxShadow: "0 0 15px rgba(220,38,38,0.3)" }}>
            <Plus size={15} />{t("طلب يدوي")}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("إجمالي الطلبات"), value: orders.length, color: "text-white" },
          { label: t("معلق"), value: pendingCount, color: "text-orange-400" },
          { label: t("مكتمل"), value: completedCount, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card py-3 text-center">
            <p className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "'Orbitron', monospace" }}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/25 text-red-400 text-sm"
          style={{ background: "rgba(220,38,38,0.08)" }}>⚠️ {error}</div>
      )}

      {/* Table */}
      <div className="stat-card">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-white/30" />
            <input type="search" placeholder={t("البحث في الطلبات...")}
              className="w-full bg-white/5 border border-white/8 rounded-xl py-2 pl-8 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/40 transition-colors"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 size={24} className="animate-spin text-red-500" />
            <span className="text-white/40 text-sm">{t("جارٍ تحميل الطلبات...")}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[t("رقم الطلب"), t("العميل"), t("المبلغ"), t("الحالة"), t("تغيير الحالة"), t("التاريخ"), "", ""].map((h) => (
                    <th key={h} className="text-right text-white/35 font-medium text-xs pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const arStatus = t(statusKeyMap[order.status] || order.status);
                  return (
                    <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2">
                        <span className="text-red-400 font-mono text-xs font-semibold">
                          #{String(order.id).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button onClick={() => setDetailOrder(order)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))" }}>
                            {order.customerName?.[0] || "?"}
                          </div>
                          <span className="text-white/80 text-xs font-medium">{order.customerName}</span>
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-white font-bold text-xs" style={{ fontFamily: "'Orbitron', monospace" }}>
                          {order.total.toLocaleString("en")} JD
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyles[arStatus] || "text-white/50"}`}>
                          {arStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="relative">
                          {updatingId === order.id ? (
                            <Loader2 size={14} className="animate-spin text-red-400" />
                          ) : (
                            <div className="relative inline-block">
                              <select value={arStatus} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-red-500/40 cursor-pointer pr-5"
                                style={{ background: "rgba(255,255,255,0.05)" }}>
                                {[t("معلق"), t("قيد الشحن"), t("مكتمل"), t("ملغي")].map((s) => (
                                  <option key={s} value={s} style={{ background: "#111" }}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={10} className="absolute top-1/2 -translate-y-1/2 left-1.5 text-white/30 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-white/35 text-xs">{formatDate(order.createdAt, t)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditOrder(order)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="تعديل">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => setDeleteOrder(order)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="حذف">
                            <Trash2 size={14} />
                          </button>
                          <button onClick={() => setDetailOrder(order)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"
                            title={t("عرض التفاصيل")}>
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-white/30 text-sm">
                      {search ? t("لا توجد نتائج") : t("لا توجد طلبات حتى الآن")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-white/30 text-xs">{t("إجمالي الإيرادات")}</span>
            <span className="text-white font-bold text-sm" style={{ fontFamily: "'Orbitron', monospace" }}>
              {totalRevenue.toLocaleString("en")} JD
            </span>
          </div>
        )}
      </div>
    </div>
  );
}