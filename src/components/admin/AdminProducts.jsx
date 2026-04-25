import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../ConfirmModal.jsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";

const categories = ["Premium", "Sunglasses", "Computer", "Gold", "Eyeglasses", "General"];

function mapRow(p) {
  const priceNum = Number(p.price) || 0;
  const origRaw = p.origPrice != null ? Number(p.origPrice) : NaN;
  const origPrice = Number.isFinite(origRaw) && origRaw > priceNum ? origRaw : null;
  return {
    _id: p._id,
    sku: `EL-${String(p._id).slice(-6)}`,
    brand: p.brand,
    name: p.name,
    price: `₹${priceNum.toLocaleString("en-IN")}`,
    priceNum,
    origPrice,
    category: p.category || "General",
    stock: p.stock ?? 0,
    averageRating: Number(p.averageRating) || 0,
    reviewCount: p.reviewCount ?? 0,
    images: Array.isArray(p.images) ? p.images : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
  };
}

/** Upload one image to API (local disk); progress 0–100 */
async function uploadProductImage(file, onProgress) {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await api.post("/upload/product", fd, {
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data?.data?.url;
}

function parseLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseColorLines(text) {
  const normalizeColorName = (raw) =>
    String(raw || "")
      .trim()
      .replace(/^(color|colour)\s*[—\-:]\s*/i, "")
      .trim();

  return parseLines(text)
    .map((line) => {
      const [namePart, hexPart = ""] = line.includes("|")
        ? line.split("|")
        : line.includes(",")
          ? line.split(",")
          : [line, ""];
      const name = normalizeColorName(namePart);
      if (!name) return null;
      return {
        name,
        hex: String(hexPart || "").trim(),
        images: [],
      };
    })
    .filter(Boolean);
}

function formatColorLines(colors) {
  if (!Array.isArray(colors) || colors.length === 0) return "";
  return colors
    .map((c) => {
      const name = String(c?.name || "").trim();
      if (!name) return "";
      const hex = String(c?.hex || "").trim();
      return hex ? `${name} | ${hex}` : name;
    })
    .filter(Boolean)
    .join("\n");
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

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addForm, setAddForm] = useState({
    brand: "",
    name: "",
    price: "",
    mrp: "",
    category: "Premium",
    stock: "",
    imageUrlsText: "",
    colorsText: "",
  });
  const [addImageFiles, setAddImageFiles] = useState([]);
  const [addImagePreviews, setAddImagePreviews] = useState([]);
  const [addUploadPct, setAddUploadPct] = useState(null);
  const addFileRef = useRef(null);

  const [editForm, setEditForm] = useState({});
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editImagePasteUrls, setEditImagePasteUrls] = useState("");
  const [editUploadPct, setEditUploadPct] = useState(null);
  const editFileRef = useRef(null);
  const editModalRef = useRef(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const { push } = useToast();
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setList((data.data || []).map(mapRow));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeEditModal = useCallback(() => {
    setEditImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setEditImageFiles([]);
    setEditingProduct(null);
  }, []);

  useFocusTrap(editModalRef, Boolean(editingProduct), { onEscape: closeEditModal });

  const filtered = list.filter((p) => {
    const matchCat =
      categoryFilter === "all" || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort.key === "price") {
      const ap = a.priceNum ?? (Number(String(a.price).replace(/[^\d]/g, "")) || 0);
      const bp = b.priceNum ?? (Number(String(b.price).replace(/[^\d]/g, "")) || 0);
      return compare(ap, bp, sort.dir);
    }
    if (sort.key === "stock") return compare(a.stock ?? 0, b.stock ?? 0, sort.dir);
    if (sort.key === "rating") return compare(a.averageRating ?? 0, b.averageRating ?? 0, sort.dir);
    if (sort.key === "brand") return compare(a.brand, b.brand, sort.dir);
    if (sort.key === "category") return compare(a.category, b.category, sort.dir);
    return compare(a.name, b.name, sort.dir);
  });

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };
  const sortGlyph = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.brand.trim() || !addForm.price) return;
    const priceNum = Number(String(addForm.price).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum < 0) return;
    const mrpNum = addForm.mrp.trim() ? Number(String(addForm.mrp).replace(/[^\d.]/g, "")) : null;
    if (mrpNum != null && (!Number.isFinite(mrpNum) || mrpNum < priceNum)) {
      push({
        type: "error",
        title: "Invalid MRP",
        message: "MRP must be greater than or equal to the selling price.",
      });
      return;
    }
    const origPrice = mrpNum != null && Number.isFinite(mrpNum) && mrpNum > priceNum ? mrpNum : undefined;
    let images = parseLines(addForm.imageUrlsText);
    const colors = parseColorLines(addForm.colorsText);
    try {
      if (addImageFiles.length) {
        setAddUploadPct(0);
        for (const file of addImageFiles) {
          const url = await uploadProductImage(file, setAddUploadPct);
          if (url) images.push(url);
        }
        setAddUploadPct(null);
      }
      images = [...new Set(images)];
      await api.post("/products", {
        name: addForm.name.trim(),
        brand: addForm.brand.trim(),
        price: priceNum,
        ...(origPrice != null ? { origPrice } : {}),
        category: addForm.category,
        stock: Number(addForm.stock) || 0,
        description: "",
        frameType: "",
        material: "",
        gender: "unisex",
        images,
        colors,
        emoji: "👓",
      });
      addImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setAddForm({
        brand: "",
        name: "",
        price: "",
        mrp: "",
        category: "Premium",
        stock: "",
        imageUrlsText: "",
        colorsText: "",
      });
      setAddImageFiles([]);
      setAddImagePreviews([]);
      setShowAddForm(false);
      await refresh();
      push({ type: "success", title: "Product added", message: "Catalog updated successfully." });
    } catch (err) {
      setAddUploadPct(null);
      const msg = err.response?.data?.message || "";
      push({
        type: "error",
        title: "Add failed",
        message: msg || "Could not create product or upload image.",
      });
    }
  };

  const openEdit = (p) => {
    editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditImagePasteUrls("");
    setEditUploadPct(null);
    setEditingProduct(p);
    setEditForm({
      ...p,
      price: typeof p.price === "string" ? p.price.replace("₹", "").replace(/,/g, "") : String(p.priceNum ?? ""),
      mrp: p.origPrice != null ? String(p.origPrice) : "",
      images: Array.isArray(p.images) ? [...p.images] : [],
      colorsText: formatColorLines(p.colors),
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editForm.name.trim()) return;
    const priceNum = Number(String(editForm.price).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum < 0) return;
    const mrpNum = String(editForm.mrp || "").trim()
      ? Number(String(editForm.mrp).replace(/[^\d.]/g, ""))
      : null;
    if (mrpNum != null && (!Number.isFinite(mrpNum) || mrpNum < priceNum)) {
      push({
        type: "error",
        title: "Invalid MRP",
        message: "MRP must be greater than or equal to the selling price.",
      });
      return;
    }
    const origPrice =
      mrpNum != null && Number.isFinite(mrpNum) && mrpNum > priceNum ? mrpNum : null;
    let images = [...(editForm.images || []), ...parseLines(editImagePasteUrls)];
    const colors = parseColorLines(editForm.colorsText);
    try {
      if (editImageFiles.length) {
        setEditUploadPct(0);
        for (const file of editImageFiles) {
          const url = await uploadProductImage(file, setEditUploadPct);
          if (url) images.push(url);
        }
        setEditUploadPct(null);
      }
      images = [...new Set(images)];
      await api.put(`/products/${editingProduct._id}`, {
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        price: priceNum,
        origPrice,
        category: editForm.category,
        stock: Number(editForm.stock) || 0,
        images,
        colors,
      });
      editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setEditingProduct(null);
      setEditImageFiles([]);
      setEditImagePreviews([]);
      setEditImagePasteUrls("");
      await refresh();
      push({ type: "success", title: "Saved", message: "Product updated." });
    } catch (err) {
      setEditUploadPct(null);
      const msg = err.response?.data?.message || "";
      push({ type: "error", title: "Save failed", message: msg || "Could not update product or upload image." });
    }
  };

  const handleDelete = async (p) => {
    setConfirmDelete(p);
  };

  return (
    <div className="adm-page-section">
      <div className="adm-page-head">
        <div>
          <div className="adm-page-title">Products</div>
          <div className="adm-page-sub">Manage catalog, pricing, and stock.</div>
        </div>
        <div className="adm-toolbar">
          <div className="adm-input-wrap">
            <span className="adm-input-icon">🔎</span>
            <input
              className="input adm-input"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280, padding: "10px 14px" }}
            />
          </div>
          <select
            className="input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 180, padding: "10px 14px" }}
            aria-label="Category filter"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Close" : "+ Add Product"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="adm-card" style={{ marginBottom: 20 }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Add new product</div>
            <form onSubmit={handleAdd} style={{ display: "grid", gap: 14, maxWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Brand</label>
                  <input
                    className="input"
                    placeholder="Eyelens"
                    value={addForm.brand}
                    onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Product name</label>
                  <input
                    className="input"
                    placeholder="Product name"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Selling price (₹)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="4,299"
                    value={addForm.price}
                    onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">MRP (₹, optional)</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="5,999"
                    value={addForm.mrp}
                    onChange={(e) => setAddForm((f) => ({ ...f, mrp: e.target.value }))}
                    aria-describedby="add-mrp-hint"
                  />
                  <span id="add-mrp-hint" style={{ fontSize: 11, color: "var(--g500)", marginTop: 4, display: "block" }}>
                    Shown struck-through when above selling price.
                  </span>
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select className="input" value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Stock</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={addForm.stock}
                  onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">Product photos (multiple)</label>
                <input
                  ref={addFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    addImagePreviews.forEach((url) => URL.revokeObjectURL(url));
                    setAddImageFiles(files);
                    setAddImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginBottom: 8 }}
                  onClick={() => addFileRef.current?.click()}
                >
                  Choose images (JPG, PNG, WebP)
                </button>
                {addImagePreviews.length ? (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {addImagePreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="Preview for new product listing"
                        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid var(--g200)" }}
                      />
                    ))}
                  </div>
                ) : null}
                {addUploadPct != null ? (
                  <div style={{ fontSize: 12, color: "var(--g600)", marginTop: 6 }}>Uploading… {addUploadPct}%</div>
                ) : null}
                <label className="field-label" style={{ marginTop: 12, display: "block" }}>
                  Or paste image URLs (one per line)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={"https://...\nhttps://..."}
                  value={addForm.imageUrlsText}
                  onChange={(e) => setAddForm((f) => ({ ...f, imageUrlsText: e.target.value }))}
                />
                <label className="field-label" style={{ marginTop: 12, display: "block" }}>
                  Colors (one per line: Name | Hex)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={"Midnight Black | #231F20\nCrystal Clear | #D4E8F0"}
                  value={addForm.colorsText}
                  onChange={(e) => setAddForm((f) => ({ ...f, colorsText: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add product
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-pad">
          {loading ? (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>MRP / Selling</th>
                    <th>Avg rating</th>
                    <th>Stock</th>
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
                            style={{ width: `${50 + ((r + c) % 6) * 7}%`, maxWidth: "100%" }}
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
              <div className="ico">🏷️</div>
              <div className="t">No products found</div>
              <div className="d">Try a different search or choose another category.</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("name")}>Product{sortGlyph("name")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("brand")}>Brand{sortGlyph("brand")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("category")}>Category{sortGlyph("category")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("price")}>MRP / Selling{sortGlyph("price")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("rating")}>Avg rating{sortGlyph("rating")}</th>
                    <th style={{ cursor: "pointer" }} onClick={() => toggleSort("stock")}>Stock{sortGlyph("stock")}</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p, i) => (
                    <tr key={p._id || p.sku || i}>
                      <td style={{ color: "var(--g500)", fontSize: 12 }}>{p.sku}</td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.brand}</td>
                      <td>
                        <span className="adm-pill">
                          <span className="adm-pill-dot" />
                          {p.category}
                        </span>
                      </td>
                      <td>
                        {p.origPrice != null ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 12, color: "var(--g400)", textDecoration: "line-through" }}>
                              ₹{p.origPrice.toLocaleString("en-IN")}
                            </span>
                            <strong>{p.price}</strong>
                          </div>
                        ) : (
                          <strong>{p.price}</strong>
                        )}
                      </td>
                      <td>
                        {p.averageRating > 0 ? (
                          <>
                            <strong>{p.averageRating.toFixed(1)}</strong>
                            <span style={{ color: "var(--g500)", fontSize: 12 }}> · {p.reviewCount}</span>
                          </>
                        ) : (
                          <span style={{ color: "var(--g400)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`adm-pill ${(p.stock || 0) === 0 ? "adm-pill--bad" : (p.stock || 0) < 5 ? "adm-pill--warn" : "adm-pill--ok"}`}>
                          <span className="adm-pill-dot" />
                          {p.stock ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-pill ${(p.stock || 0) === 0 ? "adm-pill--bad" : "adm-pill--ok"}`}>
                          <span className="adm-pill-dot" />
                          {(p.stock || 0) === 0 ? "Out of stock" : "Active"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)" }}
                          onClick={() => handleDelete(p)}
                        >
                          Delete
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

      {editingProduct && (
        <div
          className="adm-modal-overlay"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={closeEditModal}
          role="presentation"
        >
          <div
            ref={editModalRef}
            className="adm-modal"
            style={{ maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit product"
          >
            <div className="adm-modal-head">
              <div className="adm-modal-title">Edit product</div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeEditModal} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="adm-modal-body" style={{ overflowY: "auto", maxHeight: "calc(90vh - 120px)", flex: 1, minHeight: 0 }}>
              <form onSubmit={handleEdit} style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">SKU</label>
                <input className="input" value={editForm.sku} disabled style={{ background: "var(--g50)" }} />
              </div>
              <div>
                <label className="field-label">Brand</label>
                <input
                  className="input"
                  value={editForm.brand || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="field-label">Product name</label>
                <input
                  className="input"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Selling price (₹)</label>
                  <input
                    className="input"
                    value={editForm.price || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">MRP (₹, optional)</label>
                  <input
                    className="input"
                    value={editForm.mrp || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, mrp: e.target.value }))}
                    placeholder="Leave blank to clear"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Category</label>
                <select className="input" value={editForm.category || ""} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Stock</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={editForm.stock ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">Product photos</label>
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
                    setEditImageFiles(files);
                    setEditImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => editFileRef.current?.click()}>
                  Upload more images
                </button>
                {(editImagePreviews.length || editForm.images?.length) ? (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(editImagePreviews.length ? editImagePreviews : editForm.images || []).map((src, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img
                          src={src}
                          alt={`${editForm.name || "Product"} by ${editForm.brand || "Eyelens"}`}
                          style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid var(--g200)" }}
                        />
                        {!editImagePreviews.length ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ position: "absolute", top: -8, right: -8, minWidth: 22, height: 22, padding: 0 }}
                            onClick={() =>
                              setEditForm((f) => ({
                                ...f,
                                images: (f.images || []).filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {editUploadPct != null ? (
                  <div style={{ fontSize: 12, color: "var(--g600)", marginTop: 6 }}>Uploading… {editUploadPct}%</div>
                ) : null}
                <label className="field-label" style={{ marginTop: 12, display: "block" }}>
                  Paste more image URLs (one per line)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={"https://...\nhttps://..."}
                  value={editImagePasteUrls}
                  onChange={(e) => setEditImagePasteUrls(e.target.value)}
                />
                <label className="field-label" style={{ marginTop: 12, display: "block" }}>
                  Colors (one per line: Name | Hex)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={"Midnight Black | #231F20\nCrystal Clear | #D4E8F0"}
                  value={editForm.colorsText || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, colorsText: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
              </form>
            </div>
            <div className="adm-modal-foot">
              <button type="button" className="btn btn-ghost" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete product"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          const p = confirmDelete;
          setConfirmDelete(null);
          if (!p) return;
          try {
            await api.delete(`/products/${p._id}`);
            await refresh();
            push({ type: "success", title: "Deleted", message: "Product removed from catalog." });
          } catch {
            push({ type: "error", title: "Delete failed", message: "Could not delete product." });
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="danger"
      >
        <div style={{ fontSize: 13, color: "var(--g600)", lineHeight: 1.6 }}>
          You’re about to delete <strong style={{ color: "var(--black)" }}>{confirmDelete?.name}</strong>.
          <br />
          This action cannot be undone.
        </div>
      </ConfirmModal>
    </div>
  );
}
