import { useState } from "react";
import { useBriefSkeleton } from "../../hooks/useBriefSkeleton";

const gstRates = [0, 5, 12, 18, 28];

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

function getInvoiceHtml(inv) {
  const gstAmt = inv.gst != null ? inv.gst : Math.round(inv.amount * 0.18);
  const total = inv.total != null ? inv.total : inv.amount + gstAmt;
  return `
    <!DOCTYPE html><html><head><title>Invoice ${inv.id}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:600px;margin:0 auto}
    table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:10px;text-align:left}
    .head{text-align:center;margin-bottom:24px}.meta{color:#666;font-size:12px;margin-top:8px}
    .right{text-align:right}.total{font-weight:700;font-size:18px;margin-top:16px}
    .gst-note{font-size:11px;color:#666;margin-top:20px}</style></head><body>
    <div class="head"><h1>TAX INVOICE</h1><div class="meta">${inv.id} | ${inv.date}</div></div>
    <p><strong>${inv.type === "sales" ? "Bill to" : "Supplier"}:</strong> ${inv.party}</p>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead><tbody>
    ${(inv.items || [{ desc: "Goods", qty: 1, rate: inv.amount, amount: inv.amount }]).map((i) => `<tr><td>${i.desc}</td><td>${i.qty}</td><td>${i.rate?.toLocaleString("en-IN")}</td><td>${i.amount?.toLocaleString("en-IN")}</td></tr>`).join("")}
    </tbody></table>
    <p class="right">Taxable value: ₹${Number(inv.amount).toLocaleString("en-IN")}</p>
    <p class="right">GST: ₹${gstAmt.toLocaleString("en-IN")}</p>
    <p class="right total">Total: ₹${total.toLocaleString("en-IN")}</p>
    <p class="gst-note">GSTIN: 29AAAAA0000A1Z5 | Place of supply: Karnataka</p>
    </body></html>`;
}

function printInvoice(inv) {
  const win = window.open("", "_blank");
  win.document.write(getInvoiceHtml(inv));
  win.document.close();
  win.print();
  win.close();
}

function downloadInvoice(inv) {
  const html = getInvoiceHtml(inv);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `invoice-${inv.id}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("sales");
  const [form, setForm] = useState({ party: "", date: new Date().toISOString().slice(0, 10), items: [{ desc: "", qty: 1, rate: "", amount: "" }], gstRate: 18 });
  const filtered = invoices.filter((inv) => filter === "all" || inv.type === filter);

  const addItemLine = () => setForm((f) => ({ ...f, items: [...f.items, { desc: "", qty: 1, rate: "", amount: "" }] }));
  const removeItemLine = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, [field]: value };
        if (field === "qty" || field === "rate") next.amount = (Number(next.qty) || 0) * (Number(next.rate) || 0);
        return next;
      }),
    }));
  };

  const submitInvoice = (e) => {
    e.preventDefault();
    if (!form.party.trim() || form.items.every((i) => !i.desc && !i.amount)) return;
    const amount = form.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const gstRate = Number(form.gstRate) || 0;
    const gst = Math.round(amount * (gstRate / 100));
    const total = amount + gst;
    const prefix = formType === "sales" ? "INV" : "PUR";
    const nextNum = invoices.filter((i) => i.type === formType).length + 1;
    const newInv = {
      id: `${prefix}-2025-${String(nextNum).padStart(3, "0")}`,
      type: formType,
      party: form.party.trim(),
      date: form.date,
      amount,
      gst,
      total,
      status: "pending",
      items: form.items.filter((i) => i.desc || i.amount).map((i) => ({ desc: i.desc || "Item", qty: Number(i.qty) || 1, rate: Number(i.rate) || 0, amount: Number(i.amount) || 0 })),
    };
    setInvoices((prev) => [newInv, ...prev]);
    setForm({ party: "", date: new Date().toISOString().slice(0, 10), items: [{ desc: "", qty: 1, rate: "", amount: "" }], gstRate: 18 });
    setShowForm(false);
  };

  const handleExport = () => {
    const headers = ["ID", "Type", "Party", "Date", "Amount", "GST", "Total", "Status"];
    const rows = filtered.map((i) => [i.id, i.type, i.party, i.date, i.amount, i.gst, i.total, i.status]);
    downloadCSV(headers, rows, `invoices-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const bootSkel = useBriefSkeleton();

  if (bootSkel) {
    return (
      <div className="adm-page-section">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="adm-skel-row" style={{ width: i < 3 ? 88 : 120, height: 34 }} />
          ))}
        </div>
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-skel-row" style={{ width: 220, marginBottom: 16 }} />
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 9 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${40 + ((r + c) % 7) * 8}%`, maxWidth: "100%" }}
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div className="inner-tabs" style={{ marginBottom: 0 }}>
          {["all", "sales", "purchase"].map((id) => (
            <button key={id} type="button" className={`inner-tab${filter === id ? " active" : ""}`} onClick={() => setFilter(id)}>
              {id === "all" ? "All" : id === "sales" ? "Sales" : "Purchase"}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setFormType("sales"); setShowForm(true); }}>+ Sales invoice</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setFormType("purchase"); setShowForm(true); }}>+ Purchase invoice</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport}>Export CSV</button>
      </div>

      {showForm && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">{formType === "sales" ? "New sales invoice" : "New purchase invoice"} (GST)</div>
            <form onSubmit={submitInvoice} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">{formType === "sales" ? "Customer / Party" : "Supplier"}</label>
                  <input className="input" value={form.party} onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))} placeholder="Name" required />
                </div>
                <div>
                  <label className="field-label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="field-label">GST %</label>
                  <select className="input" value={form.gstRate} onChange={(e) => setForm((f) => ({ ...f, gstRate: e.target.value }))}>
                    {gstRates.map((r) => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="field-label">Items</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addItemLine}>+ Add line</button>
                </div>
                <div className="table-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Amount (₹)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <input className="input" style={{ minWidth: 180 }} value={row.desc} onChange={(e) => updateItem(idx, "desc", e.target.value)} placeholder="Description" />
                          </td>
                          <td>
                            <input className="input" type="number" min={1} style={{ width: 70 }} value={row.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                          </td>
                          <td>
                            <input className="input" type="number" min={0} style={{ width: 90 }} value={row.rate} onChange={(e) => updateItem(idx, "rate", e.target.value)} />
                          </td>
                          <td><strong>{(Number(row.qty) || 0) * (Number(row.rate) || 0)}</strong></td>
                          <td>{form.items.length > 1 && <button type="button" className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeItemLine(idx)}>✕</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary">Create invoice</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">Invoices ({filtered.length})</div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Party</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong style={{ color: "var(--em)" }}>{inv.id}</strong></td>
                    <td><span className="badge badge-em">{inv.type}</span></td>
                    <td>{inv.party}</td>
                    <td>{inv.date}</td>
                    <td>₹{Number(inv.amount).toLocaleString("en-IN")}</td>
                    <td>₹{Number(inv.gst).toLocaleString("en-IN")}</td>
                    <td><strong>₹{Number(inv.total).toLocaleString("en-IN")}</strong></td>
                    <td><span className={`badge ${inv.status === "paid" ? "badge-delivered" : "badge-transit"}`}>{inv.status}</span></td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => printInvoice(inv)}>Print</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadInvoice(inv)}>Download</button>
                    </td>
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
