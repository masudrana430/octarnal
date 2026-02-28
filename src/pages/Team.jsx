import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, TeamCollaboration } from "../ui/widgets";

export default function Team() {
  const { data, loading, err, q } = useOutletContext();
  const users = data?.users || [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.status}`.toLowerCase().includes(s));
  }, [users, q]);

  if (loading) return <Card className="mt-6">Loading team…</Card>;
  if (err) return <Card className="mt-6 border-red-200">{err}</Card>;

  return (
    <div className="mt-6">
      <Card>
        <CardHeader title="Team Collaboration (from API users)" />
        <TeamCollaboration users={filtered} />
      </Card>
    </div>
  );
}