import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, KeyRound } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account details and password
        </p>
      </div>
      <ProfileInfoForm user={user} />
      <PasswordChangeForm onPasswordChanged={logout} />
    </div>
  );
}

function ProfileInfoForm({ user }) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: user?.name || "", email: user?.email || "" },
  });

  async function onSubmit(data) {
    setServerError("");
    setSuccess(false);
    try {
      await api.put("/profile", data);
      setSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <User size={16} />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">Account Info</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            type="text"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Too short" },
            })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.name && (
            <p className="text-sm text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Please enter a valid email",
              },
            })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.email && (
            <p className="text-sm text-rose-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            Profile updated successfully
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function PasswordChangeForm({ onPasswordChanged }) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    setServerError("");
    try {
      await api.put("/profile/password", data);
      reset();
      // The backend revokes all refresh tokens on password change —
      // so the current session is no longer valid either. Log out
      // immediately and force a fresh login with the new password.
      alert("Password changed successfully. Please log in again.");
      onPasswordChanged();
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
          <KeyRound size={16} />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">
          Change Password
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.currentPassword && (
            <p className="text-sm text-rose-600 mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "Must be at least 6 characters" },
            })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.newPassword && (
            <p className="text-sm text-rose-600 mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}