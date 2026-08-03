import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import api from "../services/api";

export default function PurchaseOrderFormModal({ onClose, onCreated }) {
  const [serverError, setServerError] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      supplierId: "",
      items: [{ productId: "", quantity: 1, cost: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    async function fetchOptions() {
      const [supRes, prodRes] = await Promise.all([
        api.get("/suppliers", { params: { limit: 100 } }),
        api.get("/products", { params: { limit: 100 } }),
      ]);
      setSuppliers(supRes.data.data);
      setProducts(prodRes.data.data);
    }
    fetchOptions();
  }, []);

  const watchedItems = watch("items");
  const estimatedTotal = watchedItems.reduce((sum, item) => {
    const cost = Number(item.cost) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + cost * qty;
  }, 0);

  async function onSubmit(data) {
    setServerError("");

    const payload = {
      supplierId: Number(data.supplierId),
      items: data.items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        cost: Number(item.cost),
      })),
    };

    try {
      await api.post("/purchase-orders", payload);
      onCreated();
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Purchase Order</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              {...register("supplierId", { required: "Please select a supplier" })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select a supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.supplierId && <p className="text-sm text-red-600 mt-1">{errors.supplierId.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button
                type="button"
                onClick={() => append({ productId: "", quantity: 1, cost: "" })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      {...register(`items.${index}.productId`, { required: "Required" })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Select product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {errors.items?.[index]?.productId && (
                      <p className="text-xs text-red-600 mt-1">{errors.items[index].productId.message}</p>
                    )}
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      {...register(`items.${index}.quantity`, { required: true, min: { value: 1, message: "Min 1" } })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Cost"
                      {...register(`items.${index}.cost`, { required: true, min: { value: 0.01, message: "Min 0.01" } })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-600 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed px-2 py-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right text-sm text-gray-600">
            Estimated total: <span className="font-semibold text-gray-900">₹{estimatedTotal.toFixed(2)}</span>
          </div>

          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{serverError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}