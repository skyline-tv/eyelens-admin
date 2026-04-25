import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../ConfirmModal.jsx";

/** Where this row appears on the store (matches server sanitize whitelist). */
const PLACEMENT_OPTIONS = [
  { value: "", label: "Hero carousel (rotating slides)" },
  { value: "home_cat_sunglasses", label: "Home — category tile: Sunglasses" },
  { value: "home_cat_eyeglasses", label: "Home — category tile: Eyeglasses" },
  { value: "home_cat_computer", label: "Home — category tile: Computer glasses" },
  { value: "home_cat_sports", label: "Home — category tile: Sports" },
];

function placementLabel(value) {
  return PLACEMENT_OPTIONS.find((o) => o.value === (value || ""))?.label || "Hero carousel";
}

/** Upload one banner image to API (admin endpoint); progress 0-100 */
async function uploadBannerImage(file, onProgress) {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await api.post("/upload/product", fd, {
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data?.data?.url || "";
}

export default function AdminBanners() {
  const { push } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    placement: "",
    isActive: true,
    order: 0,
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [bannerUploadPct, setBannerUploadPct] = useState(null);
  const bannerFileRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/banners/admin/all");
      setList(data.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resetBannerImageInput = useCallback(() => {
    if (bannerImagePreview) URL.revokeObjectURL(bannerImagePreview);
    setBannerImagePreview("");
    setBannerImageFile(null);
    setBannerUploadPct(null);
    if (bannerFileRef.current) bannerFileRef.current.value = "";
  }, [bannerImagePreview]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    resetBannerImageInput();
  }, [resetBannerImageInput]);

  useEffect(() => {
    return () => {
      if (bannerImagePreview) URL.revokeObjectURL(bannerImagePreview);
    };
  }, [bannerImagePreview]);

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "/plp",
      placement: "",
      isActive: true,
      order: list.length,
    });
    resetBannerImageInput();
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      imageUrl: b.imageUrl || "",
      linkUrl: b.linkUrl || "",
      placement: b.placement || "",
      isActive: b.isActive !== false,
      order: b.order ?? 0,
    });
    resetBannerImageInput();
    setShowForm(true);
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      let imageUrl = form.imageUrl.trim();
      if (bannerImageFile) {
        setBannerUploadPct(0);
        imageUrl = await uploadBannerImage(bannerImageFile, setBannerUploadPct);
        setBannerUploadPct(null);
      }
      const body = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        imageUrl,
        linkUrl: form.linkUrl.trim(),
        placement: form.placement || "",
        isActive: form.isActive,
        order: Number(form.order) || 0,
      };
      if (editing) await api.put(`/banners/${editing._id}`, body);
      else await api.post("/banners", body);
      push({ type: "success", title: "Saved", message: "Banner updated." });
      closeForm();
      await refresh();
    } catch {
      setBannerUploadPct(null);
      push({ type: "error", title: "Error", message: "Could not save banner." });
    }
  };

  const confirmRemoveBanner = async () => {
    const b = deleteTarget;
    setDeleteTarget(null);
    if (!b) return;
    try {
      await api.delete(`/banners/${b._id}`);
      push({ type: "success", title: "Removed", message: "Banner deleted." });
      await refresh();
    } catch {
      push({ type: "error", title: "Error", message: "Could not delete." });
    }
  };

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="adm-card-title" style={{ margin: 0 }}>Store and homepage visuals</div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--g500)", maxWidth: 640 }}>
            Hero carousel slides and the four &quot;Browse by category&quot; images on the shop home page are all set here.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
            + Add banner
          </button>
        </div>
      </div>

      {!loading && showForm && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">{editing ? "Edit banner" : "New banner"}</div>
            <form onSubmit={saveBanner} style={{ display: "grid", gap: 14, maxWidth: 560 }}>
              <div>
                <label className="field-label">Where it shows</label>
                <select
                  className="input"
                  value={form.placement}
                  onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))}
                  aria-label="Banner placement on storefront"
                >
                  {PLACEMENT_OPTIONS.map((o) => (
                    <option key={o.value || "carousel"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="field-label">Subtitle</label>
                <input className="input" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Banner image</label>
                <input
                  ref={bannerFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (!picked) return;
                    if (bannerImagePreview) URL.revokeObjectURL(bannerImagePreview);
                    setBannerImageFile(picked);
                    setBannerImagePreview(URL.createObjectURL(picked));
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginBottom: 8 }}
                  onClick={() => bannerFileRef.current?.click()}
                >
                  Choose image (JPG, PNG, WebP)
                </button>
                {(bannerImagePreview || form.imageUrl) ? (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={bannerImagePreview || form.imageUrl}
                      alt={form.title ? `${form.title} banner preview` : "Banner preview"}
                      style={{ width: 220, maxWidth: "100%", borderRadius: 10, border: "1px solid var(--g200)" }}
                    />
                  </div>
                ) : null}
                {bannerUploadPct != null ? (
                  <div style={{ fontSize: 12, color: "var(--g600)", marginTop: 6 }}>Uploading... {bannerUploadPct}%</div>
                ) : null}
                <label className="field-label" style={{ marginTop: 12, display: "block" }}>
                  Or paste image URL
                </label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={form.imageUrl}
                  disabled={Boolean(bannerImageFile)}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">Link URL (e.g. /plp or https://…)</label>
                <input className="input" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Sort order</label>
                  <input className="input" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Active
                </label>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Placement</th>
                  <th>Link</th>
                  <th>Order</th>
                  <th>Active</th>
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
                            style={{ width: `${45 + ((r + c) % 5) * 10}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 28, textAlign: "center", color: "var(--g500)" }}>
                      No banner rows yet. Add a banner to start.
                    </td>
                  </tr>
                ) : (
                  list.map((b) => (
                  <tr key={b._id}>
                    <td>
                      {b.imageUrl ? (
                        <div
                          role="img"
                          aria-label={b.title ? `${b.title} banner` : "Banner preview"}
                          style={{
                            width: 120,
                            height: 56,
                            borderRadius: 8,
                            background: `url(${b.imageUrl}) center/cover`,
                          }}
                        />
                      ) : (
                        <span style={{ color: "var(--g400)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <strong>{b.title}</strong>
                      <div style={{ fontSize: 12, color: "var(--g500)" }}>{b.subtitle}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--g600)", maxWidth: 200 }}>{placementLabel(b.placement)}</td>
                    <td style={{ fontSize: 12, color: "var(--g500)" }}>{b.linkUrl || "—"}</td>
                    <td>{b.order}</td>
                    <td>
                      <span className={`badge ${b.isActive !== false ? "badge-delivered" : "badge-oos"}`}>
                        {b.isActive !== false ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(b)}>
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
        isOpen={Boolean(deleteTarget)}
        title="Delete banner?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmRemoveBanner}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="danger"
      >
        <p style={{ fontSize: 14, color: "var(--g600)" }}>
          Delete banner <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}
