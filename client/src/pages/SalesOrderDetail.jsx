import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, User, Wallet } from "lucide-react";

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
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
      const res = await api.put(`/sales-orders/${id}/status`, {
        status: newStatus,
      });
      setOrder(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading)
    return <p className="text-sm text-slate-500">Loading order...</p>;
  if (error && !order) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <button
        onClick={() => navigate("/sales-orders")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Sales Orders
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Order #{order.id}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
            <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <User size={16} />
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Customer</p>
              <p className="font-medium text-slate-900">
                {order.customer.name}
              </p>
              {order.customer.email && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {order.customer.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet size={16} />
            </div>
            <div className="text-sm">
              <p className="text-slate-500">Total Amount</p>
              <p className="font-medium text-slate-900">₹{order.totalAmount}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Items</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-500">
                    Product
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-slate-500">
                    SKU
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">
                    Qty
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">
                    Price
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-slate-900">
                      {item.product.name}
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {item.product.sku}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      ₹{item.priceAtSale}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-900 font-medium">
                      ₹{(Number(item.priceAtSale) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {canUpdateStatus && nextStatusOptions[order.status].length > 0 && (
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            {nextStatusOptions[order.status].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating}
                className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${
                  status === "CANCELLED"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
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