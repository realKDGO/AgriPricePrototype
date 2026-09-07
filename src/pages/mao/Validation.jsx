import { useState } from "react";
import {
  PageHead,
  Panel,
  Records,
  Badge,
  Tabs,
  Modal,
  Field,
} from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { money } from "../../utils/format";
export default function Validation() {
  const { data, save } = useApp(),
    [tab, setTab] = useState("Pending"),
    [review, setReview] = useState(null),
    [reason, setReason] = useState("");
  function decide(status) {
    save("prices", { ...review, status, reviewNote: reason });
    setReview(null);
    setReason("");
  }
  return (
    <>
      <PageHead
        eyebrow="QUALITY CONTROL"
        title="Price validation"
        description="Review crop quotations before they are shown to farmers."
      />
      <Tabs
        items={["Pending", "Verified", "Rejected"]}
        value={tab}
        onChange={setTab}
      />
      <Panel>
        <Records
          rows={data.prices.filter((r) => r.status === tab)}
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
              label: "Submitted / kg",
              render: (r) => money(r.price),
            },
            { key: "source", label: "Source" },
            {
              key: "status",
              label: "Status",
              render: (r) => <Badge>{r.status}</Badge>,
            },
          ]}
          actions={(r) => (
            <button
              className="button secondary small"
              onClick={() => {
                setReview(r);
                setReason(r.reviewNote || "");
              }}
            >
              {r.status === "Pending" ? "Review" : "View"}
            </button>
          )}
        />
      </Panel>
      {review && (
        <Modal title="Review price record" onClose={() => setReview(null)}>
          <h3>
            {data.crops.find((c) => c.id === review.cropId)?.name} ·{" "}
            {money(review.price)}/kg
          </h3>
          <p className="muted mt-2">
            {data.markets.find((m) => m.id === review.marketId)?.name}
          </p>
          <dl className="result-lines">
            <div>
              <dt>Previous quotation</dt>
              <dd>{money(review.previous)}/kg</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{review.date}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{review.source}</dd>
            </div>
          </dl>
          {review.status === "Pending" ? (
            <>
              <Field
                label="Review note"
                hint="A reason is required when rejecting a record."
              >
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              <div className="row-actions mt-5">
                <button className="button" onClick={() => decide("Verified")}>
                  Approve price
                </button>
                <button
                  disabled={!reason.trim()}
                  className="button danger"
                  onClick={() => decide("Rejected")}
                >
                  Reject price
                </button>
              </div>
            </>
          ) : (
            <p>{review.reviewNote || "No review note recorded."}</p>
          )}
        </Modal>
      )}
    </>
  );
}
