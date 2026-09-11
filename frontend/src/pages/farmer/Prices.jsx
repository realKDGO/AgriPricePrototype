import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  PageHead,
  Panel,
  Records,
  Select,
  SearchBox,
  Field,
  Change,
  Tabs,
} from "../../components/common/UI";
import { QueryState, Pagination } from "../../components/common/Async";
import { useApp } from "../../hooks/useApp";
import { useQuery } from "../../hooks/useQuery";
import { priceService } from "../../services/priceService";
import { money, movement } from "../../utils/format";
export default function Prices({ fixedCrop }) {
  const { data } = useApp();
  const location = useLocation();
  const historical = location.pathname.includes("historical");
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [crop, setCrop] = useState(fixedCrop || ""),
    [market, setMarket] = useState(""),
    [trend, setTrend] = useState(""),
    [dateFrom, setFrom] = useState(""),
    [dateTo, setTo] = useState("");
  const query = useQuery(
    () =>
      (historical ? priceService.history : priceService.current)({
        page,
        limit: 25,
        search,
        cropId: crop || undefined,
        marketId: market || undefined,
        ...(historical
          ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
          : { trend: trend || undefined }),
      }),
    [historical, page, search, crop, market, trend, dateFrom, dateTo],
  );
  useEffect(
    () => setPage(1),
    [search, crop, market, trend, dateFrom, dateTo, historical],
  );
  return (
    <>
      <PageHead title={historical ? "Historical Prices" : "Crop Prices"} />
      <div className="tabs">
        <Link className={!historical ? "active" : ""} to="/farmer/prices">
          Current Prices
        </Link>
        <Link className={historical ? "active" : ""} to="/farmer/historical">
          Historical Prices
        </Link>
      </div>
      <div className="filter-bar">
        <SearchBox value={search} onChange={setSearch} />
        <Select
          label="Crop"
          value={crop}
          onChange={setCrop}
          options={[{ id: "", name: "All crops" }, ...data.crops]}
        />
        <Select
          label="Market"
          value={market}
          onChange={setMarket}
          options={[{ id: "", name: "All markets" }, ...data.markets]}
        />
        {historical ? (
          <>
            <Field label="From">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field>
            <Field label="To">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setTo(e.target.value)}
              />
            </Field>
          </>
        ) : (
          <Select
            label="Trend"
            value={trend}
            onChange={setTrend}
            options={[
              { id: "", name: "All trends" },
              { id: "up", name: "Increasing" },
              { id: "down", name: "Decreasing" },
              { id: "stable", name: "Stable" },
            ]}
          />
        )}
      </div>
      <QueryState query={query}>
        <Panel>
          <Records
            rows={query.data?.items || []}
            columns={[
              {
                key: "crop",
                label: "Crop",
                render: (r) => (
                  <Link
                    className="crop-identity"
                    to={`/farmer/prices/${r.cropId}`}
                  >
                    <img src={r.crop.imageUrl} alt={`${r.crop.name} crop`} />
                    <strong>{r.crop.name}</strong>
                  </Link>
                ),
              },
              { key: "market", label: "Market", render: (r) => r.market.name },
              {
                key: "price",
                label: "Price / kg",
                render: (r) => money(r.price),
              },
              {
                key: "previousPrice",
                label: "Movement",
                render: (r) =>
                  r.previousPrice ? (
                    <Change
                      value={movement(Number(r.price), Number(r.previousPrice))}
                    />
                  ) : (
                    <span>No previous quotation</span>
                  ),
              },
              {
                key: "date",
                label: "Date",
                render: (r) => r.date.slice(0, 10),
              },
              { key: "source", label: "Source" },
            ]}
          />
        </Panel>
        <Pagination data={query.data} onPage={setPage} />
      </QueryState>
    </>
  );
}
export function CropDetail() {
  const { cropId } = useParams();
  return <Prices fixedCrop={cropId} />;
}
