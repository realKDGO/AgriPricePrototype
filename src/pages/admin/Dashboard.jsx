import { Link } from "react-router-dom";
import { Users, UserCog, Shield, Activity } from "lucide-react";
import {
  PageHead,
  Panel,
  Stat,
  Records,
  Badge,
  SectionHead,
} from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
export default function AdminDashboard() {
  const { data } = useApp();
  return (
    <>
      <PageHead
        eyebrow="TECHNICAL / SYSTEM ADMINISTRATION"
        title="System overview"
        description="Manage accounts, review activity, and monitor the application."
      />
      <div className="stats-grid four">
        <Stat
          label="Total user accounts"
          value={data.users.length}
          icon={Users}
        />
        <Stat
          label="Active MAO accounts"
          value={
            data.users.filter((u) => u.role === "MAO" && u.status === "Active")
              .length
          }
          icon={UserCog}
        />
        <Stat
          label="Suspended accounts"
          value={data.users.filter((u) => u.status === "Suspended").length}
          icon={Shield}
        />
        <Stat
          label="System environment"
          value="Available"
          detail="No live backend connected"
          icon={Activity}
        />
      </div>
      <div className="two-column">
        <Panel>
          <SectionHead
            title="Service status"
            to="/admin/monitoring"
            label="View details"
          />
          {[
            ["Frontend", "Available"],
            ["Backend API", "Not connected"],
            ["Database", "Not connected"],
          ].map(([name, status]) => (
            <div className="status-row" key={name}>
              <strong>{name}</strong>
              <Badge tone={status === "Available" ? "" : "neutral"}>
                {status}
              </Badge>
            </div>
          ))}
        </Panel>
        <Panel>
          <h2>Access administration</h2>
          <p className="muted my-4">
            Review account status and role responsibilities. Agricultural
            records are managed in the MAO Account.
          </p>
          <div className="row-actions">
            <Link className="button secondary" to="/admin/users">
              User accounts
            </Link>
            <Link className="button secondary" to="/admin/access">
              Roles & access
            </Link>
          </div>
        </Panel>
      </div>
      <Panel>
        <SectionHead
          title="Recent system activity"
          to="/admin/activity"
          label="All audit logs"
        />
        <Records
          rows={data.audit.slice(0, 5)}
          columns={[
            { key: "actor", label: "Account" },
            { key: "action", label: "Activity" },
            { key: "date", label: "Date & time" },
            {
              key: "status",
              label: "Result",
              render: (r) => <Badge>{r.status}</Badge>,
            },
          ]}
        />
      </Panel>
    </>
  );
}
