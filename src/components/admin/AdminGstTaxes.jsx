import { useState } from "react";
import { hsnSacCodes } from "../../data/accountingData";

export default function AdminGstTaxes() {
  const [calcAmount, setCalcAmount] = useState("");
  const [calcRate, setCalcRate] = useState(18);
  const [hsnFilter, setHsnFilter] = useState("");
  const [newHsn, setNewHsn] = useState({ code: "", desc: "", gstRate: 18 });
  const [codes, setCodes] = useState(hsnSacCodes);
  const [showHsnForm, setShowHsnForm] = useState(false);

  const taxable = parseFloat(calcAmount) || 0;
  const gstAmount = Math.round(taxable * (Number(calcRate) / 100));
  const totalWithGst = taxable + gstAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  const filteredCodes = codes.filter((c) => !hsnFilter || c.code.toLowerCase().includes(hsnFilter.toLowerCase()) || c.desc.toLowerCase().includes(hsnFilter.toLowerCase()));

  const addHsn = (e) => {
    e.preventDefault();
    if (!newHsn.code.trim()) return;
    setCodes((prev) => [...prev, { code: newHsn.code.trim(), desc: newHsn.desc.trim() || newHsn.code, gstRate: Number(newHsn.gstRate) || 0 }]);
    setNewHsn({ code: "", desc: "", gstRate: 18 });
    setShowHsnForm(false);
  };

  // Mock GST report data
  const gstReport = [
    { period: "Jan 2025", outwardTaxable: 2847600, outwardTax: 341712, inwardTaxable: 450000, inwardTax: 81000, netPayable: 260712 },
    { period: "Dec 2024", outwardTaxable: 2298400, outwardTax: 275808, inwardTaxable: 380000, inwardTax: 68400, netPayable: 207408 },
  ];

  return (
    <div className="adm-page-section">
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "var(--em-light)" }}>🧮</div>
          <div className="kpi-label">GST calculator</div>
          <div className="kpi-value" style={{ fontSize: 16 }}>Enter amount below</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#EFF6FF" }}>📋</div>
          <div className="kpi-label">HSN / SAC codes</div>
          <div className="kpi-value">{codes.length}</div>
        </div>
      </div>

      <div className="adm-row" style={{ flexWrap: "wrap" }}>
        <div className="adm-card" style={{ flex: 1, minWidth: 300 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">GST calculation</div>
            <div style={{ display: "grid", gap: 14, maxWidth: 360 }}>
              <div>
                <label className="field-label">Taxable value (₹)</label>
                <input className="input" type="number" min={0} value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="field-label">GST rate %</label>
                <select className="input" value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))}>
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              {taxable > 0 && (
                <div style={{ padding: "14px 0", borderTop: "1px solid #E5E9EC" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>CGST ({calcRate / 2}%)</span><strong>₹{cgst.toLocaleString("en-IN")}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>SGST ({calcRate / 2}%)</span><strong>₹{sgst.toLocaleString("en-IN")}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginTop: 10 }}><span>Total with GST</span><span style={{ color: "var(--em)" }}>₹{totalWithGst.toLocaleString("en-IN")}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ flex: 1.5, minWidth: 320 }}>
          <div className="adm-card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div className="adm-card-title" style={{ marginBottom: 0 }}>HSN / SAC codes</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" placeholder="Search…" value={hsnFilter} onChange={(e) => setHsnFilter(e.target.value)} style={{ width: 140, padding: "6px 10px" }} />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowHsnForm(!showHsnForm)}>{showHsnForm ? "Cancel" : "+ Add code"}</button>
              </div>
            </div>
            {showHsnForm && (
              <form onSubmit={addHsn} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px auto", gap: 8, alignItems: "end", marginBottom: 16 }}>
                <div>
                  <label className="field-label">Code</label>
                  <input className="input" value={newHsn.code} onChange={(e) => setNewHsn((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. 9004" required />
                </div>
                <div>
                  <label className="field-label">Description</label>
                  <input className="input" value={newHsn.desc} onChange={(e) => setNewHsn((f) => ({ ...f, desc: e.target.value }))} placeholder="Description" />
                </div>
                <div>
                  <label className="field-label">GST %</label>
                  <select className="input" value={newHsn.gstRate} onChange={(e) => setNewHsn((f) => ({ ...f, gstRate: Number(e.target.value) }))}>
                    {[0, 5, 12, 18, 28].map((r) => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
              </form>
            )}
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>GST rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((c) => (
                    <tr key={c.code}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.desc}</td>
                      <td><span className="badge badge-em">{c.gstRate}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-card" style={{ marginTop: 24 }}>
        <div className="adm-card-pad">
          <div className="adm-card-title">GST report (summary)</div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th style={{ textAlign: "right" }}>Outward taxable</th>
                  <th style={{ textAlign: "right" }}>Outward tax</th>
                  <th style={{ textAlign: "right" }}>Inward taxable</th>
                  <th style={{ textAlign: "right" }}>Inward tax</th>
                  <th style={{ textAlign: "right" }}>Net payable</th>
                </tr>
              </thead>
              <tbody>
                {gstReport.map((r) => (
                  <tr key={r.period}>
                    <td><strong>{r.period}</strong></td>
                    <td style={{ textAlign: "right" }}>₹{r.outwardTaxable.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{r.outwardTax.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{r.inwardTaxable.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{r.inwardTax.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>₹{r.netPayable.toLocaleString("en-IN")}</td>
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
