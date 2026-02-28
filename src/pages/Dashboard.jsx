import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await api.get("/api/dashboard");
        if (mounted) setData(res.data);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-slate-400">Signed in as {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900 transition"
          >
            Logout
          </button>
        </header>

        <main className="mt-6">
          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              Loading...
            </div>
          )}

          {err && (
            <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">
              {err}
            </div>
          )}

          {!loading && !err && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Overview" value={safeString(data?.overview?.title ?? "OK")} />
              <Card title="Users" value={safeCount(data?.users)} />
              <Card title="Products" value={safeCount(data?.products)} />

              <section className="md:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <h2 className="font-medium">Raw payload (for debugging)</h2>
                <pre className="mt-3 text-xs overflow-auto bg-slate-950/60 border border-slate-800 rounded-xl p-3">
{JSON.stringify(data, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/55 transition">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function safeCount(v) {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.keys(v).length;
  return 0;
}
function safeString(v) {
  return typeof v === "string" ? v : String(v ?? "");
}