import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Products() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "MANAGER");

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  async function fetchProducts(page = 1) {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { page, search } });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts(1);
  }, [search]);

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleSaved() {
    setModalOpen(false);
    fetchProducts(pagination.page);
  }

  async function handleDelete() {
    await api.delete(`/products/${deletingProduct.id}`);
    setDeletingProduct(null);
    fetchProducts(pagination.page);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Product
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search products..."
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
                SKU
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Category
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Price
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Stock
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.quantity <= 10
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {p.quantity}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
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
                onClick={() => fetchProducts(p)}
                className={`px-3 py-1 rounded-md text-sm ${p === pagination.page ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingProduct && (
        <ConfirmDialog
          title="Delete product?"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  );
}
