import { useMemo, useState } from "react";
import { useBriefSkeleton } from "../../hooks/useBriefSkeleton";

const paymentModes = ["Cash", "UPI", "Card", "Bank transfer", "Cheque"];

export default function AdminPayments({ orders = [] }) {
  const [payments, setPayments] = useState([]);
  const [recon, setRecon] = useState([]);
  const invoices = useMemo(
    () =>
      orders.map((o) => ({
        id: `INV-${String(o._id || "").slice(-6).toUpperCase()}`,
        type: "sales",
        party: o.user?.name || o.user?.email || "Customer",
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—",
        total: Number(o.totalAmount || 0),
        status: String(o.paymentStatus || "").toLowerCase() === "paid" ? "paid" : "pending",
      })),
    [orders]
  );
  const autoReceipts = useMemo(
    () =>
      orders
        .filter((o) => String(o.paymentStatus || "").toLowerCase() === "paid")
        .map((o) => ({
          id: `PAY-${String(o._id || "").slice(-6).toUpperCase()}`,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—",
          type: "receipt",
          party: o.user?.name || o.user?.email || "Customer",
          amount: Number(o.totalAmount || 0),
          mode: o.paymentMethod === "razorpay" ? "UPI/Card" : "Cash",
          ref: o.paymentMethod === "razorpay" ? "Online payment" : "COD",
          invoiceId: `INV-${String(o._id || "").slice(-6).toUpperCase()}`,
        })),
    [orders]
  );
  const allPayments = [...payments, ...autoReceipts];
  const [tab, setTab] = useState("payments");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ date: new Date().toISOString().slice(0, 10), party: "", amount: "", mode: "Bank transfer", ref: "", invoiceId: "" });
  const [receiptForm, setReceiptForm] = useState({ date: new Date().toISOString().slice(0, 10), party: "", amount: "", mode: "UPI", ref: "", invoiceId: "" });

  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");
  const totalPending = pendingInvoices.reduce((s, i) => s + i.total, 0);
  const totalReceipts = allPayments.filter((p) => p.type === "receipt").reduce((s, p) => s + p.amount, 0);
  const totalPayments = allPayments.filter((p) => p.type === "payment").reduce((s, p) => s + p.amount, 0);

  const submitPayment = (e) => {
    e.preventDefault();
    if (!paymentForm.party.trim() || !paymentForm.amount) return;
    setPayments((prev) => [
      { id: "PAY-" + String(prev.length + 1).padStart(3, "0"), date: paymentForm.date, type: "payment", party: paymentForm.party.trim(), amount: Number(paymentForm.amount), mode: paymentForm.mode, ref: paymentForm.ref, invoiceId: paymentForm.invoiceId || null },
      ...prev,
    ]);
    setPaymentForm({ date: new Date().toISOString().slice(0, 10), party: "", amount: "", mode: "Bank transfer", ref: "", invoiceId: "" });
    setShowPaymentForm(false);
  };

  const submitReceipt = (e) => {
    e.preventDefault();
    if (!receiptForm.party.trim() || !receiptForm.amount) return;
    setPayments((prev) => [
      { id: "PAY-" + String(prev.length + 1).padStart(3, "0"), date: receiptForm.date, type: "receipt", party: receiptForm.party.trim(), amount: Number(receiptForm.amount), mode: receiptForm.mode, ref: receiptForm.ref, invoiceId: receiptForm.invoiceId || null },
      ...prev,
    ]);
    setReceiptForm({ date: new Date().toISOString().slice(0, 10), party: "", amount: "", mode: "UPI", ref: "", invoiceId: "" });
    setShowReceiptForm(false);
  };

  const addReconLine = () => {
    setRecon((prev) => [...prev, { date: new Date().toISOString().slice(0, 10), particulars: "New entry", bank: 0, book: 0, match: false }]);
  };

  const bootSkel = useBriefSkeleton();

  if (bootSkel) {
    return (
      <div className="adm-page-section">
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="adm-skel-row" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "62%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "48%", height: 24 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="adm-skel-row" style={{ width: 160, height: 34 }} />
          ))}
        </div>
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-skel-row" style={{ width: 300, marginBottom: 16 }} />
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Reference</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 8 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${42 + ((r + c) % 6) * 9}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page-section">
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#F0FDF4" }}>📥</div>
          <div className="kpi-label">Total receipts</div>
          <div className="kpi-value" style={{ color: "var(--em)" }}>₹{totalReceipts.toLocaleString("en-IN")}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#FEF2F2" }}>📤</div>
          <div className="kpi-label">Total payments</div>
          <div className="kpi-value">₹{totalPayments.toLocaleString("en-IN")}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#FEF8EE" }}>⏳</div>
          <div className="kpi-label">Pending invoices</div>
          <div className="kpi-value" style={{ color: totalPending > 0 ? "var(--amber)" : "var(--green)" }}>₹{totalPending.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="inner-tabs" style={{ marginBottom: 20 }}>
        {["payments", "pending", "reconciliation"].map((id) => (
          <button key={id} type="button" className={`inner-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
            {id === "payments" ? "Payments & receipts" : id === "pending" ? "Pending invoices" : "Bank reconciliation"}
          </button>
        ))}
      </div>

      {tab === "payments" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowReceiptForm(true)}>+ Record receipt</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPaymentForm(true)}>+ Record payment</button>
          </div>
          {showReceiptForm && (
            <div className="adm-card" style={{ marginBottom: 20 }}>
              <div className="adm-card-pad">
                <div className="adm-card-title">Record receipt</div>
                <form onSubmit={submitReceipt} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, maxWidth: 640 }}>
                  <div>
                    <label className="field-label">Date</label>
                    <input className="input" type="date" value={receiptForm.date} onChange={(e) => setReceiptForm((f) => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="field-label">Received from</label>
                    <input className="input" value={receiptForm.party} onChange={(e) => setReceiptForm((f) => ({ ...f, party: e.target.value }))} placeholder="Party name" required />
                  </div>
                  <div>
                    <label className="field-label">Amount (₹)</label>
                    <input className="input" type="number" min={0} value={receiptForm.amount} onChange={(e) => setReceiptForm((f) => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="field-label">Mode</label>
                    <select className="input" value={receiptForm.mode} onChange={(e) => setReceiptForm((f) => ({ ...f, mode: e.target.value }))}>
                      {paymentModes.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Reference</label>
                    <input className="input" value={receiptForm.ref} onChange={(e) => setReceiptForm((f) => ({ ...f, ref: e.target.value }))} placeholder="Txn/Ref no" />
                  </div>
                  <div>
                    <label className="field-label">Against invoice (optional)</label>
                    <select className="input" value={receiptForm.invoiceId} onChange={(e) => setReceiptForm((f) => ({ ...f, invoiceId: e.target.value }))}>
                      <option value="">—</option>
                      {invoices.filter((i) => i.type === "sales").map((i) => (
                        <option key={i.id} value={i.id}>{i.id} – {i.party}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button type="submit" className="btn btn-primary">Save receipt</button>
                    <button type="button" className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => setShowReceiptForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showPaymentForm && (
            <div className="adm-card" style={{ marginBottom: 20 }}>
              <div className="adm-card-pad">
                <div className="adm-card-title">Record payment</div>
                <form onSubmit={submitPayment} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, maxWidth: 640 }}>
                  <div>
                    <label className="field-label">Date</label>
                    <input className="input" type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((f) => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="field-label">Paid to</label>
                    <input className="input" value={paymentForm.party} onChange={(e) => setPaymentForm((f) => ({ ...f, party: e.target.value }))} placeholder="Party name" required />
                  </div>
                  <div>
                    <label className="field-label">Amount (₹)</label>
                    <input className="input" type="number" min={0} value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="field-label">Mode</label>
                    <select className="input" value={paymentForm.mode} onChange={(e) => setPaymentForm((f) => ({ ...f, mode: e.target.value }))}>
                      {paymentModes.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Reference</label>
                    <input className="input" value={paymentForm.ref} onChange={(e) => setPaymentForm((f) => ({ ...f, ref: e.target.value }))} placeholder="NEFT/Cheque no" />
                  </div>
                  <div>
                    <label className="field-label">Against bill (optional)</label>
                    <select className="input" value={paymentForm.invoiceId} onChange={(e) => setPaymentForm((f) => ({ ...f, invoiceId: e.target.value }))}>
                      <option value="">—</option>
                      {invoices.filter((i) => i.type === "purchase").map((i) => (
                        <option key={i.id} value={i.id}>{i.id} – {i.party}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button type="submit" className="btn btn-primary">Save payment</button>
                    <button type="button" className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => setShowPaymentForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="adm-card">
            <div className="adm-card-pad">
              <div className="adm-card-title">Payment & receipt vouchers</div>
              <div className="table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Party</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Reference</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((p) => (
                      <tr key={p.id}>
                        <td><strong style={{ color: "var(--em)" }}>{p.id}</strong></td>
                        <td>{p.date}</td>
                        <td><span className={`badge ${p.type === "receipt" ? "badge-delivered" : "badge-transit"}`}>{p.type}</span></td>
                        <td>{p.party}</td>
                        <td><strong>₹{Number(p.amount).toLocaleString("en-IN")}</strong></td>
                        <td>{p.mode}</td>
                        <td style={{ color: "#6B7280", fontSize: 12 }}>{p.ref}</td>
                        <td style={{ fontSize: 12 }}>{p.invoiceId || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "pending" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Pending invoices ({pendingInvoices.length})</div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Party</th>
                    <th>Date</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "#6B7280" }}>No pending invoices</td></tr>
                  ) : (
                    pendingInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td><strong style={{ color: "var(--em)" }}>{inv.id}</strong></td>
                        <td>{inv.party}</td>
                        <td>{inv.date}</td>
                        <td><strong>₹{Number(inv.total).toLocaleString("en-IN")}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPending > 0 && <div style={{ marginTop: 16, fontWeight: 800 }}>Total outstanding: ₹{totalPending.toLocaleString("en-IN")}</div>}
          </div>
        </div>
      )}

      {tab === "reconciliation" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="adm-card-title" style={{ marginBottom: 0 }}>Bank reconciliation</div>
              <button type="button" className="btn btn-primary btn-sm" onClick={addReconLine}>+ Add entry</button>
            </div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Particulars</th>
                    <th style={{ textAlign: "right" }}>Bank (₹)</th>
                    <th style={{ textAlign: "right" }}>Book (₹)</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {recon.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.particulars}</td>
                      <td style={{ textAlign: "right" }}>{r.bank >= 0 ? "₹" + r.bank.toLocaleString("en-IN") : "-₹" + Math.abs(r.bank).toLocaleString("en-IN")}</td>
                      <td style={{ textAlign: "right" }}>{r.book >= 0 ? "₹" + r.book.toLocaleString("en-IN") : "-₹" + Math.abs(r.book).toLocaleString("en-IN")}</td>
                      <td>{r.match ? <span className="badge badge-delivered">✓</span> : <span className="badge badge-transit">Pending</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
