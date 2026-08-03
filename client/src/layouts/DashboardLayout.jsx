import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/categories", label: "Categories" },
    { to: "/suppliers", label: "Suppliers" },
    { to: "/customers", label: "Customers" },
    { to: "/sales-orders", label: "Sales Orders" },
    { to: "/purchase-orders", label: "Purchase Orders" },
    ...(hasRole("ADMIN") ? [{ to: "/users", label: "Users" }] : []),
  ];

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile backdrop — only visible when sidebar is open on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slides in/out on mobile, always visible on desktop */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">StockFlow</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center">
          {/* Hamburger button — only shown on mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="text-right hidden sm:block hover:opacity-75"
            >
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </Link>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
