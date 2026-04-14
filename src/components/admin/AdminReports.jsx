import { useState } from "react";
import { useBriefSkeleton } from "../../hooks/useBriefSkeleton";

const reportTabs = [
  { id: "sales", label: "Sales report" },
  { id: "purchase", label: "Purchase report" },
  { id: "stock", label: "Stock report" },
  { id: "financial", label: "Financial summary" },
];

const salesReportRows = [
  { date: "2025-01-12", invoice: "INV-2025-001", customer: "Arjun Mehta", amount: 4956, gst: 657 },
  { date: "2025-01-12", invoice: "INV-2025-002", customer: "Priya Nair", amount: 2241, gst: 342 },
  { date: "2025-01-11", invoice: "INV-2024-089", customer: "Kabir Sethi", amount: 5499, gst: 839 },
  { date: "2025-01-10", invoice: "INV-2024-088", customer: "Deepa Krishna", amount: 2299, gst: 351 },
];
const purchaseReportRows = [
  { date: "2025-01-10", bill: "PUR-2025-001", supplier: "Optical Supplies Ltd", amount: 53100, gst: 8100 },
  { date: "2025-01-08", bill: "PUR-2024-042", supplier: "Frame Co", amount: 24800, gst: 4464 },
];
const stockReportRows = [
  { sku: "EL-MRT-001", name: "Milano Round Titanium", category: "Premium", qty: 124, value: 532200 },
  { sku: "EL-HSS-002", name: "Hex Screen Shield", category: "Computer", qty: 88, value: 167112 },
  { sku: "EL-CCR-003", name: "Cartier-Cut Rectangle", category: "Gold", qty: 47, value: 258453 },
  { sku: "EL-CAP-004", name: "Classic Aviator Pro", category: "Sunglasses", qty: 342, value: 785580 },
];

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

