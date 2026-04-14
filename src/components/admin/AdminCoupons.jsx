import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../ConfirmModal.jsx";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function displayDiscount(c) {
  if (c.discountType === "flat") return `₹${c.discountValue} off`;
  return `${c.discountValue}% off`;
}

export default function AdminCoupons() {
  const { push } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    label: "",
    discountType: "flat",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    expiresAt: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data.data || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleActive = async (c) => {
    try {
      await api.put(`/coupons/${c._id}`, { isActive: !c.isActive });
      push({ type: "success", title: "Updated", message: "Coupon status saved." });
      await refresh();
    } catch {
      push({ type: "error", title: "Error", message: "Could not update coupon." });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) return;
    try {
      await api.post("/coupons", {
        code: form.code.trim().toUpperCase(),
        label: form.label.trim() || form.code.trim(),
        discountType: form.discountType === "percent" ? "percentage" : "flat",
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: true,
      });
      push({ type: "success", title: "Created", message: "Coupon is live." });
      setForm({
        code: "",
        label: "",
        discountType: "flat",
        discountValue: "",
        minOrderValue: "",
        maxUses: "",
        expiresAt: "",
      });
      setShowForm(false);
      await refresh();
    } catch (err) {
      push({ type: "error", title: "Error", message: err.response?.data?.message || "Could not create." });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/coupons/${confirmDelete._id}`);
      push({ type: "success", title: "Deleted", message: "Coupon removed." });
      setConfirmDelete(null);
      await refresh();
    } catch {
      push({ type: "error", title: "Error", message: "Could not delete." });
    }
  };

  const filtered = coupons.filter((c) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return c.isActive;
    return !c.isActive;
  });

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div className="inner-tabs" style={{ marginBottom: 0 }}>
          {["all", "active", "inactive"].map((id) => (
            <button
              key={id}
              className={`inner-tab${statusFilter === id ? " active" : ""}`}
              onClick={() => setStatusFilter(id)}
            >
              {id === "all" ? "All" : id === "active" ? "Active" : "Inactive"}
              {id === "active" && activeCount > 0 && (
                <span style={{ marginLeft: 6, background: "var(--em)", color: "#fff", padding: "2px 6px", borderRadius: 999, fontSize: 10 }}>
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create coupon"}
        </button>
      </div>

      {!loading && showForm && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Create new coupon</div>
            <form onSubmit={handleCreate} style={{ display: "grid", gap: 14, maxWidth: 520 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Coupon code</label>
                  <input
                    className="input"
                    placeholder="e.g. SAVE20"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Label</label>
                  <input
                    className="input"
                    placeholder="Display name"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Type</label>
                  <select className="input" value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                    <option value="flat">Fixed (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Value</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Min order ₹</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={form.minOrderValue}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Max uses (empty = unlimited)</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="field-label">Expires (optional)</label>
                  <input className="input" type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                Create coupon
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {loading ? (
          <>
            {[1, 2, 3].map((k) => (
              <div key={k} className="kpi-card">
                <div className="adm-skel-row" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
                <div className="adm-skel-row" style={{ width: "50%", marginBottom: 8 }} />
                <div className="adm-skel-row" style={{ width: "30%" }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "var(--em-light)" }}>🎟️</div>
              <div className="kpi-label">Total coupons</div>
              <div className="kpi-value">{coupons.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#FFF7ED" }}>✅</div>
              <div className="kpi-label">Active</div>
              <div className="kpi-value" style={{ color: "var(--em)" }}>
                {activeCount}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#F1F3F0" }}>⏸️</div>
              <div className="kpi-label">Inactive</div>
              <div className="kpi-value">{coupons.length - activeCount}</div>
            </div>
          </>
        )}
      </div>

      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">Coupons ({filtered.length})</div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Label</th>
                  <th>Discount</th>
                  <th>Used</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 7 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${48 + ((r + c) % 5) * 9}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong style={{ color: "var(--em)", fontFamily: "monospace" }}>{c.code}</strong>
                    </td>
                    <td>{c.label}</td>
                    <td>{displayDiscount(c)}</td>
                    <td>
                      <strong>{c.usedCount ?? 0}</strong>
                      {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td style={{ color: "var(--g500)" }}>{formatDate(c.expiresAt)}</td>
                    <td>
                      <span className={`badge ${c.isActive ? "badge-delivered" : "badge-oos"}`}>{c.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td>
                      <button type="button" className={`btn btn-sm ${c.isActive ? "btn-ghost" : "btn-primary"}`} onClick={() => toggleActive(c)}>
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => setConfirmDelete(c)}>
                        Delete
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

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete coupon?"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="danger"
      >
        <span>Remove {confirmDelete?.code} permanently?</span>
      </ConfirmModal>
    </div>
  );
}
