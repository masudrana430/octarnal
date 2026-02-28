import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("user1@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed. Check credentials / API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-400 mt-1">Use your account to access the dashboard.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {err && <div className="text-sm text-red-300 bg-red-950/40 border border-red-900 rounded-xl p-3">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-100 text-slate-950 py-2 font-medium
                       hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}