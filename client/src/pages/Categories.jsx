import { useState, useEffect } from "react";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CategoryFormModal from "../components/CategoryFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Categories() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [search, setSearch] = useState("");
  const {
    items: categories,
    pagination,
    loading,
    fetchItems: fetchCategories,
  } = usePaginatedResource("/categories", { search });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  function openCreateModal() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  async function handleSaved() {
    setModalOpen(false);
    fetchCategories(pagination.page);
  }

  async function handleDelete() {
    await api.delete(`/categories/${deletingCategory.id}`);
    setDeletingCategory(null);
    fetchCategories(pagination.page);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Category
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Description
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
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cat.description || "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
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
                onClick={() => fetchCategories(p)}
                className={`px-3 py-1 rounded-md text-sm ${
                  p === pagination.page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingCategory && (
        <ConfirmDialog
          title="Delete category?"
          message={`Are you sure you want to delete "${deletingCategory.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </div>
  );
}
