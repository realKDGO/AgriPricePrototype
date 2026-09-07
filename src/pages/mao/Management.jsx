import { createId } from "../../utils/id";
import { useState } from "react";
import { Plus, Pencil, Eye, Archive } from "lucide-react";
import {
  PageHead,
  Panel,
  Records,
  SearchBox,
  Select,
  Field,
  Badge,
  Modal,
} from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { money, dateLabel, latestPrices } from "../../utils/format";
import { marketRepository } from "../../services/marketRepository";
const titles = {
  crops: "Crop Management",
  markets: "Market Management",
  prices: "Crop Price Management",
  history: "Historical Records",
};
export default function Management({ kind }) {
  const { data, save, notify } = useApp();
  const activeMarkets = marketRepository.active(data);
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("all"), [category,setCategory]=useState("all"), [market,setMarket]=useState("all"),
    [edit, setEdit] = useState(null),
    [view, setView] = useState(null),
    [archive, setArchive] = useState(null);
  const named = (r) =>
    kind === "crops" || kind === "markets"
      ? r.name
      : data.crops.find((c) => c.id === r.cropId)?.name;
  const rows = data[kind].filter(
    (r) =>
      (status === "all" || r.status === status) && (kind!=="crops" || category==="all" || r.category===category) && ( !["prices","history"].includes(kind) || market==="all" || r.marketId===market) &&
      `${named(r)} ${data.markets.find((m) => m.id === r.marketId)?.name || ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const columns =
    kind === "crops"
      ? [
          { key: "name", label: "Crop" },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge>{r.status}</Badge>,
          },
        ]
      : kind === "markets"
        ? [
            { key: "name", label: "Market" },
            { key: "location", label: "Location" },
            {
              key: "transport",
              label: "Transport / 100 kg",
              render: (r) => money(r.transport),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge>{r.status}</Badge>,
            },
          ]
        : [
            { key: "cropId", label: "Crop", render: named },
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
            { key: "date", label: "Date", render: (r) => dateLabel(r.date) },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge>{r.status}</Badge>,
            },
          ];
  function fresh() {
    return kind === "crops"
      ? {
          id: createId(),
          name: "",
          category: "Vegetable",
          unit: "kg",
          status: "Active",
        }
      : kind === "markets"
        ? {
            id: createId(),
            name: "",
            location: "Jala-Jala, Rizal",
            transport: 0,
            status: "Active",
          }
        : {
            id: createId(),
            cropId: data.crops[0].id,
            marketId: data.markets[0].id,
            price: "",
            date: "2026-09-05",
            status: kind === "prices" ? "Pending" : "Verified",
            source: "MAO entry",
          };
  }
  return (
    <>
      <PageHead
        eyebrow="AGRICULTURAL INFORMATION MANAGEMENT"
        title={titles[kind]}
        description={
          kind === "prices"
            ? "New and edited prices enter the validation queue."
            : "Maintain agricultural records used throughout AgriPrice."
        }
        action={
          <button className="button" onClick={() => setEdit(fresh())}>
            <Plus size={18} />
            Add {kind === "history" ? "record" : kind.slice(0, -1)}
          </button>
        }
      />
      <div className="filter-bar">
        <SearchBox value={q} onChange={setQ} />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { id: "all", name: "All statuses" },
            ...Array.from(new Set(data[kind].map((r) => r.status))).map(
              (id) => ({ id, name: id }),
            ),
          ]}
        />
        {kind === "crops" && <Select label="Category" value={category} onChange={setCategory} options={[{id:"all",name:"All Categories"},{id:"Grain",name:"Grain"},{id:"Vegetable",name:"Vegetable"},{id:"Fruit",name:"Fruit"}]}/>}
        {["prices", "history"].includes(kind) && <Select label="Market" value={market} onChange={setMarket} options={[{id:"all",name:"All Markets"},...activeMarkets]}/>}
      </div>
      <Panel>
        <div className="section-head">
          <h2>{rows.length} records</h2>
          <span className="muted">Current records</span>
        </div>
        <Records
          columns={columns}
          rows={rows}
          actions={(r) => (
            <>
              <button
                className="button secondary small"
                aria-label={`View ${named(r)}`}
                onClick={() => setView(r)}
              >
                <Eye size={15} />
                View
              </button>
              <button
                className="button secondary small"
                aria-label={`Edit ${named(r)}`}
                onClick={() => setEdit({ ...r })}
              >
                <Pencil size={15} />
                Edit
              </button>
              {["crops", "markets"].includes(kind) && r.status === "Active" && (
                <button
                  className="icon-button"
                  aria-label={`Archive ${named(r)}`}
                  onClick={() => setArchive(r)}
                >
                  <Archive size={17} />
                </button>
              )}
            </>
          )}
        />
      </Panel>
      {edit && (
        <Modal
          title={`${data[kind].some((r) => r.id === edit.id) ? "Edit" : "Add"} ${kind === "history" ? "historical record" : kind.slice(0, -1)}`}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (edit.name && !edit.name.trim())
                return notify("Enter a name.");
              if (
                edit.name &&
                data[kind].some(
                  (r) =>
                    r.id !== edit.id &&
                    r.name.toLowerCase() === edit.name.trim().toLowerCase(),
                )
              )
                return notify("A record with this name already exists.");
              let record = { ...edit };
              if (kind === "prices") {
                const prev = latestPrices(data, record.cropId).find(
                  (r) => r.marketId === record.marketId,
                );
                record = {
                  ...record,
                  id: edit.status === "Verified" ? createId() : edit.id,
                  price: Number(record.price),
                  previous: prev?.price || Number(record.price),
                  status: "Pending",
                };
              } else if (kind === "history")
                record.price = Number(record.price);
              else if (kind === "markets")
                record.transport = Number(record.transport);
              if (record.name) record.name = record.name.trim();
              save(kind, record);
              setEdit(null);
            }}
          >
            <div className="form-stack">
              {["crops", "markets"].includes(kind) ? (
                <>
                  <Field label={kind === "crops" ? "Crop name" : "Market name"}>
                    <input
                      required
                      maxLength={100}
                      value={edit.name}
                      onChange={(e) =>
                        setEdit({ ...edit, name: e.target.value })
                      }
                    />
                  </Field>
                  {kind === "crops" ? (
                    <Select
                      label="Category"
                      value={edit.category}
                      onChange={(v) => setEdit({ ...edit, category: v })}
                      options={["Grain", "Vegetable", "Fruit"].map((id) => ({
                        id,
                        name: id,
                      }))}
                    />
                  ) : (
                    <>
                      <Field label="Location">
                        <input
                          required
                          value={edit.location}
                          onChange={(e) =>
                            setEdit({ ...edit, location: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Transport cost for 100 kg (₱)">
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={edit.transport}
                          onChange={(e) =>
                            setEdit({ ...edit, transport: e.target.value })
                          }
                        />
                      </Field>
                    </>
                  )}
                  <Select
                    label="Status"
                    value={edit.status}
                    onChange={(v) => setEdit({ ...edit, status: v })}
                    options={["Active", "Archived"].map((id) => ({
                      id,
                      name: id,
                    }))}
                  />
                </>
              ) : (
                <>
                  <Select
                    label="Crop"
                    value={edit.cropId}
                    onChange={(v) => setEdit({ ...edit, cropId: v })}
                    options={data.crops}
                  />
                  <Select
                    label="Market"
                    value={edit.marketId}
                    onChange={(v) => setEdit({ ...edit, marketId: v })}
                    options={activeMarkets}
                  />
                  <Field label="Price per kilogram (₱)">
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={edit.price}
                      onChange={(e) =>
                        setEdit({ ...edit, price: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Record date">
                    <input
                      required
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={edit.date}
                      onChange={(e) =>
                        setEdit({ ...edit, date: e.target.value })
                      }
                    />
                  </Field>
                  {kind === "prices" && (
                    <p className="muted">
                      Saved as pending. A verified record remains visible until
                      the replacement is approved.
                    </p>
                  )}
                </>
              )}
              <button className="button">Save record</button>
            </div>
          </form>
        </Modal>
      )}
      {view && (
        <Modal title={named(view)} onClose={() => setView(null)}>
          <dl className="result-lines">
            {columns.map((c) => (
              <div key={c.key}>
                <dt>{c.label}</dt>
                <dd>{c.render ? c.render(view) : view[c.key]}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
      {archive && (
        <Modal
          title={`Archive ${named(archive)}?`}
          onClose={() => setArchive(null)}
        >
          <p className="muted my-4">
            This removes the record from active public comparisons. Historical
            records are retained. You can reactivate it by editing its status.
          </p>
          <button
            className="button"
            onClick={() => {
              save(kind, { ...archive, status: "Archived" });
              setArchive(null);
            }}
          >
            Archive record
          </button>
        </Modal>
      )}
    </>
  );
}