export default function AdminReports() {
  const [tab, setTab] = useState("sales");
  const [period, setPeriod] = useState("month");
  const bootSkel = useBriefSkeleton();

  const salesTotal = salesReportRows.reduce((s, r) => s + r.amount + r.gst, 0);
  const purchaseTotal = purchaseReportRows.reduce((s, r) => s + r.amount + r.gst, 0);
  const stockValueTotal = stockReportRows.reduce((s, r) => s + r.value, 0);

  const handleExport = () => {
    const d = new Date().toISOString().slice(0, 10);
    if (tab === "sales") downloadCSV(["Date", "Invoice", "Customer", "Amount", "GST"], salesReportRows.map((r) => [r.date, r.invoice, r.customer, r.amount, r.gst]), `sales-report-${d}.csv`);
    if (tab === "purchase") downloadCSV(["Date", "Bill", "Supplier", "Amount", "GST"], purchaseReportRows.map((r) => [r.date, r.bill, r.supplier, r.amount, r.gst]), `purchase-report-${d}.csv`);
    if (tab === "stock") downloadCSV(["SKU", "Name", "Category", "Qty", "Value"], stockReportRows.map((r) => [r.sku, r.name, r.category, r.qty, r.value]), `stock-report-${d}.csv`);
    if (tab === "financial") downloadCSV(["Report", "Value"], [["Revenue", salesTotal], ["Purchases", purchaseTotal], ["Stock value", stockValueTotal]], `financial-summary-${d}.csv`);
  };

  if (bootSkel) {
    return (
      <div className="adm-page-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="adm-skel-row" style={{ width: 120, height: 34 }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="adm-skel-row" style={{ width: 140, height: 36 }} />
            <div className="adm-skel-row" style={{ width: 100, height: 36 }} />
          </div>
        </div>
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="adm-skel-row" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "55%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "70%", height: 26 }} />
            </div>
          ))}
        </div>
        <div className="adm-row" style={{ flexWrap: "wrap", gap: 20 }}>
          <div className="adm-card" style={{ flex: 1, minWidth: 280 }}>
            <div className="adm-card-pad">
              <div className="adm-skel-row" style={{ width: 180, marginBottom: 16 }} />
              <div style={{ height: 200, borderRadius: 8, overflow: "hidden" }}>
                <div className="adm-skel-row" style={{ width: "100%", height: "100%", maxWidth: "100%" }} />
              </div>
            </div>
          </div>
          <div className="adm-card" style={{ flex: 1, minWidth: 280 }}>
            <div className="adm-card-pad">
              <div className="adm-skel-row" style={{ width: 160, marginBottom: 16 }} />
              <div style={{ height: 200, borderRadius: 8, overflow: "hidden" }}>
                <div className="adm-skel-row" style={{ width: "100%", height: "100%", maxWidth: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div className="inner-tabs" style={{ marginBottom: 0 }}>
          {reportTabs.map((t) => (
            <button key={t.id} type="button" className={`inner-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="input" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: 140, padding: "8px 12px" }}>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      {tab === "sales" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Sales report</div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>GST</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReportRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td><strong style={{ color: "var(--em)" }}>{r.invoice}</strong></td>
                      <td>{r.customer}</td>
                      <td style={{ textAlign: "right" }}>₹{r.amount.toLocaleString("en-IN")}</td>
                      <td style={{ textAlign: "right" }}>₹{r.gst.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #E5E9EC", fontWeight: 800 }}>Total: ₹{salesTotal.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      {tab === "purchase" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Purchase report</div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bill no</th>
                    <th>Supplier</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>GST</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseReportRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td><strong style={{ color: "var(--em)" }}>{r.bill}</strong></td>
                      <td>{r.supplier}</td>
                      <td style={{ textAlign: "right" }}>₹{r.amount.toLocaleString("en-IN")}</td>
                      <td style={{ textAlign: "right" }}>₹{r.gst.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #E5E9EC", fontWeight: 800 }}>Total: ₹{purchaseTotal.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      {tab === "stock" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Stock report (valuation)</div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                    <th style={{ textAlign: "right" }}>Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReportRows.map((r) => (
                    <tr key={r.sku}>
                      <td style={{ color: "#6B7280" }}>{r.sku}</td>
                      <td><strong>{r.name}</strong></td>
                      <td><span className="badge badge-em">{r.category}</span></td>
                      <td style={{ textAlign: "right" }}>{r.qty}</td>
                      <td style={{ textAlign: "right" }}>₹{r.value.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #E5E9EC", fontWeight: 800 }}>Total stock value: ₹{stockValueTotal.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      {tab === "financial" && (
        <div className="adm-row" style={{ flexWrap: "wrap" }}>
          <div className="kpi-grid" style={{ width: "100%", marginBottom: 24 }}>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "var(--em-light)" }}>💰</div>
              <div className="kpi-label">Revenue (sales)</div>
              <div className="kpi-value">₹{salesTotal.toLocaleString("en-IN")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#FEF2F2" }}>📤</div>
              <div className="kpi-label">Purchases</div>
              <div className="kpi-value">₹{purchaseTotal.toLocaleString("en-IN")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#EFF6FF" }}>📦</div>
              <div className="kpi-label">Stock value</div>
              <div className="kpi-value">₹{stockValueTotal.toLocaleString("en-IN")}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#F0FDF4" }}>📊</div>
              <div className="kpi-label">Gross margin</div>
              <div className="kpi-value" style={{ color: "var(--em)" }}>₹{(salesTotal - purchaseTotal).toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="adm-card" style={{ flex: 1, minWidth: 320 }}>
            <div className="adm-card-pad">
              <div className="adm-card-title">Financial summary</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}><span>Total revenue</span><strong>₹{salesTotal.toLocaleString("en-IN")}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}><span>Total purchases</span><strong>₹{purchaseTotal.toLocaleString("en-IN")}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}><span>Inventory value</span><strong>₹{stockValueTotal.toLocaleString("en-IN")}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #E5E9EC", fontWeight: 800, fontSize: 16 }}>
                  <span>Net (revenue − purchases)</span>
                  <span style={{ color: "var(--em)" }}>₹{(salesTotal - purchaseTotal).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
