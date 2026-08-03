import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  ClipboardList,
  UserCog,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="10" y="10" width="35" height="35" rx="4" fill="#2563eb" />
      <rect x="55" y="10" width="35" height="35" rx="4" fill="#2563eb" opacity="0.7" />
      <rect x="10" y="55" width="35" height="35" rx="4" fill="#2563eb" opacity="0.7" />
      <rect x="55" y="55" width="35" height="35" rx="4" fill="#2563eb" opacity="0.4" />
    </svg>
  );
}

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/categories", label: "Categories", icon: Tags },
    { to: "/suppliers", label: "Suppliers", icon: Truck },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/sales-orders", label: "Sales Orders", icon: ShoppingCart },
    { to: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
    ...(hasRole("ADMIN") ? [{ to: "/users", label: "Users", icon: UserCog }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-base font-semibold text-white tracking-tight">
              StockFlow
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2 ${
                    isActive
                      ? "bg-indigo-500/10 text-white border-indigo-400"
                      : "text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-100"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-800 -ml-1 p-1"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {user?.role}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}