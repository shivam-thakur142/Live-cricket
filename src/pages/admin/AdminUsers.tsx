import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import * as api from "@/services/api";
import type { User, UserRole } from "@/types";

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const updateRole = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const save = () => {
    toast.toast("User roles saved (mock)", "success");
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
        <Button onClick={save}>Save Changes</Button>
      </div>
      <Card>
        <table className="table">
          <thead className="table-head">
            <tr>
              <th className="table-cell table-header-cell">Name</th>
              <th className="table-cell table-header-cell">Email</th>
              <th className="table-cell table-header-cell">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="table-cell">{u.name}</td>
                <td className="table-cell">{u.email}</td>
                <td className="table-cell">
                  <Select
                    value={u.role}
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "editor", label: "Editor" },
                      { value: "viewer", label: "Viewer" },
                    ]}
                    onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
