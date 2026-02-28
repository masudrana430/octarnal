import React from "react";
import { useOutletContext } from "react-router-dom";
import { Card, StatCard, ProjectAnalytics } from "../ui/widgets";

export default function Analytics() {
  const { data, loading, err } = useOutletContext();
  const analytics = data?.analytics || [];

  const totals = analytics.reduce(
    (acc, r) => {
      acc.views += Number(r.views) || 0;
      acc.clicks += Number(r.clicks) || 0;
      acc.conversions += Number(r.conversions) || 0;
      return acc;
    },
    { views: 0, clicks: 0, conversions: 0 }
  );

  const ctr = totals.clicks ? Math.round((totals.conversions / totals.clicks) * 1000) / 10 : 0;

  if (loading) return <Card className="mt-6">Loading analytics…</Card>;
  if (err) return <Card className="mt-6 border-red-200">{err}</Card>;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Views" value={totals.views.toLocaleString()} />
        <StatCard title="Total Clicks" value={totals.clicks.toLocaleString()} />
        <StatCard title="CTR" value={`${ctr}%`} />
      </div>

      <ProjectAnalytics analytics={analytics} />
    </div>
  );
}