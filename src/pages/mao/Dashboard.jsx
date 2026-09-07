import { Link } from "react-router-dom";
import { Sprout, Store, ShieldCheck, Tags, ArrowRight } from "lucide-react";
import {
  PageHead,
  Panel,
  Stat,
  SectionHead,
  Records,
  Badge,
} from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { money } from "../../utils/format";
export default function MaoDashboard() {
  const { data } = useApp();
  const pending = data.prices.filter((p) => p.status === "Pending");
  return (
    <>
      <PageHead
        eyebrow="MUNICIPAL AGRICULTURE OFFICE"
        title="Agricultural overview"
        description="Keep Jala-Jala’s crop information accurate and up to date."
        action={
          <Link className="button" to="/mao/prices">
            Record a price <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="stats-grid four">
        <Stat
          icon={Sprout}
          label="Active crops"
          value={data.crops.filter((c) => c.status === "Active").length}
        />
        <Stat
          icon={Store}
          label="Monitored markets"
          value={data.markets.filter((m) => m.status === "Active").length}
        />
        <Stat
          icon={Tags}
          label="Verified price records"
          value={data.prices.filter((p) => p.status === "Verified").length}
        />
        <Stat
          icon={ShieldCheck}
          label="Awaiting validation"
          value={pending.length}
          detail="Review before public display"
        />
      </div>
      <Panel>
        <SectionHead
          title="Prices needing attention"
          to="/mao/validation"
          label="Review queue"
        />
        <Records
          rows={pending}
          columns={[
            {
              key: "cropId",
              label: "Crop",
              render: (r) => data.crops.find((c) => c.id === r.cropId)?.name,
            },
            {
              key: "marketId",
              label: "Market",
              render: (r) =>
                data.markets.find((m) => m.id === r.marketId)?.name,
            },
            {
              key: "price",
              label: "Submitted price / kg",
              render: (r) => money(r.price),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge>{r.status}</Badge>,
            },
          ]}
          actions={() => (
            <Link className="button secondary small" to="/mao/validation">
              Review
            </Link>
          )}
        />
      </Panel>
      <div className="two-column">
        <Panel>
          <h2>Maintain agricultural information</h2>
          <p className="muted my-4">
            Crop and market details are shared across the farmer tools. New
            prices require validation before they appear publicly.
          </p>
          <Link className="text-link" to="/mao/crops">
            Manage crops <ArrowRight size={16} />
          </Link>
        </Panel>
        <Panel>
          <h2>Latest data activity</h2>
          {data.audit
            .filter((r) => /price|crop|market|histor/i.test(r.action))
            .slice(0, 4)
            .map((r) => (
              <div className="activity-row" key={r.id}>
                <strong>{r.action}</strong>
                <small>
                  {r.actor} · {r.date}
                </small>
              </div>
            ))}
        </Panel>
      </div>
    </>
  );
}
