import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/context";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Security from "@/pages/Security";
import ServerPage from "@/pages/Server";
import NotificationsPage from "@/pages/NotificationsPage";
import MessagesPage from "@/pages/Messages";
import SettingsPage from "@/pages/Settings";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminLoginGate from "@/components/AdminLoginGate";

const queryClient = new QueryClient();

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {isMobile ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="p-0 w-[220px]" style={{ background: "rgba(9,9,9,0.97)" }}>
            <Sidebar collapsed={false} onToggle={() => {}} noToggle />
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      )}
      <Topbar sidebarCollapsed={collapsed} onMenuToggle={isMobile ? () => setMobileOpen(true) : undefined} />

      <main
        className="transition-all duration-300 pt-16 min-h-screen"
        style={{ marginRight: isMobile ? 0 : (collapsed ? "68px" : "220px") }}
      >
        <div className="p-5">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/orders" component={Orders} />
            <Route path="/products" component={Products} />
            <Route path="/users" component={Users} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/reports" component={Reports} />
            <Route path="/security" component={Security} />
            <Route path="/server" component={ServerPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-8xl font-bold text-red-500/20 mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>
                    404
                  </p>
                  <p className="text-white/50 text-sm">الصفحة غير موجودة</p>
                </div>
              </div>
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AdminAuthProvider>
            <AdminLoginGate>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AdminLayout />
              </WouterRouter>
            </AdminLoginGate>
          </AdminAuthProvider>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
