import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Users as UsersIcon,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Mail,
  Bell,
  Plus,
  Upload,
  ArrowUpRight,
  Play,
  Pause,
  X,
} from "lucide-react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Local "projects" list (UI feature) — seeded from API products, then user can add more
  const [localProjects, setLocalProjects] = useState([]);

  async function fetchDashboard() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/dashboard");
      setData(res.data);
      // seed local projects once
      setLocalProjects((prev) => (prev.length ? prev : (res.data.products || []).map(toProjectRow)));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overview = data?.overview || {};
  const users = data?.users || [];
  const analytics = data?.analytics || [];
  const products = data?.products || [];

  // Search filters (functional)
  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.status}`.toLowerCase().includes(s));
  }, [users, q]);

  const filteredProjects = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return localProjects;
    return localProjects.filter((p) => `${p.title} ${p.meta} ${p.status}`.toLowerCase().includes(s));
  }, [localProjects, q]);

  // Progress % (use real overview data; keep it stable + meaningful)
  const progressPct = useMemo(() => {
    // revenue looks like 245890 in your screenshots
    // using a target makes a stable percent like the UI gauge
    const revenue = Number(overview.revenue) || 0;
    const target = 600000;
    return clamp(Math.round((revenue / target) * 100), 0, 100);
  }, [overview.revenue]);

  return (
    <div className="min-h-screen bg-[#f5f6f7] text-slate-800">
      <div className="flex">
        <Sidebar onLogout={logout} />

        <div className="flex-1 p-4 md:p-6">
          <Topbar
            userEmail={user?.email}
            query={q}
            setQuery={setQ}
            onAdd={() => setAddOpen(true)}
            onImport={fetchDashboard}
          />

          {loading && (
            <Card className="mt-6">
              <div className="text-sm text-slate-500">Loading data from REST API…</div>
            </Card>
          )}

          {err && (
            <Card className="mt-6 border-red-200">
              <div className="text-sm text-red-700">{err}</div>
              <button
                onClick={fetchDashboard}
                className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Retry
              </button>
            </Card>
          )}

          {!loading && !err && (
            <>
              {/* Stat cards (API-driven: overview) */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  featured
                  title="Total Users"
                  value={overview.totalUsers ?? 0}
                  foot="From /api/overview"
                />
                <StatCard
                  title="Active Users"
                  value={overview.activeUsers ?? 0}
                  foot="From /api/overview"
                />
                <StatCard
                  title="Revenue"
                  value={formatCurrency(overview.revenue ?? 0)}
                  foot="From /api/overview"
                />
                <StatCard
                  title="Growth"
                  value={`${overview.growth ?? 0}%`}
                  foot="From /api/overview"
                />
              </div>

              {/* Row 2 */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-7">
                  <CardHeader title="Project Analytics (Views)" />
                  <ProjectAnalytics analytics={analytics} />
                </Card>

                <div className="lg:col-span-5 grid gap-4">
                  <Card>
                    <CardHeader title="Reminders" />
                    <Reminders />
                  </Card>

                  <Card>
                    <CardHeader
                      title="Project"
                      right={
                        <button
                          onClick={() => setAddOpen(true)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          <Plus size={14} /> New
                        </button>
                      }
                    />
                    <Projects rows={filteredProjects} />
                  </Card>
                </div>
              </div>

              {/* Row 3 */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-7">
                  <CardHeader title="Team Collaboration" />
                  <TeamCollaboration users={filteredUsers} />
                </Card>

                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader title="Project Progress" />
                    <ProjectProgress percent={progressPct} />
                  </Card>

                  <TimeTrackerCard />
                </div>
              </div>

              {/* Optional: show API summary, helps debugging */}
              
            </>
          )}
        </div>
      </div>

      {addOpen && (
        <AddProjectModal
          onClose={() => setAddOpen(false)}
          onAdd={(row) => setLocalProjects((prev) => [row, ...prev])}
        />
      )}
    </div>
  );
}

/* --------------------------- Components --------------------------- */

function Sidebar({ onLogout }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-600" />
        </div>
        <div className="font-semibold">Donezo</div>
      </div>

      <div className="mt-6">
        <div className="px-2 text-[11px] font-semibold text-slate-400 tracking-wider">MENU</div>
        <nav className="mt-2 space-y-1">
          <SideItem icon={<LayoutGrid size={18} />} active label="Dashboard" />
          <SideItem icon={<CheckSquare size={18} />} label="Tasks" badge="12+" />
          <SideItem icon={<CalendarDays size={18} />} label="Calendar" />
          <SideItem icon={<BarChart3 size={18} />} label="Analytics" />
          <SideItem icon={<UsersIcon size={18} />} label="Team" />
        </nav>
      </div>

      <div className="mt-6">
        <div className="px-2 text-[11px] font-semibold text-slate-400 tracking-wider">GENERAL</div>
        <nav className="mt-2 space-y-1">
          <SideItem icon={<Settings size={18} />} label="Settings" />
          <SideItem icon={<HelpCircle size={18} />} label="Help" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </div>

      <div className="mt-auto p-2">
        <div className="rounded-2xl bg-[radial-gradient(ellipse_at_top,#14532d_0,#052e16_55%,#021a0d_100%)] text-white p-4">
          <div className="text-sm font-semibold">Download our Mobile App</div>
          <div className="mt-1 text-xs text-white/70">Get everything done on the go.</div>
          <button className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/15">
            Download
          </button>
        </div>
      </div>
    </aside>
  );
}

function SideItem({ icon, label, active, badge }) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
        active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">{label}</div>
      {badge && (
        <div className="rounded-full bg-emerald-100 text-emerald-700 text-[11px] px-2 py-0.5 font-semibold">
          {badge}
        </div>
      )}
    </div>
  );
}

function Topbar({ userEmail, query, setQuery, onAdd, onImport }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-2xl md:text-3xl font-semibold">Dashboard</div>
        <div className="text-sm text-slate-500">Plan, prioritize, and accomplish your tasks with ease.</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 w-full sm:w-[360px]">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users or projects..."
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
          <Mail size={18} className="text-slate-500" />
        </button>
        <button className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50">
          <Bell size={18} className="text-slate-500" />
        </button>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-800"
        >
          <Plus size={16} /> Add Project
        </button>
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <Upload size={16} /> Import Data
        </button>

        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
            {initials(userEmail || "U")}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Totok Michael</div>
            <div className="text-xs text-slate-500">{userEmail || "tmichael20@gmail.com"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={["rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]", className].join(" ")}>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CardHeader({ title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      {right || null}
    </div>
  );
}

function StatCard({ title, value, foot, featured }) {
  return (
    <div className={["rounded-2xl border p-4", featured ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-slate-200"].join(" ")}>
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className={["h-8 w-8 rounded-full flex items-center justify-center border", featured ? "border-white/20 bg-white/10" : "border-slate-200 bg-white"].join(" ")}>
          <ArrowUpRight size={16} className={featured ? "text-white" : "text-slate-700"} />
        </div>
      </div>

      <div className="mt-3 text-4xl font-semibold">{value}</div>
      <div className={["mt-2 text-xs", featured ? "text-white/75" : "text-slate-500"].join(" ")}>
        {foot}
      </div>
    </div>
  );
}


function ProjectAnalytics({ analytics }) {
  // UI days (match screenshot)
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const bars = React.useMemo(() => {
    const safe = Array.isArray(analytics) ? analytics : [];
    const maxViews = Math.max(1, ...safe.map((a) => Number(a?.views) || 0));

    // Create 7 buckets; by design we place API data into M..F (5 items)
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

    // peak bar
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

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" /> Data
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm border border-slate-300 bg-[repeating-linear-gradient(45deg,#cbd5e1_0,#cbd5e1_5px,transparent_5px,transparent_10px)]" /> No data
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-3">
        {bars.map((b, idx) => {
          const height = `${b.pct}%`;

          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              {/* Bar track */}
              <div className="relative h-32 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden group">
                {/* Fill */}
                {b.hasData ? (
                  <div
                    className={[
                      "absolute bottom-0 left-0 right-0 rounded-full",
                      "bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800",
                      "shadow-[inset_0_-10px_18px_rgba(0,0,0,0.12)]",
                      "transition-[height] duration-700 ease-out",
                    ].join(" ")}
                    style={{ height }}
                  />
                ) : (
                  <div
                    className={[
                      "absolute inset-0",
                      "bg-[repeating-linear-gradient(45deg,#cbd5e1_0,#cbd5e1_6px,transparent_6px,transparent_12px)]",
                      "opacity-80",
                    ].join(" ")}
                  />
                )}

                {/* Peak badge */}
                {b.isPeak && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-semibold shadow-sm">
                      Peak
                    </span>
                  </div>
                )}

                {/* Hover tooltip */}
                <div
                  className={[
                    "absolute -top-10 left-1/2 -translate-x-1/2",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "pointer-events-none",
                  ].join(" ")}
                >
                  <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-md">
                    <div className="text-[11px] font-semibold text-slate-800">{b.day}</div>
                    <div className="text-[10px] text-slate-500">
                      {b.hasData ? `${b.views.toLocaleString()} views` : "No data"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Day label */}
              <div className="text-xs text-slate-500">{b.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function Reminders() {
  return (
    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
      <div className="text-xs font-semibold text-emerald-700">Meeting with Arc Company</div>
      <div className="mt-1 text-xs text-slate-500">Time: 02:00 pm - 04:00 pm</div>
      <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
        Start Meeting
      </button>
    </div>
  );
}

function Projects({ rows }) {
  return (
    <div className="space-y-3">
      {rows.slice(0, 5).map((r) => (
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

function TeamCollaboration({ users }) {
  return (
    <div className="space-y-3">
      {users.slice(0, 4).map((u, i) => {
        const role =
          i === 0
            ? "Working on REST API Integration"
            : i === 1
              ? "Working on Dashboard UI Components"
              : i === 2
                ? "Working on Search & Filters"
                : "Working on Responsive Layout";

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

function ProjectProgress({ percent }) {
  const pct = clamp(Number(percent) || 0, 0, 100);
  const r = 78;
  const halfCirc = Math.PI * r;
  const dash = (pct / 100) * halfCirc;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 200 120" className="mt-2">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#047857"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${halfCirc}`}
        />
        <text x="100" y="78" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 28, fontWeight: 700 }}>
          {pct}%
        </text>
        <text x="100" y="96" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10, fontWeight: 600 }}>
          Revenue Progress
        </text>
      </svg>
      <div className="mt-2 text-xs text-slate-500">Derived from /api/overview revenue</div>
    </div>
  );
}

