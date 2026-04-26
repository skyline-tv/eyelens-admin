import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";
import AdminModal from "../AdminModal.jsx";

const STATUS_OPTS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function mapOrder(o) {
  const statusUi = {
    pending: "processing",
    confirmed: "processing",
    shipped: "transit",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  const addr = o.shippingAddress && typeof o.shippingAddress === "object"
    ? [o.shippingAddress.address, o.shippingAddress.city, o.shippingAddress.pincode].filter(Boolean).join(", ")
    : String(o.shippingAddress || "");
  const items = (o.items || []).map((it) => ({
    name: it.name || "—",
    brand: it.brand || "",
    price: it.price,
    qty: it.qty || 1,
    lens: it.lens,
    prescription: it.prescription,
    frameOptions: it.frameOptions,
  }));
  return {
    id: `#${String(o._id).slice(-6)}`,
    _id: o._id,
    customer: o.user?.name || "—",
    product: o.items?.[0]?.name || "—",
    items,
    amount: `₹${Number(o.totalAmount || 0).toLocaleString("en-IN")}`,
    status: statusUi[o.status] || o.status,
    rawStatus: o.status,
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
    email: o.user?.email || "",
    address: addr,
    paymentStatus: o.paymentStatus || "pending",
    paymentMethod: o.paymentMethod || "",
    paymentId: o.paymentId || "",
  };
}

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function downloadTextFile(content, filename, mime = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function compare(a, b, dir) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return dir === "asc" ? a - b : b - a;
  const as = String(a).toLowerCase();
  const bs = String(b).toLowerCase();
  if (as < bs) return dir === "asc" ? -1 : 1;
  if (as > bs) return dir === "asc" ? 1 : -1;
  return 0;
}

function buildInvoiceNo(orderId) {
  return `INV-${String(orderId || "").slice(-8).toUpperCase() || "NA"}`;
}

function buildOrderRef(orderId) {
  return `#${String(orderId || "").slice(-6)}`;
}

function formatPrescriptionText(prescription) {
  if (!prescription || typeof prescription !== "object") return "";
  const parts = [];
  if (prescription.patientName) parts.push(`Patient: ${prescription.patientName}`);
  if (prescription.odSphere || prescription.odCylinder || prescription.odAxis) {
    parts.push(`OD ${[prescription.odSphere, prescription.odCylinder, prescription.odAxis].filter(Boolean).join(" / ")}`);
  }
  if (prescription.osSphere || prescription.osCylinder || prescription.osAxis) {
    parts.push(`OS ${[prescription.osSphere, prescription.osCylinder, prescription.osAxis].filter(Boolean).join(" / ")}`);
  }
  if (prescription.add) parts.push(`Add ${prescription.add}`);
  if (prescription.pd) parts.push(`PD ${prescription.pd}`);
  return parts.join(" | ");
}

function buildLensReceiptText(receipt) {
  return [
    "EYELENS - LENS RECEIPT",
    "",
    `Receipt No: ${receipt.id || "—"}`,
    `Order No: ${receipt.orderId || "—"}`,
    `Invoice No: ${receipt.invoiceNo || "—"}`,
    `Client Name: ${receipt.clientName || "—"}`,
    `Frame: ${receipt.frameName || "—"}`,
    `Lens Type: ${receipt.lensType || "—"}`,
    `Prescription: ${receipt.lensPower || "—"}`,
    `Amount: INR ${Number(receipt.amount || 0).toLocaleString("en-IN")}`,
    `Date: ${receipt.date || "—"}`,
    receipt.notes ? `Notes: ${receipt.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function AdminOrders({
  courierReceipts = [],
  lensReceipts = [],
  setCourierReceipts = () => {},
  setLensReceipts = () => {},
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewOrder, setViewOrder] = useState(null);
  const { push } = useToast();
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders((data.data || []).map(mapOrder));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = orders.filter((o) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "processing" && ["pending", "confirmed"].includes(o.rawStatus)) ||
      (statusFilter === "transit" && o.rawStatus === "shipped") ||
      (statusFilter === "delivered" && o.rawStatus === "delivered") ||
      o.rawStatus === statusFilter;
    const matchSearch =
      !search ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((x, y) => {
    const key = sort.key;
    const dir = sort.dir;
    if (key === "amount") return compare(Number(String(x.amount).replace(/[^\d]/g, "")), Number(String(y.amount).replace(/[^\d]/g, "")), dir);
    if (key === "customer") return compare(x.customer, y.customer, dir);
    if (key === "status") return compare(x.rawStatus, y.rawStatus, dir);
    if (key === "id") return compare(x.id, y.id, dir);
    return compare(x.date, y.date, dir);
  });

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const sortGlyph = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Product", "Amount", "Status", "Payment", "Date"];
    const rows = filtered.map((o) => [o.id, o.customer, o.product, o.amount, o.rawStatus, o.paymentStatus, o.date]);
    downloadCSV(headers, rows, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const statusUi = {
    pending: "processing",
    confirmed: "processing",
    shipped: "transit",
    delivered: "delivered",
    cancelled: "cancelled",
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      const targetOrder = orders.find((o) => String(o._id) === String(orderId));
      if (status === "delivered" && targetOrder) {
        const hasLensLine = (targetOrder.items || []).some(
          (it) => it?.lens?.name || (it?.prescription && it.prescription.mode !== "none")
        );
        if (hasLensLine) {
          setLensReceipts((prev) => {
            const orderRef = buildOrderRef(targetOrder._id);
            if (prev.some((r) => String(r.orderId) === orderRef)) return prev;
            const firstItem = targetOrder.items?.[0] || {};
            const firstRxItem = (targetOrder.items || []).find((it) => it?.prescription);
            const prescription = firstRxItem?.prescription || null;
            return [
              {
                id: `LR-${String(prev.length + 1).padStart(3, "0")}`,
                orderId: orderRef,
                clientName: targetOrder.customer || "—",
                invoiceNo: buildInvoiceNo(targetOrder._id),
                lensType: firstItem?.lens?.name || "Prescription lens",
                frameName: firstItem?.name || "—",
                lensPower: formatPrescriptionText(prescription),
                prescription,
                amount: Number(String(targetOrder.amount).replace(/[^\d]/g, "")) || 0,
                date: new Date().toISOString().slice(0, 10),
                notes: "Auto-created when order marked as received.",
              },
              ...prev,
            ];
          });
          push({ type: "success", title: "Lens receipt created", message: "Order received; lens receipt auto-created." });
        }
      }
      await refresh();
      setViewOrder((prev) => {
        if (!prev || String(prev._id) !== String(orderId)) return prev;
        return { ...prev, rawStatus: status, status: statusUi[status] || status };
      });
      push({ type: "success", title: "Status updated", message: `Order marked as ${status}` });
    } catch {
      push({ type: "error", title: "Update failed", message: "Could not update order status." });
    }
  };

  const createCourierReceipt = (order) => {
    setCourierReceipts((prev) => {
      const orderRef = order.id;
      if (prev.some((r) => String(r.orderId) === orderRef)) return prev;
      return [
        {
          id: `CR-${String(prev.length + 1).padStart(3, "0")}`,
          orderId: orderRef,
          invoiceNo: buildInvoiceNo(order._id),
          deliveryName: order.customer || "—",
          deliveryAddress: order.address || "—",
          paid: order.paymentStatus === "paid",
          amount: Number(String(order.amount).replace(/[^\d]/g, "")) || 0,
          date: new Date().toISOString().slice(0, 10),
          notes: "Created from Orders action.",
        },
        ...prev,
      ];
    });
    push({ type: "success", title: "Courier receipt created", message: `Created for ${order.id}.` });
  };

  const createLensReceipt = (order) => {
    const orderRef = order.id;
    const firstItem = order.items?.[0] || {};
    const firstRxItem = (order.items || []).find((it) => it?.prescription);
    const prescription = firstRxItem?.prescription || null;
    const existing = lensReceipts.find((r) => String(r.orderId) === orderRef);
    if (existing) {
      downloadTextFile(buildLensReceiptText(existing), `lens-receipt-${String(order._id).slice(-8)}.txt`);
      push({ type: "success", title: "Lens receipt downloaded", message: `Downloaded for ${order.id}.` });
      return;
    }
    const created = {
      id: `LR-${String(lensReceipts.length + 1).padStart(3, "0")}`,
      orderId: orderRef,
      clientName: order.customer || "—",
      invoiceNo: buildInvoiceNo(order._id),
      lensType: firstItem?.lens?.name || "Prescription lens",
      frameName: firstItem?.name || "—",
      lensPower: formatPrescriptionText(prescription),
      prescription,
      amount: Number(String(order.amount).replace(/[^\d]/g, "")) || 0,
      date: new Date().toISOString().slice(0, 10),
      notes: "Created from Orders action.",
    };
    setLensReceipts((prev) => [created, ...prev]);
    downloadTextFile(buildLensReceiptText(created), `lens-receipt-${String(order._id).slice(-8)}.txt`);
    push({ type: "success", title: "Lens receipt created", message: `Created and downloaded for ${order.id}.` });
  };

  return (
    <div className="adm-page-section">
      <div className="adm-page-head">
        <div>
          <div className="adm-page-title">Orders</div>
          <div className="adm-page-sub">Search, export, and update order statuses.</div>
        </div>
        <div className="adm-toolbar">
          <div className="adm-input-wrap">
            <span className="adm-input-icon">🔎</span>
            <input
              className="input adm-input"
              placeholder="Search by order ID or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300, padding: "10px 14px" }}
            />
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <div className="inner-tabs" style={{ marginBottom: 0 }}>
          {["all", "processing", "transit", "delivered"].map((id) => (
            <button
              key={id}
              type="button"
              className={`inner-tab${statusFilter === id ? " active" : ""}`}
              onClick={() => setStatusFilter(id)}
            >
              {id === "all" ? "All" : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <span className="adm-pill" style={{ marginLeft: "auto" }}>
          <span className="adm-pill-dot" />
          {filtered.length} shown
        </span>
      </div>
      <div className="adm-card">
        <div className="adm-card-pad">
          {loading ? (
            <div className="adm-skel-stack">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="adm-skel-row" style={{ width: `${92 - (i % 4) * 10}%` }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="adm-empty">
              <div className="ico">📭</div>
              <div className="t">No orders found</div>
              <div className="d">Try a different search term or clear the status filter.</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("id")}>
                      Order ID{sortGlyph("id")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("customer")}>
                      Customer{sortGlyph("customer")}
                    </th>
                    <th>Product</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("amount")}>
                      Amount{sortGlyph("amount")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("status")}>
                      Status{sortGlyph("status")}
                    </th>
                    <th>Payment</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("date")}>
                      Date{sortGlyph("date")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <strong style={{ color: "var(--em)" }}>{o.id}</strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="adm-avatar" aria-label={`${o.customer} profile picture`}>
                            {o.customer[0]}
                          </div>
                          {o.customer}
                        </div>
                      </td>
                      <td>{o.product}</td>
                      <td>
                        <strong>{o.amount}</strong>
                      </td>
                      <td>
                        <span
                          className={`adm-pill ${
                            o.rawStatus === "delivered"
                              ? "adm-pill--ok"
                              : o.rawStatus === "shipped"
                                ? "adm-pill--info"
                                : o.rawStatus === "cancelled"
                                  ? "adm-pill--bad"
                                  : "adm-pill--warn"
                          }`}
                        >
                          <span className="adm-pill-dot" />
                          {o.rawStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`adm-pill ${
                            o.paymentStatus === "paid"
                              ? "adm-pill--ok"
                              : o.paymentStatus === "failed"
                                ? "adm-pill--bad"
                                : "adm-pill--warn"
                          }`}
                        >
                          <span className="adm-pill-dot" />
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td style={{ color: "var(--g400)" }}>{o.date}</td>
                      <td style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <select
                          className="input"
                          style={{ padding: "6px 10px", fontSize: 12, minWidth: 120 }}
                          value={o.rawStatus}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                        >
                          {STATUS_OPTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => setViewOrder(o)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => createCourierReceipt(o)}
                          disabled={courierReceipts.some((r) => String(r.orderId) === o.id)}
                          title="Create courier receipt"
                        >
                          Courier receipt
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => createLensReceipt(o)}
                          title="Create lens receipt"
                        >
                          Lens receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={Boolean(viewOrder)}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Order ${viewOrder.id}` : "Order"}
        ariaLabel={viewOrder ? `Order ${viewOrder.id} details` : "Order details"}
        footer={
          <button type="button" className="btn btn-ghost" onClick={() => setViewOrder(null)}>
            Close
          </button>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Customer</span>
            <div style={{ fontWeight: 700 }}>{viewOrder?.customer}</div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Email</span>
            <div>{viewOrder?.email}</div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Address</span>
            <div>{viewOrder?.address}</div>
          </div>
          <div>
            <label className="field-label" htmlFor="order-detail-status">
              Update status
            </label>
            <select
              id="order-detail-status"
              className="input"
              style={{ maxWidth: 220, marginTop: 6 }}
              value={viewOrder?.rawStatus || "pending"}
              onChange={(e) => viewOrder && updateStatus(viewOrder._id, e.target.value)}
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Line items</span>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
              {(viewOrder?.items?.length ? viewOrder.items : [{ name: viewOrder?.product, qty: 1 }]).map((it, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <div>
                    {it.name}
                    {it.brand ? ` · ${it.brand}` : ""}
                    {it.qty != null && it.qty > 1 ? ` ×${it.qty}` : ""}
                    {it.price != null ? ` — ₹${Number(it.price).toLocaleString("en-IN")}` : ""}
                  </div>
                  {(it.lens?.name || it.frameOptions?.color || it.prescription?.mode) ? (
                    <div style={{ fontSize: 12, color: "var(--g500)", marginTop: 4, lineHeight: 1.45 }}>
                      {it.lens?.name ? <span>Lenses: {it.lens.name}. </span> : null}
                      {(it.frameOptions?.color || it.frameOptions?.size) ? (
                        <span>
                          Frame: {[it.frameOptions.color, it.frameOptions.size].filter(Boolean).join(" · ")}.{" "}
                        </span>
                      ) : null}
                      {it.prescription?.mode === "saved" ? (
                        <span>
                          Rx: {it.prescription.patientName || "Attached"}
                          {(it.prescription.odSphere || it.prescription.osSphere)
                            ? ` (OD ${it.prescription.odSphere || "—"} / OS ${it.prescription.osSphere || "—"})`
                            : ""}
                          .
                        </span>
                      ) : it.prescription?.mode === "none" ? (
                        <span>Rx: not supplied.</span>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Amount</span>
            <div style={{ fontWeight: 900 }}>{viewOrder?.amount}</div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Payment</span>
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span
                className={`adm-pill ${
                  viewOrder?.paymentStatus === "paid"
                    ? "adm-pill--ok"
                    : viewOrder?.paymentStatus === "failed"
                      ? "adm-pill--bad"
                      : "adm-pill--warn"
                }`}
              >
                <span className="adm-pill-dot" />
                {viewOrder?.paymentStatus}
              </span>
              {viewOrder?.paymentMethod ? (
                <span style={{ fontSize: 12, color: "var(--g600)" }}>{viewOrder.paymentMethod}</span>
              ) : null}
            </div>
          </div>
          {viewOrder?.paymentStatus === "paid" && viewOrder?.paymentId ? (
            <div>
              <span style={{ color: "var(--g500)", fontSize: 12 }}>Payment ID</span>
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>{viewOrder.paymentId}</div>
            </div>
          ) : null}
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Current status</span>
            <div style={{ marginTop: 6 }}>
              <span
                className={`adm-pill ${
                  viewOrder?.rawStatus === "delivered"
                    ? "adm-pill--ok"
                    : viewOrder?.rawStatus === "shipped"
                      ? "adm-pill--info"
                      : viewOrder?.rawStatus === "cancelled"
                        ? "adm-pill--bad"
                        : "adm-pill--warn"
                }`}
              >
                <span className="adm-pill-dot" />
                {viewOrder?.rawStatus}
              </span>
            </div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Date</span>
            <div>{viewOrder?.date}</div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
