import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Search, Pencil, Trash2, PackageX } from "lucide-react";

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
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your product catalog and stock levels
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Product
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
          placeholder="Search products..."
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
                SKU
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Category
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Price
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Stock
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
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <PackageX size={28} strokeWidth={1.5} />
                    <p className="text-sm">No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">₹{p.price}</td>
                  <td className="px-4 py-3">
                    {p.quantity <= 10 ? (
                      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-rose-50 text-rose-600">
                        {p.quantity} left
                      </span>
                    ) : (
                      <span className="text-slate-600">{p.quantity}</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          aria-label={`Delete ${p.name}`}
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
                onClick={() => fetchProducts(p)}
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
