import { useMemo, useState, useRef, useCallback } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

function downloadCSV(headers, rows, filename) {
  const escape = (v) => (v == null ? "" : String(v).replace(/"/g, '""'));
  const line = (arr) => arr.map((c) => `"${escape(c)}"`).join(",");
  const csv = [line(headers), ...rows.map((r) => line(r))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

export default function AdminReceipts({ courierReceipts: propCourier = [], lensReceipts: propLens = [], setCourierReceipts: setCourierProp, setLensReceipts: setLensProp }) {
  const [tab, setTab] = useState("courier"); // courier | lens
  const [localCourier, setLocalCourier] = useState([]);
  const [localLens, setLocalLens] = useState([]);
  const useProps = setCourierProp != null && setLensProp != null;
  const courierReceipts = useProps ? propCourier : localCourier;
  const setCourierReceipts = useProps ? setCourierProp : setLocalCourier;
  const lensReceipts = useProps ? propLens : localLens;
  const setLensReceipts = useProps ? setLensProp : setLocalLens;
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const viewPanelRef = useRef(null);
  const closeViewing = useCallback(() => setViewing(null), []);
  useFocusTrap(viewPanelRef, Boolean(viewing), { onEscape: closeViewing });

  const [form, setForm] = useState({
    orderId: "",
    courier: "",
    tracking: "",
    deliveryName: "",
    deliveryAddress: "",
    paid: false,
    lab: "",
    lensType: "",
    clientName: "",
    frameName: "",
    lensPower: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const list = tab === "courier" ? courierReceipts : lensReceipts;
  const filtered = useMemo(() => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((r) => {
      if ((r.orderId || "").toLowerCase().includes(q) || (r.id || "").toLowerCase().includes(q)) return true;
      if (tab === "courier" && ((r.deliveryName || r.courier || "").toLowerCase().includes(q) || (r.deliveryAddress || r.tracking || "").toLowerCase().includes(q))) return true;
      if (tab === "lens" && ((r.clientName || r.lab || "").toLowerCase().includes(q) || (r.lensType || "").toLowerCase().includes(q) || (r.frameName || "").toLowerCase().includes(q) || (r.lensPower || "").toLowerCase().includes(q))) return true;
      return false;
    });
  }, [list, search, tab]);

  const totals = useMemo(() => {
    const courierTotal = courierReceipts.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const lensTotal = lensReceipts.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { courierTotal, lensTotal };
  }, [courierReceipts, lensReceipts]);

  const resetForm = () => {
    setForm({
      orderId: "",
      courier: "",
      tracking: "",
      deliveryName: "",
      deliveryAddress: "",
      paid: false,
      lab: "",
      lensType: "",
      clientName: "",
      frameName: "",
      lensPower: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setFileMeta(null);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileMeta(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileMeta({ name: file.name, mime: file.type, url, size: file.size });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.orderId.trim()) return;

    const amount = Number(form.amount) || 0;
    const nowId = (prefix, current) => `${prefix}-${String(current + 1).padStart(3, "0")}`;

    if (tab === "courier") {
      const hasCourier = form.courier.trim() && form.tracking.trim();
      const hasDelivery = form.deliveryName.trim() && form.deliveryAddress.trim();
      if (!hasCourier && !hasDelivery) return;
      setCourierReceipts((prev) => [
        {
          id: nowId("CR", prev.length),
          orderId: form.orderId.trim(),
          ...(form.deliveryName.trim() && { deliveryName: form.deliveryName.trim() }),
          ...(form.deliveryAddress.trim() && { deliveryAddress: form.deliveryAddress.trim() }),
          paid: form.paid,
          ...(form.courier.trim() && { courier: form.courier.trim() }),
          ...(form.tracking.trim() && { tracking: form.tracking.trim() }),
          amount,
          date: form.date,
          notes: form.notes.trim(),
          attachment: fileMeta ? { ...fileMeta } : null,
        },
        ...prev,
      ]);
    } else {
      if (!form.lensType.trim()) return;
      setLensReceipts((prev) => [
        {
          id: nowId("LR", prev.length),
          orderId: form.orderId.trim(),
          ...(form.clientName.trim() && { clientName: form.clientName.trim() }),
          ...(form.frameName.trim() && { frameName: form.frameName.trim() }),
          ...(form.lab.trim() && { lab: form.lab.trim() }),
          lensType: form.lensType.trim(),
          ...(form.lensPower.trim() && { lensPower: form.lensPower.trim() }),
          amount,
          date: form.date,
          notes: form.notes.trim(),
          attachment: fileMeta ? { ...fileMeta } : null,
        },
        ...prev,
      ]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleExport = () => {
    if (tab === "courier") {
      const headers = ["Receipt ID", "Order ID", "Delivery name", "Delivery address", "Paid", "Amount", "Date"];
      const rows = filtered.map((r) => [r.id, r.orderId, r.deliveryName || r.courier || "—", r.deliveryAddress || r.tracking || "—", r.paid != null ? (r.paid ? "Paid" : "Unpaid") : "—", r.amount != null ? r.amount : "", r.date]);
      downloadCSV(headers, rows, `courier-receipts-${new Date().toISOString().slice(0, 10)}.csv`);
      return;
    }
    const headers = ["Receipt ID", "Order ID", "Client name", "Frame", "Lens type", "Lens power", "Amount", "Date"];
    const rows = filtered.map((r) => [r.id, r.orderId, r.clientName || r.lab || "—", r.frameName || "—", r.lensType, r.lensPower || r.notes || "—", r.amount, r.date]);
    downloadCSV(headers, rows, `lens-receipts-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="adm-page-section">
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "var(--em-light)" }}>🚚</div>
          <div className="kpi-label">Courier receipts</div>
          <div className="kpi-value">{courierReceipts.length}</div>
          <div className="kpi-delta kpi-up">Total ₹{totals.courierTotal.toLocaleString("en-IN")}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#EFF6FF" }}>👓</div>
          <div className="kpi-label">Lens receipts</div>
          <div className="kpi-value">{lensReceipts.length}</div>
          <div className="kpi-delta kpi-up">Total ₹{totals.lensTotal.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="inner-tabs" style={{ marginBottom: 16 }}>
        <button type="button" className={`inner-tab${tab === "courier" ? " active" : ""}`} onClick={() => { setTab("courier"); setShowForm(false); resetForm(); }}>
          Courier receipts
        </button>
        <button type="button" className={`inner-tab${tab === "lens" ? " active" : ""}`} onClick={() => { setTab("lens"); setShowForm(false); resetForm(); }}>
          Lens receipts
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input
          className="input"
          placeholder="Search by order ID or receipt ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, padding: "10px 14px" }}
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : tab === "courier" ? "+ Add courier receipt" : "+ Add lens receipt"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport}>Export CSV</button>
      </div>

      {showForm && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">{tab === "courier" ? "New courier receipt" : "New lens receipt"}</div>
            <form onSubmit={submit} style={{ display: "grid", gap: 14, maxWidth: 720 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Order ID</label>
                  <input className="input" value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} placeholder="#EL-84729" required />
                </div>
                <div>
                  <label className="field-label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>

              {tab === "courier" ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Delivery name</label>
                      <input className="input" value={form.deliveryName} onChange={(e) => setForm((f) => ({ ...f, deliveryName: e.target.value }))} placeholder="Name for parcel" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 24 }}>
                      <input type="checkbox" id="courier-paid" checked={form.paid} onChange={(e) => setForm((f) => ({ ...f, paid: e.target.checked }))} />
                      <label htmlFor="courier-paid" className="field-label" style={{ marginBottom: 0 }}>Paid</label>
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Delivery address</label>
                    <textarea className="input" value={form.deliveryAddress} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} placeholder="Full address for courier" rows={2} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Courier partner (optional)</label>
                      <input className="input" value={form.courier} onChange={(e) => setForm((f) => ({ ...f, courier: e.target.value }))} placeholder="Delhivery / BlueDart" />
                    </div>
                    <div>
                      <label className="field-label">Tracking number (optional)</label>
                      <input className="input" value={form.tracking} onChange={(e) => setForm((f) => ({ ...f, tracking: e.target.value }))} placeholder="AWB / Tracking ID" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Client name</label>
                      <input className="input" value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} placeholder="Customer name" />
                    </div>
                    <div>
                      <label className="field-label">Frame name</label>
                      <input className="input" value={form.frameName} onChange={(e) => setForm((f) => ({ ...f, frameName: e.target.value }))} placeholder="Frame / product" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Lens type</label>
                      <input className="input" value={form.lensType} onChange={(e) => setForm((f) => ({ ...f, lensType: e.target.value }))} placeholder="Anti-glare / Blue-cut etc." required />
                    </div>
                    <div>
                      <label className="field-label">Lens lab / vendor (optional)</label>
                      <input className="input" value={form.lab} onChange={(e) => setForm((f) => ({ ...f, lab: e.target.value }))} placeholder="Eyelens Lab" />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Lens power / prescription (OD OS, Add, PD)</label>
                    <textarea className="input" value={form.lensPower} onChange={(e) => setForm((f) => ({ ...f, lensPower: e.target.value }))} placeholder="OD -1.00 | OS -1.25 | Add +1.50 | PD 62" rows={2} style={{ resize: "vertical" }} />
                  </div>
                </>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Amount (₹)</label>
                  <input className="input" type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="field-label">Attachment (optional)</label>
                  <input className="input" type="file" onChange={onPickFile} style={{ padding: "9px 12px" }} />
                  {fileMeta && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
                      Selected: <strong style={{ color: "var(--black)" }}>{fileMeta.name}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="field-label">Notes (optional)</label>
                <input className="input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any additional info" />
              </div>

              <button type="submit" className="btn btn-primary">Save receipt</button>
            </form>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">
            {tab === "courier" ? `Courier receipts (${filtered.length})` : `Lens receipts (${filtered.length})`}
          </div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                {tab === "courier" ? (
                  <tr>
                    <th>Receipt</th>
                    <th>Order</th>
                    <th>Delivery name</th>
                    <th>Delivery address</th>
                    <th>Paid / Unpaid</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Receipt</th>
                    <th>Order</th>
                    <th>Client name</th>
                    <th>Frame</th>
                    <th>Lens type</th>
                    <th>Lens power</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", color: "#6B7280" }}>No receipts found. Place an order online to auto-create, or add manually.</td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td><strong style={{ color: "var(--em)" }}>{r.id}</strong></td>
                      <td>{r.orderId}</td>
                      {tab === "courier" ? (
                        <>
                          <td>{r.deliveryName || r.courier || "—"}</td>
                          <td style={{ color: "#6B7280", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }} title={r.deliveryAddress || r.tracking}>{r.deliveryAddress || r.tracking || "—"}</td>
                          <td>
                            {r.paid != null ? (
                              <span className={`badge ${r.paid ? "badge-delivered" : "badge-transit"}`}>{r.paid ? "Paid" : "Unpaid"}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td><strong>₹{Number(r.amount != null ? r.amount : 0).toLocaleString("en-IN")}</strong></td>
                        </>
                      ) : (
                        <>
                          <td>{r.clientName || r.lab || "—"}</td>
                          <td style={{ fontSize: 12 }}>{r.frameName || "—"}</td>
                          <td>{r.lensType}</td>
                          <td style={{ color: "#6B7280", fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }} title={r.lensPower}>{r.lensPower || r.notes || "—"}</td>
                          <td><strong>₹{Number(r.amount || 0).toLocaleString("en-IN")}</strong></td>
                        </>
                      )}
                      <td style={{ color: "#9CA3AF" }}>{r.date}</td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setViewing(r)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewing && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setViewing(null)}
        >
          <div
            ref={viewPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-view-title"
            style={{ background: "var(--white)", borderRadius: 16, padding: 24, maxWidth: 520, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div id="receipt-view-title" className="adm-card-title" style={{ marginBottom: 0 }}>
                {tab === "courier" ? "Courier receipt" : "Lens receipt"} {viewing.id}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeViewing} aria-label="Close dialog">
                ✕ Close
              </button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <div><span style={{ color: "#6B7280", fontSize: 12 }}>Order</span><div style={{ fontWeight: 700 }}>{viewing.orderId}</div></div>
              {tab === "courier" ? (
                <>
                  <div><span style={{ color: "#6B7280", fontSize: 12 }}>Delivery name</span><div>{viewing.deliveryName || viewing.courier || "—"}</div></div>
                  <div><span style={{ color: "#6B7280", fontSize: 12 }}>Delivery address</span><div style={{ whiteSpace: "pre-wrap" }}>{viewing.deliveryAddress || viewing.tracking || "—"}</div></div>
                  {viewing.paid != null && (
                    <div><span style={{ color: "#6B7280", fontSize: 12 }}>Payment</span><div><span className={`badge ${viewing.paid ? "badge-delivered" : "badge-transit"}`}>{viewing.paid ? "Paid" : "Unpaid"}</span></div></div>
                  )}
                  {viewing.courier && viewing.tracking && (
                    <>
                      <div><span style={{ color: "#6B7280", fontSize: 12 }}>Courier</span><div>{viewing.courier}</div></div>
                      <div><span style={{ color: "#6B7280", fontSize: 12 }}>Tracking</span><div style={{ fontFamily: "var(--font-d)" }}>{viewing.tracking}</div></div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div><span style={{ color: "#6B7280", fontSize: 12 }}>Client name</span><div>{viewing.clientName || viewing.lab || "—"}</div></div>
                  {viewing.frameName && <div><span style={{ color: "#6B7280", fontSize: 12 }}>Frame</span><div>{viewing.frameName}</div></div>}
                  <div><span style={{ color: "#6B7280", fontSize: 12 }}>Lens type</span><div>{viewing.lensType}</div></div>
                  {viewing.lensPower && <div><span style={{ color: "#6B7280", fontSize: 12 }}>Lens power</span><div style={{ fontFamily: "var(--font-d)", whiteSpace: "pre-wrap", fontSize: 13 }}>{viewing.lensPower}</div></div>}
                  {viewing.prescription && typeof viewing.prescription === "object" && (
                    <div><span style={{ color: "#6B7280", fontSize: 12 }}>Prescription</span><pre style={{ margin: 0, fontSize: 12, background: "#F3F4F6", padding: 10, borderRadius: 8, overflow: "auto" }}>{JSON.stringify(viewing.prescription, null, 2)}</pre></div>
                  )}
                </>
              )}
              <div><span style={{ color: "#6B7280", fontSize: 12 }}>Amount</span><div><strong>₹{Number(viewing.amount || 0).toLocaleString("en-IN")}</strong></div></div>
              <div><span style={{ color: "#6B7280", fontSize: 12 }}>Date</span><div>{viewing.date}</div></div>
              {viewing.notes && (
                <div><span style={{ color: "#6B7280", fontSize: 12 }}>Notes</span><div>{viewing.notes}</div></div>
              )}
              {viewing.attachment && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: "#6B7280", fontSize: 12, marginBottom: 8 }}>Attachment</div>
                  {isImageMime(viewing.attachment.mime) ? (
                    <img
                      src={viewing.attachment.url}
                      alt={`Receipt scan${viewing.clientName ? ` — ${viewing.clientName}` : viewing.lab ? ` — ${viewing.lab}` : ""}`}
                      style={{ width: "100%", borderRadius: 12, border: "1px solid #E5E9EC" }}
                    />
                  ) : (
                    <a
                      href={viewing.attachment.url}
                      download={viewing.attachment.name}
                      style={{ color: "var(--em)", fontWeight: 700, textDecoration: "none" }}
                    >
                      Download {viewing.attachment.name}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

