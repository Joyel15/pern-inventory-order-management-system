import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SupplierFormModal from "../components/SupplierFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Suppliers() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

  async function fetchSuppliers(page = 1) {
    setLoading(true);
    try {
      const res = await api.get("/suppliers", { params: { page, search } });
      setSuppliers(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuppliers(1);
  }, [search]);

  function openCreateModal() {
    setEditingSupplier(null);
    setModalOpen(true);
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier);
    setModalOpen(true);
  }

  async function handleSaved() {
    setModalOpen(false);
    fetchSuppliers(pagination.page);
  }

  async function handleDelete() {
    await api.delete(`/suppliers/${deletingSupplier.id}`);
    setDeletingSupplier(null);
    fetchSuppliers(pagination.page);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Supplier
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search suppliers..."
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
                Contact Person
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Phone
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
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.contactPerson || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone || "—"}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(s)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingSupplier(s)}
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
                onClick={() => fetchSuppliers(p)}
                className={`px-3 py-1 rounded-md text-sm ${p === pagination.page ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {modalOpen && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingSupplier && (
        <ConfirmDialog
          title="Delete supplier?"
          message={`Are you sure you want to delete "${deletingSupplier.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingSupplier(null)}
        />
      )}
    </div>
  );
}
