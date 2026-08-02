import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// Defines which status transitions are actually offered as buttons —
// mirrors the backend's own guard (can't change a COMPLETED or
// CANCELLED order), so we don't even show actions that would 400.
const nextStatusOptions = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canUpdateStatus = hasRole("ADMIN", "MANAGER");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrder() {
    setLoading(true);
    try {
      const res = await api.get(`/sales-orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    setError("");
    try {
      const res = await api.put(`/sales-orders/${id}/status`, { status: newStatus });
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading order...</p>;
  if (error && !order) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <button
        onClick={() => navigate("/sales-orders")}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Sales Orders
      </button>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-medium text-gray-900">{order.customer.name}</p>
            {order.customer.email && <p className="text-gray-500">{order.customer.email}</p>}
          </div>
          <div>
            <p className="text-gray-500">Total Amount</p>
            <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Product</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">SKU</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">Price</th>
                <th className="text-right px-3 py-2 font-medium text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-gray-900">{item.product.name}</td>
                  <td className="px-3 py-2 text-gray-500">{item.product.sku}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-gray-600">₹{item.priceAtSale}</td>
                  <td className="px-3 py-2 text-right text-gray-900 font-medium">
                    ₹{(Number(item.priceAtSale) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}

        {canUpdateStatus && nextStatusOptions[order.status].length > 0 && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            {nextStatusOptions[order.status].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${
                  status === "CANCELLED"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {updating ? "Updating..." : `Mark as ${status}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}