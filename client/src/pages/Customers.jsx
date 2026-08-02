import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CustomerFormModal from "../components/CustomerFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Customer
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Phone
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Address
              </th>
              {canManage && (
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.address || "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(c)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => fetchCustomers(p)}
                className={`px-3 py-1 rounded-md text-sm ${p === pagination.page ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
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
