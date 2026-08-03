import { useState, useEffect } from "react";
import api from "../services/api";
import {
  Package,
  Tags,
  Users,
  Truck,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/dashboard");
        setData(res.data.data);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading)
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const { summary, recentOrders, lowStockProducts, topSellingProducts } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your inventory and order activity
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard
          label="Products"
          value={summary.totalProducts}
          icon={Package}
          tint="indigo"
        />
        <SummaryCard
          label="Categories"
          value={summary.totalCategories}
          icon={Tags}
          tint="sky"
        />
        <SummaryCard
          label="Customers"
          value={summary.totalCustomers}
          icon={Users}
          tint="violet"
        />
        <SummaryCard
          label="Suppliers"
          value={summary.totalSuppliers}
          icon={Truck}
          tint="teal"
        />
        <SummaryCard
          label="Low Stock"
          value={summary.lowStockCount}
          icon={AlertTriangle}
          tint="rose"
          alert={summary.lowStockCount > 0}
        />
        <SummaryCard
          label="Revenue"
          value={`₹${Number(summary.totalRevenue).toFixed(2)}`}
          icon={IndianRupee}
          tint="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Orders
            </h2>
            <span className="text-xs text-slate-400">
              {recentOrders.length} orders
            </span>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 px-5 py-6">No orders yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="px-5 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Low Stock Alerts
            </h2>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} items
              </span>
            )}
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500 px-5 py-6">
              Nothing running low
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="px-5 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600">
                    {product.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top selling products */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Top Selling Products
          </h2>
        </div>
        {topSellingProducts.length === 0 ? (
          <p className="text-sm text-slate-500 px-5 py-6">No sales data yet</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {topSellingProducts.map((item, idx) => (
              <li
                key={item.product.id}
                className="px-5 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400 w-4">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-900">
                    {item.product.name}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {item.totalQuantitySold} units sold
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const tintStyles = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

function SummaryCard({ label, value, icon: Icon, tint, alert }) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 ${
        alert ? "border-rose-200" : "border-slate-200"
      }`}
    >
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${tintStyles[tint]}`}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-xl font-semibold mt-0.5 ${
          alert ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-sky-50 text-sky-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        colors[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
