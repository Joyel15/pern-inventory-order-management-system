import { useState } from "react";
import { Link } from "react-router-dom";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import { useAuth } from "../context/AuthContext";
import SalesOrderFormModal from "../components/SalesOrderFormModal";
import { Plus, ShoppingCart, ChevronRight } from "lucide-react";

const statusColors = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

export default function SalesOrders() {
  const { hasRole } = useAuth();
  const canCreate = hasRole("ADMIN", "MANAGER", "STAFF");

  const [statusFilter, setStatusFilter] = useState("");
  const {
    items: orders,
    pagination,
    loading,
    fetchItems: fetchOrders,
  } = usePaginatedResource("/sales-orders", {
    status: statusFilter || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreated() {
    setModalOpen(false);
    fetchOrders(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track orders placed by your customers
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            <Plus size={16} />
            New Order
          </button>
        )}
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="PROCESSING">Processing</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Order #
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Total
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Date
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">
                View
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ShoppingCart size={28} strokeWidth={1.5} />
                    <p className="text-sm">No orders found</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.customer.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/sales-orders/${order.id}`}
                      className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => fetchOrders(p)}
                className={`h-8 min-w-8 px-2 rounded-md text-sm font-medium transition-colors ${
                  p === pagination.page
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {modalOpen && (
        <SalesOrderFormModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}