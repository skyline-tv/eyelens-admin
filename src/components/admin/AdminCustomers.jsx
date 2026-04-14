import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/axiosInstance";
import { getUser } from "../../auth/auth";
import { useToast } from "../../context/ToastContext";
import AdminModal from "../AdminModal.jsx";
import ConfirmModal from "../ConfirmModal.jsx";

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

function mapUser(u) {
  const segment = u.role === "admin" ? "Gold" : "New";
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    orders: "—",
    totalSpent: "—",
    segment,
    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—",
    role: u.role,
    phone: u.phone || "",
    isBanned: Boolean(u.isBanned),
    bannedReason: u.bannedReason || "",
  };
}

function compare(a, b, dir) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const as = String(a).toLowerCase();
  const bs = String(b).toLowerCase();
  if (as < bs) return dir === "asc" ? -1 : 1;
  if (as > bs) return dir === "asc" ? 1 : -1;
  return 0;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const { push } = useToast();
  const [sort, setSort] = useState({ key: "joined", dir: "desc" });

  const me = getUser();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setCustomers((data.data || []).map(mapUser));
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = customers.filter((c) => {
    const matchSegment = segmentFilter === "all" || c.segment.toLowerCase() === segmentFilter.toLowerCase();
    const matchSearch =
      !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchSegment && matchSearch;
  });

  const sorted = [...filtered].sort((x, y) => {
    if (sort.key === "email") return compare(x.email, y.email, sort.dir);
    if (sort.key === "role") return compare(x.role, y.role, sort.dir);
    if (sort.key === "joined") return compare(x.joined, y.joined, sort.dir);
    return compare(x.name, y.name, sort.dir);
  });

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };
  const sortGlyph = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Joined"];
    const rows = filtered.map((c) => [c.name, c.email, c.role, c.joined]);
    downloadCSV(headers, rows, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const changeRole = async (userId, role) => {
    if (me?.id === userId) return;
    try {
      await api.put(`/users/${userId}/role`, { role });
      await refresh();
      push({ type: "success", title: "Role updated", message: `Updated role to ${role}` });
    } catch {
      push({ type: "error", title: "Update failed", message: "Could not update role. Try again." });
    }
  };

  return (
    <div className="adm-page-section">
      <div className="adm-page-head">
        <div>
          <div className="adm-page-title">Customers</div>
          <div className="adm-page-sub">View customers and manage roles.</div>
        </div>
        <div className="adm-toolbar">
          <div className="adm-input-wrap">
            <span className="adm-input-icon">🔎</span>
            <input
              className="input adm-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320, padding: "10px 14px" }}
            />
          </div>
          <select
            className="input"
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            style={{ width: 160, padding: "10px 14px" }}
            aria-label="Segment filter"
          >
            <option value="all">All segments</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="New">New</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>
      <div className="adm-card">
        <div className="adm-card-pad">
          {loading ? (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 6 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${48 + ((r + c) % 5) * 8}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : sorted.length === 0 ? (
            <div className="adm-empty">
              <div className="ico">👥</div>
              <div className="t">No customers found</div>
              <div className="d">Try adjusting the segment filter or search by email.</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("name")}>Customer{sortGlyph("name")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("email")}>Email{sortGlyph("email")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("role")}>Role{sortGlyph("role")}</th>
                    <th>Status</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("joined")}>Joined{sortGlyph("joined")}</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => {
                    const isSelf = String(me?.id) === String(c.id);
                    return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="adm-avatar" aria-label={`${c.name} profile picture`}>
                            {c.name[0]}
                          </div>
                          <strong>{c.name}</strong>
                        </div>
                      </td>
                      <td style={{ color: "var(--g500)", fontSize: 13 }}>{c.email}</td>
                      <td>
                        <select
                          className="input"
                          style={{ padding: "6px 10px", fontSize: 12, minWidth: 100 }}
                          value={c.role}
                          disabled={isSelf}
                          onChange={(e) => changeRole(c.id, e.target.value)}
                          aria-label={`Role for ${c.name}`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        {c.isBanned ? (
                          <span className="adm-pill adm-pill--bad" title={c.bannedReason || "Banned"}>
                            <span className="adm-pill-dot" />
                            Banned
                          </span>
                        ) : (
                          <span className="adm-pill adm-pill--ok">
                            <span className="adm-pill-dot" />
                            Active
                          </span>
                        )}
                      </td>
                      <td style={{ color: "var(--g400)" }}>{c.joined}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() => setViewCustomer(c)}
                          >
                            View
                          </button>
                          {!c.isBanned && c.role !== "admin" ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              disabled={isSelf}
                              style={{ padding: "6px 12px", fontSize: 12, background: "var(--red)", color: "#fff", border: "none", borderRadius: 8 }}
                              onClick={() => {
                                setBanReason("");
                                setBanModal({ id: c.id, name: c.name });
                              }}
                            >
                              Ban
                            </button>
                          ) : null}
                          {c.isBanned ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              disabled={isSelf}
                              style={{ padding: "6px 12px", fontSize: 12, background: "var(--em)", color: "#fff", border: "none", borderRadius: 8 }}
                              onClick={async () => {
                                try {
                                  await api.put(`/users/${c.id}/unban`);
                                  await refresh();
                                  push({ type: "success", title: "Unbanned", message: c.name });
                                } catch {
                                  push({ type: "error", title: "Failed", message: "Could not unban user." });
                                }
                              }}
                            >
                              Unban
                            </button>
                          ) : null}
                          {c.role !== "admin" ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={isSelf}
                              style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)", border: "1.5px solid var(--red)" }}
                              onClick={() => setDeleteModal({ id: c.id, name: c.name })}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={Boolean(banModal)}
        onClose={() => {
          setBanModal(null);
          setBanReason("");
        }}
        title="Ban user"
        ariaLabel="Ban user"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setBanModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={!banReason.trim()}
              onClick={async () => {
                if (!banModal || !banReason.trim()) return;
                try {
                  await api.put(`/users/${banModal.id}/ban`, { reason: banReason.trim() });
                  const name = banModal.name;
                  setBanModal(null);
                  setBanReason("");
                  await refresh();
                  push({ type: "success", title: "User banned", message: name });
                } catch {
                  push({ type: "error", title: "Ban failed", message: "Could not ban user." });
                }
              }}
            >
              Ban user
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Are you sure you want to ban <strong>{banModal?.name}</strong>?
        </p>
        <label className="field-label" htmlFor="ban-reason-textarea">
          Enter reason
        </label>
        <textarea
          id="ban-reason-textarea"
          className="input"
          rows={3}
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Reason for ban…"
          style={{ width: "100%", resize: "vertical", minHeight: 72 }}
        />
      </AdminModal>

      <ConfirmModal
        isOpen={Boolean(deleteModal)}
        title="Delete user"
        onCancel={() => setDeleteModal(null)}
        onConfirm={async () => {
          const d = deleteModal;
          setDeleteModal(null);
          if (!d) return;
          try {
            await api.delete(`/users/${d.id}`);
            await refresh();
            push({ type: "success", title: "User deleted", message: d.name });
          } catch (e) {
            const msg = e.response?.data?.message || "Could not delete user.";
            push({ type: "error", title: "Delete failed", message: msg });
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="danger"
      >
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Remove <strong>{deleteModal?.name}</strong>? Their account will be deactivated and they will not be able to sign in.
        </p>
      </ConfirmModal>

      <AdminModal
        isOpen={Boolean(viewCustomer)}
        onClose={() => setViewCustomer(null)}
        title="Customer details"
        ariaLabel="Customer details"
        footer={
          <button type="button" className="btn btn-ghost" onClick={() => setViewCustomer(null)}>
            Close
          </button>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            className="adm-avatar"
            style={{ width: 48, height: 48, fontSize: 18 }}
            aria-label={`${viewCustomer?.name || "Customer"} profile picture`}
          >
            {viewCustomer?.name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--black)" }}>{viewCustomer?.name}</div>
            <div style={{ fontSize: 13, color: "var(--g500)" }}>{viewCustomer?.email}</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Role</span>
            <div style={{ marginTop: 6 }}>
              <span className={`adm-pill ${viewCustomer?.role === "admin" ? "adm-pill--info" : ""}`}>
                <span className="adm-pill-dot" />
                {viewCustomer?.role}
              </span>
            </div>
          </div>
          <div>
            <span style={{ color: "var(--g500)", fontSize: 12 }}>Joined</span>
            <div>{viewCustomer?.joined}</div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
