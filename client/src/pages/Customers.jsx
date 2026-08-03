import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CustomerFormModal from "../components/CustomerFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";

export default function Customers() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  async function fetchCustomers(page = 1) {
    setLoading(true);
    try {
      const res = await api.get("/customers", { params: { page, search } });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers(1);
  }, [search]);

  function openCreateModal() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  async function handleSaved() {
    setModalOpen(false);
    fetchCustomers(pagination.page);
  }

  async function handleDelete() {
    await api.delete(`/customers/${deletingCustomer.id}`);
    setDeletingCustomer(null);
    fetchCustomers(pagination.page);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            People and businesses you sell to
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Customer
          </button>
        )}
      </div>

      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Phone
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Address
              </th>
              {canManage && (
                <th className="text-right px-4 py-3 font-medium text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Users size={28} strokeWidth={1.5} />
                    <p className="text-sm">No customers found</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {c.address || "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => fetchCustomers(p)}
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
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingCustomer && (
        <ConfirmDialog
          title="Delete customer?"
          message={`Are you sure you want to delete "${deletingCustomer.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCustomer(null)}
        />
      )}
    </div>
  );
}