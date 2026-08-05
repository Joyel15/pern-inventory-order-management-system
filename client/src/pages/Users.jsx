import { useState } from "react";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import UserEditModal from "../components/UserEditModal";
import { Search, Pencil, UserX, UserCheck, UserCog } from "lucide-react";

const roleColors = {
  ADMIN: "bg-indigo-50 text-indigo-700",
  MANAGER: "bg-sky-50 text-sky-700",
  STAFF: "bg-slate-100 text-slate-600",
};

export default function Users() {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const {
    items: users,
    pagination,
    loading,
    fetchItems: fetchUsers,
  } = usePaginatedResource("/users", { search });

  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  async function handleSaved() {
    setEditingUser(null);
    fetchUsers(pagination.page);
  }

  async function handleDeactivate(user) {
    setError("");
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate user");
    }
  }

  async function handleReactivate(user) {
    setError("");
    try {
      await api.put(`/users/${user.id}`, { isActive: true });
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reactivate user");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage accounts and access levels for your team
        </p>
      </div>

      <div className="relative w-full sm:max-w-sm">
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

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UserCog size={28} strokeWidth={1.5} />
                    <p className="text-sm">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        {u.name}
                        {isSelf && (
                          <span className="text-xs text-slate-400 font-normal">(you)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          roleColors[u.role] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        {!isSelf && u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u)}
                            className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            aria-label={`Deactivate ${u.name}`}
                          >
                            <UserX size={15} />
                          </button>
                        )}
                        {!isSelf && !u.isActive && (
                          <button
                            onClick={() => handleReactivate(u)}
                            className="p-1.5 rounded-md text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            aria-label={`Reactivate ${u.name}`}
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
                onClick={() => fetchUsers(p)}
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

      {editingUser && (
        <UserEditModal
          user={editingUser}
          isSelf={editingUser.id === currentUser.id}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}