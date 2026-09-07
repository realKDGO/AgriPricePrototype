import { useState } from "react";
import { Download, TrendingUp, TrendingDown, BarChart3, Trophy } from "lucide-react";
import { PageHead, Panel, Select, Records } from "../../components/common/UI";
import PriceChart from "../../components/common/PriceChart";
import { useApp } from "../../hooks/useApp";
import { latestPrices, money, downloadCSV } from "../../utils/format";
import { marketRepository } from "../../services/marketRepository";
export default function Reports() {
  const { data } = useApp(),
    [type, setType] = useState("prices"),
    [crop, setCrop] = useState("all");
  const source =
    type === "history"
      ? data.history
      : type === "forecasts"
        ? data.forecasts
        : latestPrices(data);
  const rows = source
    .filter((r) => crop === "all" || r.cropId === crop)
    .map((r) => ({
      id: r.id,
      crop: data.crops.find((c) => c.id === r.cropId)?.name || r.cropId,
      market:
        marketRepository.byId(data, r.marketId)?.name ||
        "Illustrative outlook",
      date: r.date,
      price: r.price,
      status: r.status,
    }));
  return (
    <>
      <PageHead
        eyebrow="AGRICULTURAL INFORMATION"
        title="Reports & Analytics"
        description="Review and export the crop information behind your decisions."
        action={
          <button
            className="button"
            disabled={!rows.length}
            onClick={() => downloadCSV("agriprice-" + type, rows)}
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />
      <div className="stats-grid four report-summary">
        <Panel><TrendingUp/><strong>{money(Math.max(...latestPrices(data).map(r=>r.price)))}</strong><span>Highest Price</span></Panel>
        <Panel><TrendingDown/><strong>{money(Math.min(...latestPrices(data).map(r=>r.price)))}</strong><span>Lowest Price</span></Panel>
        <Panel><BarChart3/><strong>{money(latestPrices(data).reduce((sum,r)=>sum+r.price,0)/latestPrices(data).length)}</strong><span>Average Price</span></Panel>
        <Panel><Trophy/><strong>Rice</strong><span>Most Sold Crop</span></Panel>
      </div>
      <div className="filter-bar">
        <Select
          label="Report"
          value={type}
          onChange={setType}
          options={data.reports}
        />
        <Select
          label="Crop"
          value={crop}
          onChange={setCrop}
          options={[{ id: "all", name: "All crops" }, ...data.crops]}
        />
      </div>
      {crop !== "all" && (
        <Panel>
          <h2>{data.reports.find((r) => r.id === type)?.name}</h2>
          <PriceChart
            forecast={type === "forecasts"}
            data={rows.map((r) => ({
              ...r,
              label:
                type === "markets" || type === "prices"
                  ? r.market.replace("Jala-Jala ", "").replace("Local ", "")
                  : r.date.slice(5),
            }))}
          />
        </Panel>
      )}
      <Panel>
        <div className="section-head">
          <h2>{data.reports.find((r) => r.id === type)?.name}</h2>
          <span className="muted">{rows.length} records</span>
        </div>
        <Records
          rows={rows}
          columns={[
            { key: "crop", label: "Crop" },
            { key: "market", label: "Market / context" },
            { key: "date", label: "Date" },
            {
              key: "price",
              label: "Price / kg",
              render: (r) => money(r.price),
            },
            { key: "status", label: "Status" },
          ]}
        />
      </Panel>
      <p className="fine-print">
        Exports contain Current records. Forecast exports contain illustrative
        estimates, not guaranteed prices.
      </p>
    </>
  );
}
