import { useState } from "react";
import { defaultLedgers, defaultJournalEntries } from "../../data/accountingData";

const accountingTabs = [
  { id: "ledgers", label: "Ledgers" },
  { id: "journal", label: "Journal entries" },
  { id: "trial", label: "Trial balance" },
  { id: "pl", label: "Profit & Loss" },
  { id: "balance", label: "Balance sheet" },
];

export default function AdminAccounting() {
  const [tab, setTab] = useState("ledgers");
  const [ledgers, setLedgers] = useState(defaultLedgers);
  const [journalEntries, setJournalEntries] = useState(defaultJournalEntries);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({ name: "", group: "Cash in hand", openingBalance: "0", type: "debit" });
  const [journalForm, setJournalForm] = useState({ date: new Date().toISOString().slice(0, 10), narration: "", entries: [{ ledger: "", debit: "", credit: "" }] });

  const groups = ["Cash in hand", "Bank accounts", "Sundry debtors", "Sundry creditors", "Sales accounts", "Purchase accounts", "Duties & taxes", "Capital account"];

  const addLedger = (e) => {
    e.preventDefault();
    if (!ledgerForm.name.trim()) return;
    const bal = parseFloat(ledgerForm.openingBalance) || 0;
    setLedgers((prev) => [
      ...prev,
      { id: "L" + (prev.length + 1), name: ledgerForm.name.trim(), group: ledgerForm.group, openingBalance: bal, type: ledgerForm.type },
    ]);
    setLedgerForm({ name: "", group: "Cash in hand", openingBalance: "0", type: "debit" });
    setShowLedgerForm(false);
  };

  const addJournalLine = () => setJournalForm((f) => ({ ...f, entries: [...f.entries, { ledger: "", debit: "", credit: "" }] }));
  const removeJournalLine = (idx) => setJournalForm((f) => ({ ...f, entries: f.entries.filter((_, i) => i !== idx) }));
  const updateJournalLine = (idx, field, value) => {
    setJournalForm((f) => ({
      ...f,
      entries: f.entries.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    }));
  };

  const saveJournal = (e) => {
    e.preventDefault();
    const entries = journalForm.entries.filter((r) => r.ledger && (r.debit || r.credit));
    if (entries.length < 2) return;
    let totalDebit = 0, totalCredit = 0;
    entries.forEach((r) => {
      totalDebit += parseFloat(r.debit) || 0;
      totalCredit += parseFloat(r.credit) || 0;
    });
    if (Math.abs(totalDebit - totalCredit) > 0.01) return;
    setJournalEntries((prev) => [
      { id: "JE-" + String(prev.length + 1).padStart(3, "0"), date: journalForm.date, narration: journalForm.narration || "Journal entry", entries, totalDebit, totalCredit },
      ...prev,
    ]);
    setJournalForm({ date: new Date().toISOString().slice(0, 10), narration: "", entries: [{ ledger: "", debit: "", credit: "" }] });
    setShowJournalForm(false);
  };

  // Trial balance from ledgers (debit nature -> debit col; credit nature -> credit col)
  const trialBalance = ledgers.map((l) => {
    const bal = Number(l.openingBalance) || 0;
    return { name: l.name, debit: l.type === "debit" ? bal : 0, credit: l.type === "credit" ? bal : 0 };
  });
  const tbTotalDebit = trialBalance.reduce((s, r) => s + (r.debit || 0), 0);
  const tbTotalCredit = trialBalance.reduce((s, r) => s + (r.credit || 0), 0);

  // Mock P&L
  const revenue = 2847600;
  const expenses = 1240000;
  const netProfit = revenue - expenses;

  // Mock balance sheet
  const assets = 1285000;
  const liabilities = 222000;
  const equity = 500000;
  const retained = netProfit;

  return (
    <div className="adm-page-section">
      <div
        className="adm-card"
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid var(--g200)",
          background: "var(--g50)",
          fontSize: 13,
          color: "var(--g700)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--black)" }}>Demo workspace.</strong>{" "}
        Ledgers and reports here use local sample data only — they are not linked to live orders, payments, or GST filings.
      </div>
      <div className="inner-tabs" style={{ marginBottom: 20 }}>
        {accountingTabs.map((t) => (
          <button key={t.id} type="button" className={`inner-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ledgers" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <span className="adm-card-title" style={{ marginBottom: 0 }}>Chart of accounts</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowLedgerForm(!showLedgerForm)}>
              {showLedgerForm ? "Cancel" : "+ Create ledger"}
            </button>
          </div>
          {showLedgerForm && (
            <div className="adm-card" style={{ marginBottom: 20 }}>
              <div className="adm-card-pad">
                <div className="adm-card-title">New ledger</div>
                <form onSubmit={addLedger} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
                  <div>
                    <label className="field-label">Ledger name</label>
                    <input className="input" value={ledgerForm.name} onChange={(e) => setLedgerForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Cash" required />
                  </div>
                  <div>
                    <label className="field-label">Group</label>
                    <select className="input" value={ledgerForm.group} onChange={(e) => setLedgerForm((f) => ({ ...f, group: e.target.value }))}>
                      {groups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Opening balance</label>
                      <input className="input" type="number" value={ledgerForm.openingBalance} onChange={(e) => setLedgerForm((f) => ({ ...f, openingBalance: e.target.value }))} />
                    </div>
                    <div>
                      <label className="field-label">Nature</label>
                      <select className="input" value={ledgerForm.type} onChange={(e) => setLedgerForm((f) => ({ ...f, type: e.target.value }))}>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Create ledger</button>
                </form>
              </div>
            </div>
          )}
          <div className="adm-card">
            <div className="adm-card-pad">
              <div className="adm-card-title">Ledgers ({ledgers.length})</div>
              <div className="table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Group</th>
                      <th>Opening balance</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgers.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.name}</strong></td>
                        <td style={{ color: "#6B7280" }}>{l.group}</td>
                        <td>₹{Number(l.openingBalance).toLocaleString("en-IN")}</td>
                        <td><span className="badge badge-em">{l.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "journal" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <span className="adm-card-title" style={{ marginBottom: 0 }}>Journal entries</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowJournalForm(!showJournalForm)}>
              {showJournalForm ? "Cancel" : "+ New entry"}
            </button>
          </div>
          {showJournalForm && (
            <div className="adm-card" style={{ marginBottom: 20 }}>
              <div className="adm-card-pad">
                <div className="adm-card-title">New journal entry</div>
                <form onSubmit={saveJournal} style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                    <div>
                      <label className="field-label">Date</label>
                      <input className="input" type="date" value={journalForm.date} onChange={(e) => setJournalForm((f) => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="field-label">Narration</label>
                      <input className="input" value={journalForm.narration} onChange={(e) => setJournalForm((f) => ({ ...f, narration: e.target.value }))} placeholder="Brief description" />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span className="field-label">Entries (Debit = Credit)</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addJournalLine}>+ Add line</button>
                    </div>
                    <div className="table-scroll">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Ledger</th>
                            <th>Debit (₹)</th>
                            <th>Credit (₹)</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {journalForm.entries.map((row, idx) => (
                            <tr key={idx}>
                              <td>
                                <select className="input" style={{ minWidth: 160 }} value={row.ledger} onChange={(e) => updateJournalLine(idx, "ledger", e.target.value)}>
                                  <option value="">Select</option>
                                  {ledgers.map((l) => (
                                    <option key={l.id} value={l.name}>{l.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input className="input" type="number" min={0} style={{ width: 100 }} value={row.debit} onChange={(e) => updateJournalLine(idx, "debit", e.target.value)} placeholder="0" />
                              </td>
                              <td>
                                <input className="input" type="number" min={0} style={{ width: 100 }} value={row.credit} onChange={(e) => updateJournalLine(idx, "credit", e.target.value)} placeholder="0" />
                              </td>
                              <td>
                                {journalForm.entries.length > 1 && (
                                  <button type="button" className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeJournalLine(idx)}>✕</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save entry</button>
                </form>
              </div>
            </div>
          )}
          <div className="adm-card">
            <div className="adm-card-pad">
              <div className="adm-card-title">Journal</div>
              <div className="table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Narration</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalEntries.map((j) => (
                      <tr key={j.id}>
                        <td><strong style={{ color: "var(--em)" }}>{j.id}</strong></td>
                        <td>{j.date}</td>
                        <td>{j.narration}</td>
                        <td>₹{Number(j.totalDebit).toLocaleString("en-IN")}</td>
                        <td>₹{Number(j.totalCredit).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "trial" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Trial balance</div>
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th style={{ textAlign: "right" }}>Debit (₹)</th>
                    <th style={{ textAlign: "right" }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td style={{ textAlign: "right" }}>{r.debit ? "₹" + Number(r.debit).toLocaleString("en-IN") : "—"}</td>
                      <td style={{ textAlign: "right" }}>{r.credit ? "₹" + Number(r.credit).toLocaleString("en-IN") : "—"}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid #E5E9EC", fontWeight: 800 }}>
                    <td>Total</td>
                    <td style={{ textAlign: "right" }}>₹{Number(tbTotalDebit).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>₹{Number(tbTotalCredit).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "pl" && (
        <div className="adm-card">
          <div className="adm-card-pad">
            <div className="adm-card-title">Profit & Loss statement</div>
            <div style={{ maxWidth: 480 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}>
                <span>Revenue (Sales)</span>
                <strong>₹{revenue.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}>
                <span>Less: Expenses</span>
                <strong>₹{expenses.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #E5E9EC", fontWeight: 800, fontSize: 16 }}>
                <span>Net profit</span>
                <span style={{ color: "var(--em)" }}>₹{netProfit.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "balance" && (
        <div className="adm-row" style={{ flexWrap: "wrap" }}>
          <div className="adm-card" style={{ flex: 1, minWidth: 280 }}>
            <div className="adm-card-pad">
              <div className="adm-card-title">Assets</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E9EC" }}>
                <span>Total assets</span>
                <strong>₹{assets.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
          <div className="adm-card" style={{ flex: 1, minWidth: 280 }}>
            <div className="adm-card-pad">
              <div className="adm-card-title">Liabilities & Equity</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Liabilities</span><strong>₹{liabilities.toLocaleString("en-IN")}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Capital</span><strong>₹{equity.toLocaleString("en-IN")}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Retained earnings</span><strong>₹{retained.toLocaleString("en-IN")}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #E5E9EC", fontWeight: 800 }}>
                <span>Total</span>
                <strong>₹{(liabilities + equity + retained).toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
