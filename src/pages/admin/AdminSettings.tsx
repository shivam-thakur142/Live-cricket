import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export function AdminSettings() {
  const toast = useToast();
  const [form, setForm] = useState({
    siteName: "Sirmour Cricket League",
    contactEmail: "info@sirmourcricketleague.local",
    phone: "+91 98765 43210",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.toast("Settings saved (mock)", "success");
  };

  return (
    <div>
      <h1>Settings</h1>
      <p className="page-subtitle">Platform configuration.</p>
      <Card>
        <form onSubmit={save} className="admin-form">
          <Input label="Site Name" value={form.siteName} onChange={(e) => update("siteName", e.target.value)} />
          <Input label="Contact Email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <div className="form-actions">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
