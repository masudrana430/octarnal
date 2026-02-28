import React, { useEffect, useMemo, useState } from "react";
import { Play, Pause, X } from "lucide-react";

/* ---------- primitives ---------- */
export function Card({ children, className = "" }) {
  return (
    <div className={["rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]", className].join(" ")}>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      {right || null}
    </div>
  );
}

export function StatCard({ title, value, foot, featured }) {
  return (
    <div className={["rounded-2xl border p-4", featured ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-slate-200"].join(" ")}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 text-4xl font-semibold">{value}</div>
      {foot && <div className={["mt-2 text-xs", featured ? "text-white/75" : "text-slate-500"].join(" ")}>{foot}</div>}
    </div>
  );
}

/* ---------- improved Project Analytics ---------- */
export function ProjectAnalytics({ analytics }) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const bars = useMemo(() => {
    const safe = Array.isArray(analytics) ? analytics : [];
    const maxViews = Math.max(1, ...safe.map((a) => Number(a?.views) || 0));

    const arr = Array.from({ length: 7 }, (_, i) => ({
      day: days[i],
      views: 0,
      pct: 18,
      hasData: false,
    }));

    for (let i = 0; i < Math.min(5, safe.length); i++) {
      const idx = i + 1; // M..F
      const views = Number(safe[i]?.views) || 0;
      const pct = clamp(Math.round((views / maxViews) * 100), 12, 100);
      arr[idx] = { day: days[idx], views, pct, hasData: true };
    }

    const peakIdx = arr.reduce((best, cur, i) => (cur.views > arr[best].views ? i : best), 0);
    arr[peakIdx] = { ...arr[peakIdx], isPeak: arr[peakIdx].hasData };

    return arr;
  }, [analytics]);

  const totalViews = bars.reduce((a, b) => a + (Number(b.views) || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Project Analytics</div>
          <div className="mt-1 text-xs text-slate-500">
            Weekly views · <span className="font-medium text-slate-700">{totalViews.toLocaleString()}</span> total
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-3">
        {bars.map((b, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div className="relative h-32 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden group">
              {b.hasData ? (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800 shadow-[inset_0_-10px_18px_rgba(0,0,0,0.12)] transition-[height] duration-700 ease-out"
                  style={{ height: `${b.pct}%` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#cbd5e1_0,#cbd5e1_6px,transparent_6px,transparent_12px)] opacity-80" />
              )}

              {b.isPeak && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-semibold shadow-sm">
                    Peak
                  </span>
                </div>
              )}

              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-md">
                  <div className="text-[11px] font-semibold text-slate-800">{b.day}</div>
                  <div className="text-[10px] text-slate-500">{b.hasData ? `${b.views.toLocaleString()} views` : "No data"}</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">{b.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Projects (Tasks) ---------- */
export function Projects({ rows }) {
  return (
    <div className="space-y-3">
      {rows.slice(0, 6).map((r) => (
        <div key={r.id} className="flex items-start gap-3">
          <div className="mt-1 h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-800">{r.title}</div>
            <div className="text-xs text-slate-500">{r.meta}</div>
            <div className="text-[11px] text-slate-400 mt-1">Due date: {r.due}</div>
          </div>
          <div className={["rounded-full px-2.5 py-1 text-[11px] font-semibold border", statusTone(r.status)].join(" ")}>
            {r.status}
          </div>
        </div>
      ))}
      {!rows.length && <div className="text-sm text-slate-500">No projects match your search.</div>}
    </div>
  );
}

/* ---------- Team Collaboration ---------- */
export function TeamCollaboration({ users }) {
  return (
    <div className="space-y-3">
      {users.slice(0, 6).map((u, i) => {
        const role =
          i % 3 === 0 ? "Working on REST API Integration"
          : i % 3 === 1 ? "Working on Dashboard UI Components"
          : "Working on Search & Filters";

        const chip = u.status === "active" ? "In Progress" : "Pending";

        return (
          <div key={u.id} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
              {initials(u.name)}
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-800">{u.name}</div>
              <div className="text-xs text-slate-500">{role}</div>
            </div>

            <div className={["text-xs font-semibold border rounded-full px-3 py-1", chipTone(chip)].join(" ")}>
              {chip}
            </div>
          </div>
        );
      })}
      {!users.length && <div className="text-sm text-slate-500">No users match your search.</div>}
    </div>
  );
}

/* ---------- Time Tracker ---------- */
export function TimeTrackerCard() {
  const [running, setRunning] = useState(true);
  const [sec, setSec] = useState(1 * 3600 + 24 * 60 + 8);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-[radial-gradient(ellipse_at_top,#14532d_0,#052e16_55%,#021a0d_100%)] p-4 text-white relative overflow-hidden">
      <div className="text-sm font-semibold">Time Tracker</div>
      <div className="mt-6 text-3xl font-semibold tracking-wider">{formatHHMMSS(sec)}</div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setRunning((v) => !v)}
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
          title={running ? "Pause" : "Play"}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="text-xs text-white/70">{running ? "Running" : "Paused"}</div>
      </div>

      <div className="absolute -right-14 -bottom-14 h-52 w-52 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}

/* ---------- Add Project Modal ---------- */
export function AddProjectModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [due, setDue] = useState("2024-06-20");
  const [status, setStatus] = useState("In Progress");

  function submit(e) {
    e.preventDefault();
    const id = (globalThis.crypto?.randomUUID?.() || `id-${Date.now()}`);
    onAdd({
      id,
      title: title || "Untitled Project",
      meta: meta || "Manual entry",
      due,
      status,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Add Project</div>
          <button onClick={onClose} className="h-9 w-9 rounded-xl hover:bg-slate-50 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-600">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Dashboard"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Meta</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder="e.g. API + UI"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Due</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                type="date"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>In Progress</option>
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <button className="w-full rounded-xl bg-emerald-700 text-white py-2 font-medium hover:bg-emerald-800">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
export function initials(nameOrEmail) {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  if (s.includes("@")) return s.slice(0, 2).toUpperCase();
  const parts = s.split(/\s+/);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function statusTone(status) {
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "Pending") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

function chipTone(label) {
  if (label === "Pending") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

function formatHHMMSS(total) {
  const t = Math.max(0, Number(total) || 0);
  const hh = String(Math.floor(t / 3600)).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}