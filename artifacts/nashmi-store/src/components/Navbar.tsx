import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User, LogOut, Settings, LayoutDashboard, Shield, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import CartDrawer from "@/components/CartDrawer";
import EditProfileModal from "@/components/EditProfileModal";

const logoImg = `${import.meta.env.BASE_URL}logo-nashmi.png`;

function getAdminUrl() {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ADMIN_URL : undefined;
  if (envUrl) return envUrl;
  const apiUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined;
  if (apiUrl) {
    const parts = apiUrl.replace(/\/api\/?$/, '').split(':');
    if (parts.length >= 2) {
      const port = parseInt(parts[parts.length - 1]);
      return `http://localhost:${port + 1}`;
    }
  }
  return 'https://nashmi-market-nashmi-admin.vercel.app';
}

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/categories", label: "الفئات" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-nav-${link.label}`}
                  className={`text-sm font-semibold transition-all duration-200 hover:text-red-500 relative group ${
                    location === link.href ? "text-red-500" : "text-white/80"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500 transition-transform duration-200 origin-right ${
                      location === link.href
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-hover:origin-left"
                    }`}
                  />
                </Link>
              ))}
              {user && (
                <Link
                  href="/my-orders"
                  data-testid="link-nav-طلباتي"
                  className={`text-sm font-semibold transition-all duration-200 hover:text-red-500 relative group ${
                    location === "/my-orders" ? "text-red-500" : "text-white/80"
                  }`}
                >
                  طلباتي
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500 transition-transform duration-200 origin-right ${
                      location === "/my-orders"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-hover:origin-left"
                    }`}
                  />
                </Link>
              )}
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center" data-testid="link-logo">
              <img
                src={logoImg}
                alt="نشمي سوق"
                className="h-10 w-auto object-contain"
                style={{ filter: "drop-shadow(0 0 8px rgba(220,38,38,0.5))" }}
              />
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                /* Logged-in user avatar + dropdown */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/40 hover:bg-red-600/5 transition-all duration-200"
                    data-testid="button-user-menu"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold relative"
                      style={{ background: "linear-gradient(135deg, #dc2626, #7f1d1d)", boxShadow: "0 0 10px rgba(220,38,38,0.4)" }}
                    >
                      {user.avatar}
                      {isAdmin && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                          style={{ background: "#dc2626", border: "1.5px solid #0a0a0a" }}
                        >
                          <Shield size={6} className="text-white" />
                        </span>
                      )}
                    </div>
                    <span className="text-white/80 text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    <X
                      size={12}
                      className={`text-white/30 transition-transform duration-200 ${profileOpen ? "rotate-0" : "rotate-45"}`}
                    />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute left-0 top-12 w-56 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                      style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)" }}
                    >
                      {/* User info header */}
                      <div
                        className="px-4 py-3.5 border-b border-white/8"
                        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.08), transparent)" }}
                      >
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-blue-300 bg-blue-500/10 border border-blue-500/20"
                          }`}
                        >
                          {isAdmin ? <><Shield size={8} /> مدير النظام</> : <><User size={8} /> مستخدم</>}
                        </span>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <button
                          onClick={() => { setEditOpen(true); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-right"
                          data-testid="button-edit-profile"
                        >
                          <Settings size={15} className="text-white/40" />
                          تعديل الملف الشخصي
                        </button>

                        <button
                          onClick={() => { navigate("/my-orders"); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-right"
                        >
                          <Package size={15} className="text-white/40" />
                          طلباتي
                        </button>

                        {/* Admin Panel link — admins only */}
                        {isAdmin && (
                          <a
                            href={getAdminUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-1"
                            onClick={() => setProfileOpen(false)}
                            data-testid="link-admin-panel"
                          >
                            <LayoutDashboard size={15} />
                            لوحة الإدارة
                          </a>
                        )}

                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                            data-testid="button-logout"
                          >
                            <LogOut size={15} />
                            تسجيل الخروج
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" data-testid="link-login">
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-red-600/40 text-red-400 hover:bg-red-600/10 hover:border-red-500 transition-all duration-200 text-sm font-semibold">
                    <User size={16} />
                    <span>دخول</span>
                  </button>
                </Link>
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-lg border border-white/10 text-white/80 hover:text-white hover:border-red-500/50 hover:bg-red-600/10 transition-all duration-200"
                data-testid="button-cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: "#dc2626", boxShadow: "0 0 10px rgba(220,38,38,0.6)" }}
                    data-testid="text-cart-count"
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t border-white/5"
            style={{ background: "rgba(10,10,10,0.98)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location === link.href
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                  data-testid={`link-mobile-nav-${link.label}`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/my-orders"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location === "/my-orders"
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  طلباتي
                </Link>
              )}

              {user ? (
                <>
                  <button
                    onClick={() => { setEditOpen(true); setMobileOpen(false); }}
                    className="mt-2 px-4 py-3 rounded-lg border border-white/10 text-white/70 text-sm font-semibold text-right flex items-center gap-2 hover:bg-white/5 transition-all"
                  >
                    <Settings size={15} />
                    تعديل الملف الشخصي
                  </button>
                  <button
                    onClick={() => { navigate("/my-orders"); setMobileOpen(false); }}
                    className="px-4 py-3 rounded-lg border border-white/10 text-white/70 text-sm font-semibold text-right flex items-center gap-2 hover:bg-white/5 transition-all"
                  >
                    <Package size={15} />
                    طلباتي
                  </button>
                  {isAdmin && (
                    <a
                      href={getAdminUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-lg border border-red-600/30 text-red-400 text-sm font-semibold flex items-center gap-2 hover:bg-red-600/10 transition-all"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      لوحة الإدارة
                    </a>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="px-4 py-3 rounded-lg text-white/50 text-sm font-semibold text-right flex items-center gap-2 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut size={15} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-4 py-3 rounded-lg border border-red-600/40 text-red-400 text-sm font-semibold text-center hover:bg-red-600/10 transition-all"
                  data-testid="link-mobile-login"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

      {/* Close dropdown on outside click */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