function TimeTrackerCard() {
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

/* --------------------------- Modal (Functional) --------------------------- */

function AddProjectModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [due, setDue] = useState("2024-06-20");
  const [status, setStatus] = useState("In Progress");

  function submit(e) {
    e.preventDefault();
    const row = {
      id: crypto.randomUUID(),
      title: title || "Untitled Project",
      meta: meta || "Manual entry",
      due,
      status,
    };
    onAdd(row);
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

/* --------------------------- Helpers --------------------------- */

function toProjectRow(p) {
  return {
    id: `p-${p.id}`,
    title: p.name,
    meta: `Category: ${p.category} · Sales: ${p.sales} · Price: ${formatCurrency(p.price)}`,
    due: "2024-06-20",
    status: p.sales > 400 ? "Completed" : "In Progress",
  };
}

function statusTone(status) {
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "Pending") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-100"; // In Progress
}

function chipTone(label) {
  if (label === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (label === "Pending") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

function initials(nameOrEmail) {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  if (s.includes("@")) return s.slice(0, 2).toUpperCase();
  const parts = s.split(/\s+/);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function formatHHMMSS(total) {
  const t = Math.max(0, Number(total) || 0);
  const hh = String(Math.floor(t / 3600)).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatCurrency(v) {
  const n = Number(v) || 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}