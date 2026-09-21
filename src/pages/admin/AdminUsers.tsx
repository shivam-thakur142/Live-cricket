import { useEffect, useState } from "react";
import { UserPlus, Trash2, Shield, Edit3, Eye, KeyRound, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import * as api from "@/services/api";
import type { User, UserRole } from "@/types";

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser] = useState(() => api.getStoredUser());

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("editor");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      toast.toast("Failed to load users: " + (err instanceof Error ? err.message : "Error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRoleValue: UserRole) => {
    try {
      await api.updateUserRole(userId, newRoleValue);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRoleValue } : u)));
      toast.toast("User role updated successfully", "success");
    } catch (err) {
      toast.toast("Failed to update role: " + (err instanceof Error ? err.message : "Error"), "error");
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.toast("You cannot delete your own admin account", "error");
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.toast(`User "${userName}" deleted`, "success");
    } catch (err) {
      toast.toast("Failed to delete user: " + (err instanceof Error ? err.message : "Error"), "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      toast.toast("Please fill in all required fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createUser({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
      });
      setUsers((prev) => [...prev, created]);
      toast.toast(`Created ${newRole} user "${created.name}"`, "success");
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("editor");
    } catch (err) {
      toast.toast("Failed to create user: " + (err instanceof Error ? err.message : "Error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Create and manage accounts for tournament organizers, editors, and staff.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2"
        >
          <UserPlus size={16} />
          <span>Add User / Organizer</span>
        </Button>
      </div>

      {/* Role Explanations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <Shield size={16} />
          </div>
          <div>
            <div className="font-semibold text-xs text-emerald-950 uppercase tracking-wider">Admin</div>
            <div className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Full control over tournaments, teams, scoring, user accounts, and platform settings.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0 mt-0.5">
            <Edit3 size={16} />
          </div>
          <div>
            <div className="font-semibold text-xs text-sky-950 uppercase tracking-wider">Editor (Organizer)</div>
            <div className="text-xs text-sky-800 mt-0.5 leading-relaxed">
              Can create & edit tournaments, teams, players, fixtures, and score live matches.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0 mt-0.5">
            <Eye size={16} />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Viewer</div>
            <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Read-only overview access to view tournament details and matches.
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="table-head">
              <tr>
                <th className="table-cell table-header-cell">User</th>
                <th className="table-cell table-header-cell">Email</th>
                <th className="table-cell table-header-cell">Assigned Role</th>
                <th className="table-cell table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">{u.email}</td>
                    <td className="table-cell">
                      <div className="w-36">
                        <Select
                          value={u.role}
                          options={[
                            { value: "admin", label: "Admin" },
                            { value: "editor", label: "Editor" },
                            { value: "viewer", label: "Viewer" },
                          ]}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        />
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <UserPlus size={18} />
                </div>
                <h3 className="font-semibold text-slate-900">Add User / Organizer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Rahul Verma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. rahul@tournament.org"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <div className="form-field">
                <label className="form-label">Role</label>
                <Select
                  value={newRole}
                  options={[
                    { value: "editor", label: "Editor (Can manage tournaments, teams, matches)" },
                    { value: "viewer", label: "Viewer (Read-only access)" },
                    { value: "admin", label: "Admin (Full control, manage users)" },
                  ]}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
