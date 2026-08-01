import { useState, useEffect } from "react";
import api from "../services/api";

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

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const { summary, recentOrders, lowStockProducts, topSellingProducts } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard label="Products" value={summary.totalProducts} />
        <SummaryCard label="Categories" value={summary.totalCategories} />
        <SummaryCard label="Customers" value={summary.totalCustomers} />
        <SummaryCard label="Suppliers" value={summary.totalSuppliers} />
        <SummaryCard
          label="Low Stock"
          value={summary.lowStockCount}
          highlight={summary.lowStockCount > 0}
        />
        <SummaryCard
          label="Revenue"
          value={`₹${Number(summary.totalRevenue).toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
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
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Low Stock Alerts
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing running low</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {product.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top selling products */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Selling Products
        </h2>
        {topSellingProducts.length === 0 ? (
          <p className="text-sm text-gray-500">No sales data yet</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {topSellingProducts.map((item) => (
              <li
                key={item.product.id}
                className="py-3 flex justify-between items-center"
              >
                <p className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </p>
                <p className="text-sm text-gray-600">
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

function SummaryCard({ label, value, highlight }) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-4 ${highlight ? "border border-red-200" : ""}`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${highlight ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
