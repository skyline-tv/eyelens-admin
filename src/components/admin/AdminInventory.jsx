import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../context/ToastContext";

function colorCodeSuffix(colorName) {
  const parts = String(colorName || "")
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map((p) => String(p[0] || "").toUpperCase())
    .join("")
    .slice(0, 4);
}

function mapRowsFromProduct(p) {
  const sku = `EL-${String(p._id).slice(-6)}`;
  const baseCode = (p.modelNumber && String(p.modelNumber).trim()) || sku;
  const colors = Array.isArray(p.colors) ? p.colors.filter((c) => c && String(c.name || "").trim()) : [];
  if (!colors.length) {
    return [
      {
        _id: p._id,
        rowId: `${p._id}:base`,
        colorIndex: null,
        colorName: "Default",
        sku,
        modelNumber: p.modelNumber || "",
        code: baseCode,
        name: p.name,
        category: p.category || "—",
        stock: p.stock ?? 0,
        threshold: 5,
        status: (p.stock ?? 0) === 0 ? "out" : (p.stock ?? 0) < 5 ? "low" : "ok",
      },
    ];
  }

  return colors.map((color, index) => {
    const colorStock = color.stock == null || Number.isNaN(Number(color.stock)) ? 0 : Math.max(0, Math.floor(Number(color.stock)));
    const colorName = String(color.name || "").trim() || "Default";
    const suffix = colorCodeSuffix(colorName);
    return {
      _id: p._id,
      rowId: `${p._id}:${String(color.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${index}`,
      colorIndex: index,
      colorName,
      sku,
      modelNumber: p.modelNumber || "",
      code: suffix ? `${baseCode}-${suffix}` : `${baseCode}-${index + 1}`,
      name: p.name,
      category: p.category || "—",
      stock: colorStock,
      threshold: 5,
      status: colorStock === 0 ? "out" : colorStock < 5 ? "low" : "ok",
    };
  });
}

/** Live inventory from API; rows with stock &lt; 5 highlighted; quick stock update via PUT /products/:id */
export default function AdminInventory({ startInLowFilter = false }) {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(startInLowFilter ? "low" : "all");
  const [updatingId, setUpdatingId] = useState(null);
  const [newStock, setNewStock] = useState("");

  useEffect(() => {
    if (startInLowFilter) setFilter("low");
  }, [startInLowFilter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      const byId = new Map();
      for (const p of data.data || []) {
        if (!p?._id) continue;
        if (!byId.has(String(p._id))) byId.set(String(p._id), p);
      }
      setItems(Array.from(byId.values()).flatMap(mapRowsFromProduct));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "ok") return item.status === "ok";
    if (filter === "low") return item.status === "low" || item.status === "out";
    if (filter === "out") return item.status === "out";
    return true;
  });

  const lowCount = items.filter((i) => i.status === "low" || i.status === "out").length;
  const totalStockPcs = items.reduce((sum, item) => sum + item.stock, 0);

  const saveStock = async (row) => {
    const num = parseInt(newStock, 10);
    if (Number.isNaN(num) || num < 0) return;
    try {
      const { data: cur } = await api.get(`/products/${row._id}`);
      const doc = cur.data;
      const nextColors = Array.isArray(doc.colors) ? [...doc.colors] : [];
      let nextStock = num;
      if (row.colorIndex != null && nextColors[row.colorIndex]) {
        nextColors[row.colorIndex] = { ...nextColors[row.colorIndex], stock: num };
        const hasColorStocks = nextColors.some((c) => Number.isFinite(Number(c?.stock)));
        nextStock = hasColorStocks
          ? nextColors.reduce(
              (sum, c) => sum + (Number.isFinite(Number(c?.stock)) ? Math.max(0, Math.floor(Number(c.stock))) : 0),
              0
            )
          : Number(doc.stock) || 0;
      }
      await api.put(`/products/${row._id}`, {
        name: doc.name,
        brand: doc.brand,
        price: doc.price,
        category: doc.category,
        colors: nextColors,
        stock: nextStock,
      });
      push({ type: "success", title: "Stock updated", message: `${row.name} (${row.colorName})` });
      setUpdatingId(null);
      setNewStock("");
      await refresh();
    } catch {
      push({ type: "error", title: "Update failed", message: "Could not save stock." });
    }
  };

  return (
    <div className="adm-page-section">
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {loading ? (
          <>
            <div className="kpi-card">
              <div className="adm-skel-row" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "55%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "35%" }} />
            </div>
            <div className="kpi-card">
              <div className="adm-skel-row" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "55%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "35%" }} />
            </div>
            <div className="kpi-card">
              <div className="adm-skel-row" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "55%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "35%" }} />
            </div>
          </>
        ) : (
          <>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "var(--em-light)" }}>📦</div>
              <div className="kpi-label">Total SKUs</div>
              <div className="kpi-value">{items.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#EEF8FF" }}>🧮</div>
              <div className="kpi-label">Total Stock (pcs)</div>
              <div className="kpi-value">{totalStockPcs}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: "#FEF8EE" }}>⚠️</div>
              <div className="kpi-label">Low / Out (&lt;5)</div>
              <div className="kpi-value" style={{ color: lowCount > 0 ? "var(--amber)" : "var(--green)" }}>
                {lowCount}
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "ok", "low", "out"].map((id) => (
          <button
            key={id}
            type="button"
            className={`inner-tab${filter === id ? " active" : ""}`}
            onClick={() => setFilter(id)}
            style={{ marginBottom: 0 }}
          >
            {id === "all" ? "All" : id === "ok" ? "In stock" : id === "low" ? "Low stock" : "Out of stock"}
          </button>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={refresh}>
          Refresh
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">Inventory levels</div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Model number</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Color</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 7 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${50 + ((r + c) % 5) * 8}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filtered.map((row) => (
                  <tr
                    key={row.rowId}
                    style={
                      row.stock === 0
                        ? { background: "rgba(220, 38, 38, 0.08)" }
                        : row.stock < 5
                          ? { background: "rgba(245, 158, 11, 0.1)" }
                          : undefined
                    }
                  >
                    <td style={{ color: "var(--g500)", fontSize: 12 }}>{row.code}</td>
                    <td>
                      <strong>{row.name}</strong>
                      {row.stock === 0 && <span style={{ marginLeft: 8 }}>🔔</span>}
                      {row.stock > 0 && row.stock < 5 && <span style={{ marginLeft: 8 }}>⚠️</span>}
                    </td>
                    <td>
                      <span className="badge badge-em">{row.category}</span>
                    </td>
                    <td>
                      <span className="badge badge-gold">{row.colorName}</span>
                    </td>
                    <td>
                      {updatingId === row.rowId ? (
                        <input
                          className="input"
                          type="number"
                          min={0}
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          style={{ width: 80, padding: "6px 8px" }}
                          autoFocus
                        />
                      ) : (
                        <strong style={{ color: row.stock === 0 ? "var(--red)" : undefined }}>{row.stock}</strong>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          row.status === "out" ? "badge-oos" : row.status === "low" ? "badge-transit" : "badge-delivered"
                        }`}
                      >
                        {row.status === "out" ? "Out of stock" : row.status === "low" ? "Low stock" : "In stock"}
                      </span>
                    </td>
                    <td>
                      {updatingId === row.rowId ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: "6px 10px", fontSize: 11, marginRight: 6 }}
                            onClick={() => saveStock(row)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            onClick={() => {
                              setUpdatingId(null);
                              setNewStock("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => {
                            setUpdatingId(row.rowId);
                            setNewStock(String(row.stock));
                          }}
                        >
                          Update stock
                        </button>
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
