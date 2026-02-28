import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, Projects } from "../ui/widgets";

export default function Tasks() {
  const { data, loading, err, q, localProjects } = useOutletContext();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return localProjects;
    return localProjects.filter((p) => `${p.title} ${p.meta} ${p.status}`.toLowerCase().includes(s));
  }, [localProjects, q]);

  if (loading) return <Card className="mt-6">Loading tasks…</Card>;
  if (err) return <Card className="mt-6 border-red-200">{err}</Card>;

  return (
    <div className="mt-6">
      <Card>
        <CardHeader title="Project (from API products)" />
        <Projects rows={filtered} />
      </Card>
    </div>
  );
}