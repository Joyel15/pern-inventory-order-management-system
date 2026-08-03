import { useState, useEffect } from "react";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SupplierFormModal from "../components/SupplierFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";

export default function Suppliers() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [search, setSearch] = useState("");
  const {
    items: suppliers,
    pagination,
    loading,
    fetchItems: fetchSuppliers,
  } = usePaginatedResource("/suppliers", { search });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

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
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Vendors you purchase stock from
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Supplier
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
          placeholder="Search suppliers..."
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
                Contact Person
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Phone
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
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Truck size={28} strokeWidth={1.5} />
                    <p className="text-sm">No suppliers found</p>
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {s.contactPerson || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.phone || "—"}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingSupplier(s)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          aria-label={`Delete ${s.name}`}
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
                onClick={() => fetchSuppliers(p)}
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