import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
} from "lucide-react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AddProjectModal, initials } from "../ui/widgets";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [localProjects, setLocalProjects] = useState([]);

  async function fetchDashboard() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/dashboard");
      setData(res.data);

      // seed local projects once (from products)
      setLocalProjects((prev) =>
        prev.length ? prev : (res.data.products || []).map((p) => ({
          id: `p-${p.id}`,
          title: p.name,
          meta: `Category: ${p.category} · Sales: ${p.sales} · Price: $${p.price}`,
          due: "2024-06-20",
          status: p.sales > 400 ? "Completed" : "In Progress",
        }))
      );
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

  const pageTitle = useMemo(() => {
    if (loc.pathname.startsWith("/tasks")) return "Tasks";
    if (loc.pathname.startsWith("/analytics")) return "Analytics";
    if (loc.pathname.startsWith("/team")) return "Team";
    if (loc.pathname.startsWith("/calendar")) return "Calendar";
    return "Dashboard";
  }, [loc.pathname]);

  return (
    <div className="min-h-screen bg-[#f5f6f7] text-slate-800">
      <div className="flex">
        {/* Sidebar (NOW FUNCTIONAL via NavLink) */}
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
              <SideLink to="/dashboard" icon={<LayoutGrid size={18} />} label="Dashboard" />
              <SideLink to="/tasks" icon={<CheckSquare size={18} />} label="Tasks" badge="12+" />
              <SideLink to="/calendar" icon={<CalendarDays size={18} />} label="Calendar" />
              <SideLink to="/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
              <SideLink to="/team" icon={<UsersIcon size={18} />} label="Team" />
            </nav>
          </div>

          <div className="mt-6">
            <div className="px-2 text-[11px] font-semibold text-slate-400 tracking-wider">GENERAL</div>
            <nav className="mt-2 space-y-1">
              <DummyItem icon={<Settings size={18} />} label="Settings" />
              <DummyItem icon={<HelpCircle size={18} />} label="Help" />
              <button
                onClick={logout}
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

        {/* Main */}
        <div className="flex-1 p-4 md:p-6">
          {/* Topbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-semibold">{pageTitle}</div>
              <div className="text-sm text-slate-500">Plan, prioritize, and accomplish your tasks with ease.</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 w-full sm:w-[360px]">
                <Search size={18} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
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
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-800"
              >
                <Plus size={16} /> Add Project
              </button>

              <button
                onClick={fetchDashboard}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <Upload size={16} /> Import Data
              </button>

              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
                  {initials(user?.email || "U")}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Totok Michael</div>
                  <div className="text-xs text-slate-500">{user?.email || "tmichael20@gmail.com"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Child pages (functional navigation) */}
          <Outlet
            context={{
              data,
              loading,
              err,
              q,
              fetchDashboard,
              localProjects,
              setLocalProjects,
              openAdd: () => setAddOpen(true),
            }}
          />
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

function SideLink({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
          isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50",
        ].join(" ")
      }
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">{label}</div>
      {badge && (
        <div className="rounded-full bg-emerald-100 text-emerald-700 text-[11px] px-2 py-0.5 font-semibold">
          {badge}
        </div>
      )}
    </NavLink>
  );
}

function DummyItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">{label}</div>
    </div>
  );
}