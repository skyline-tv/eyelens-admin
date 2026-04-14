import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";
import AdminModal from "../AdminModal.jsx";
import ConfirmModal from "../ConfirmModal.jsx";

function mapRow(o) {
  return {
    _id: o._id,
    orderRef: `#${String(o._id).slice(-8).toUpperCase()}`,
    customer: o.user?.name || "—",
    email: o.user?.email || "",
    product: o.items?.[0]?.name || "—",
    reason: o.returnReason || "",
    status: o.returnStatus,
    date: o.returnRequestedAt ? new Date(o.returnRequestedAt).toLocaleString() : "",
  };
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "requested", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
];

export default function AdminReturns() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewReturn, setViewReturn] = useState(null);
  const [pendingReject, setPendingReject] = useState(null);
  const { push } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/returns");
      setRows((data.data || []).map(mapRow));
    } catch {
      setRows([]);
      push({ type: "error", title: "Error", message: "Could not load return requests." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "requested").length, [rows]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/return/status`, { status });
      await load();
      push({ type: "success", title: "Updated", message: `Return marked ${status}.` });
      setPendingReject(null);
      setViewReturn(null);
    } catch (e) {
      push({
        type: "error",
        title: "Error",
        message: e.response?.data?.message || "Could not update return status.",
      });
    }
  };

  const badgeClass = (s) => {
    if (s === "approved" || s === "completed") return "badge-delivered";
    if (s === "rejected") return "badge-oos";
    return "badge-transit";
  };

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div className="inner-tabs" style={{ marginBottom: 0 }}>
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`inner-tab${statusFilter === id ? " active" : ""}`}
              onClick={() => setStatusFilter(id)}
            >
              {label}
              {id === "requested" && pendingCount > 0 ? (
                <span
                  style={{
                    marginLeft: 6,
                    background: "var(--amber)",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: 999,
                    fontSize: 10,
                  }}
                >
                  {pendingCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">Return requests ({filtered.length})</div>
          {loading ? (
            <div className="adm-skel-stack" style={{ marginTop: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="adm-skel-row" style={{ width: `${90 - (i % 3) * 8}%` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty" style={{ marginTop: 16 }}>
              <div className="ico">📭</div>
              <div className="t">No return requests</div>
              <div className="d">Nothing in this filter yet.</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={String(r._id)}>
                      <td>
                        <strong style={{ color: "var(--em)" }}>{r.orderRef}</strong>
                      </td>
                      <td>{r.customer}</td>
                      <td>{r.product}</td>
                      <td style={{ color: "var(--g500)", fontSize: 12, maxWidth: 220 }}>{r.reason}</td>
                      <td>
                        <span className={`badge ${badgeClass(r.status)}`}>{r.status}</span>
                      </td>
                      <td style={{ color: "var(--g400)", fontSize: 12 }}>{r.date}</td>
                      <td>
                        {r.status === "requested" ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: "6px 10px", fontSize: 11, marginRight: 6 }}
                              onClick={() => updateStatus(r._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ padding: "6px 10px", fontSize: 11 }}
                              onClick={() => setPendingReject(r)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() => setViewReturn(r)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingReject)}
        title="Reject return?"
        onCancel={() => setPendingReject(null)}
        onConfirm={() => {
          const r = pendingReject;
          if (r) updateStatus(r._id, "rejected");
        }}
        confirmText="Reject return"
        cancelText="Cancel"
        confirmColor="danger"
      >
        <p style={{ fontSize: 14, color: "var(--g600)", marginBottom: 16 }}>
          Reject return for order <strong>{pendingReject?.orderRef}</strong> — {pendingReject?.customer}?
        </p>
      </ConfirmModal>

      <AdminModal
        isOpen={Boolean(viewReturn)}
        onClose={() => setViewReturn(null)}
        title={viewReturn ? `Return ${viewReturn.orderRef}` : "Return"}
        ariaLabel={viewReturn ? `Return ${viewReturn.orderRef}` : "Return details"}
        footer={
          <button type="button" className="btn btn-ghost" onClick={() => setViewReturn(null)}>
            Close
          </button>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Customer</span>
            <div>
              <strong>{viewReturn?.customer}</strong>
            </div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Product</span>
            <div>{viewReturn?.product}</div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Reason</span>
            <div>{viewReturn?.reason}</div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Status</span>
            <div>
              <span className={`badge ${badgeClass(viewReturn?.status)}`}>{viewReturn?.status}</span>
            </div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Requested</span>
            <div>{viewReturn?.date}</div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
