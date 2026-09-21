import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Lock, Mail, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login } from "@/services/api";
import type { User } from "@/types";

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      onLoginSuccess(result.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-3 shadow-inner">
            <Trophy size={28} className="text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Organizer & Admin Portal</h1>
          <p className="text-emerald-100 text-sm mt-1">Sirmour Cricket League (SCL)</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6 text-slate-600 text-sm">
            <Lock size={16} className="text-emerald-600" />
            <span>Sign in to manage tournaments, teams, and matches.</span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-field">
              <label className="form-label flex items-center gap-1.5">
                <Mail size={14} className="text-slate-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input w-full"
                placeholder="admin@scl.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label flex items-center gap-1.5">
                <Lock size={14} className="text-slate-500" />
                <span>Password</span>
              </label>
              <input
                type="password"
                className="form-input w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-semibold text-base mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Panel</span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
