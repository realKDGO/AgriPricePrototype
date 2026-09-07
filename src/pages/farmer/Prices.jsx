import { useState } from "react";
import { useParams, useSearchParams, Link, useLocation } from "react-router-dom";
import {
  PageHead,
  Panel,
  Select,
  Tabs,
  SearchBox,
  Records,
  Change,
  Empty,
} from "../../components/common/UI";
import CropCard from "../../components/farmer/CropCard";
import PriceChart from "../../components/common/PriceChart";
import { useApp } from "../../hooks/useApp";
import { latestPrices, money, movement, dateLabel } from "../../utils/format";
import { marketRepository } from "../../services/marketRepository";
export default function Prices() {
  const { data } = useApp();
  const location = useLocation();
  const [tab, setTab] = useState(location.pathname.includes("historical") ? "Historical" : "Current"),
    [q, setQ] = useState(""),
    [category, setCategory] = useState("all"),
    [market, setMarket] = useState("all");
  const prices = marketRepository.currentPrices(data);
  const markets = marketRepository.active(data);
  const crops = data.crops.filter(
    (c) =>
      c.status === "Active" &&
      c.name.toLowerCase().includes(q.toLowerCase()) &&
      (category === "all" || c.category === category),
  );
  const history = marketRepository.historical(data, crops.map((crop) => crop.id), market);
  const currentRecords = prices.filter(
    (record) =>
      crops.some((crop) => crop.id === record.cropId) &&
      (market === "all" || record.marketId === market),
  );
  return (
    <>
      <PageHead title={tab === "Historical" ? "Historical Prices" : "Crop Prices"} description={tab === "Historical" ? "Review previous crop prices across markets." : "View current crop prices across monitored markets."} />
      <Tabs items={["Current", "Historical"]} value={tab} onChange={setTab} />
      <div className="filter-bar">
        <SearchBox value={q} onChange={setQ} placeholder="Search crops" />
        <Select
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { id: "all", name: "All categories" },
            ...["Grain", "Vegetable", "Fruit"].map((id) => ({ id, name: id })),
          ]}
        />
        <Select
          label="Market"
          value={market}
          onChange={setMarket}
          options={[{ id: "all", name: "All markets" }, ...markets]}
        />
      </div>
      {tab === "Current" ? (
        <div className="crop-grid">
          {currentRecords.map((p) => {
            const c = data.crops.find((crop) => crop.id === p.cropId);
            return (
              <CropCard
                key={p.id}
                crop={c}
                price={p}
                market={marketRepository.byId(data, p.marketId)}
              />
            );
          })}
          {!currentRecords.length && <Empty />}
        </div>
      ) : (
        <Panel>
          <Records
            rows={history.slice().reverse()}
            columns={[
              {
                key: "cropId",
                label: "Crop",
                render: (r) => (
                  <Link className="text-link" to={"/farmer/prices/" + r.cropId}>
                    {data.crops.find((c) => c.id === r.cropId)?.name}
                  </Link>
                ),
              },
              { key: "date", label: "Date", render: (r) => dateLabel(r.date) },
              {
                key: "marketId",
                label: "Market",
                render: (r) =>
                  data.markets.find((m) => m.id === r.marketId)?.name,
              },
              {
                key: "price",
                label: "Price / kg",
                render: (r) => money(r.price),
              },
            ]}
          />
        </Panel>
      )}
      <p className="fine-print">Price records support market review and selling decisions. Confirm current prices with the market before selling.</p>
    </>
  );
}
export function CropDetail() {
  const { cropId } = useParams(),
    { data } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = ["Current", "History", "Forecast"].includes(params.get("tab"))
    ? params.get("tab")
    : "Current";
  const [period, setPeriod] = useState("6");
  const crop = data.crops.find((c) => c.id === cropId);
  if (!crop) return <Empty title="Crop not found" />;
  const rows =
    tab === "Forecast"
      ? data.forecasts
          .filter((r) => r.cropId === cropId)
          .slice(0, Number(period))
      : marketRepository.historical(data, [cropId]).slice(-Number(period) * 2);
  return (
    <>
      <Link className="text-link mb-5" to="/farmer/prices">
        ← All crop prices
      </Link>
      <div className="detail-crop">
        <img src={crop.image || "/images/rice.jpg"} alt="" />
        <PageHead
          eyebrow={crop.category + " · PER KILOGRAM"}
          title={crop.name}
          description="Local market information in one place."
        />
      </div>
      <Tabs
        items={["Current", "History", "Forecast"]}
        value={tab}
        onChange={(v) => setParams({ tab: v })}
      />
      {tab === "Current" ? (
        <Panel>
          <Records
            rows={latestPrices(data, cropId)}
            columns={[
              {
                key: "marketId",
                label: "Market",
                render: (r) =>
                  data.markets.find((m) => m.id === r.marketId)?.name,
              },
              {
                key: "price",
                label: "Price / kg",
                render: (r) => money(r.price),
              },
              {
                key: "previous",
                label: "Movement",
                render: (r) => <Change value={movement(r.price, r.previous)} />,
              },
              {
                key: "date",
                label: "Last update",
                render: (r) => dateLabel(r.date),
              },
            ]}
          />
        </Panel>
      ) : (
        <Panel>
          <Select
            label={tab === "History" ? "History period" : "Forecast horizon"}
            value={period}
            onChange={setPeriod}
            options={Array.from({ length: 6 }, (_, i) => ({
              id: String(i + 1),
              name: `${i + 1} month${i ? "s" : ""}`,
            }))}
          />
          <PriceChart
            data={rows.map((r) => ({
              ...r,
              label: new Date(r.date).toLocaleDateString("en", {
                month: "short",
                day: tab === "History" ? "numeric" : undefined,
              }),
            }))}
            forecast={tab === "Forecast"}
          />
          <Records
            rows={rows}
            columns={[
              {
                key: "date",
                label: "Period",
                render: (r) => dateLabel(r.date),
              },
              {
                key: "price",
                label: tab === "Forecast" ? "Estimate / kg" : "Price / kg",
                render: (r) => money(r.price),
              },
            ]}
          />
        </Panel>
      )}
      {tab === "Forecast" && (
        <p className="fine-print">
          Illustrative forecast values, not a trained forecasting model. Future
          prices are not guaranteed.
        </p>
      )}
    </>
  );
}
