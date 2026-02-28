import React from "react";
import { useOutletContext } from "react-router-dom";
import { Card, StatCard, ProjectAnalytics, Projects, TeamCollaboration, TimeTrackerCard } from "../ui/widgets";

export default function DashboardHome() {
  const { data, loading, err, localProjects } = useOutletContext();
  const overview = data?.overview || {};
  const analytics = data?.analytics || [];
  const users = data?.users || [];

  if (loading) return <Card className="mt-6">Loading dashboard…</Card>;
  if (err) return <Card className="mt-6 border-red-200">{err}</Card>;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard featured title="Total Users" value={overview.totalUsers ?? 0} />
        <StatCard title="Active Users" value={overview.activeUsers ?? 0} />
        <StatCard title="Revenue" value={overview.revenue ?? 0} />
        <StatCard title="Growth" value={`${overview.growth ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <ProjectAnalytics analytics={analytics} />
        </div>
        <div className="lg:col-span-5">
          <Card>
            <div className="text-sm font-semibold mb-3">Project</div>
            <Projects rows={localProjects} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <Card>
            <div className="text-sm font-semibold mb-3">Team Collaboration</div>
            <TeamCollaboration users={users} />
          </Card>
        </div>
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TimeTrackerCard />
          <Card>
            <div className="text-sm text-slate-600"></div>
          </Card>
        </div>
      </div>
    </div>
  );
}