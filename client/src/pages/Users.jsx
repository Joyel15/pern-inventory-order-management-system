import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import UserEditModal from "../components/UserEditModal";

export default function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  async function fetchUsers(page = 1) {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { page, search } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1);
  }, [search]);

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
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

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
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.name}{" "}
                      {isSelf && (
                        <span className="text-xs text-gray-400">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      {!isSelf && u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Deactivate
                        </button>
                      )}
                      {!isSelf && !u.isActive && (
                        <button
                          onClick={() => handleReactivate(u)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
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
                onClick={() => fetchUsers(p)}
                className={`px-3 py-1 rounded-md text-sm ${p === pagination.page ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
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
