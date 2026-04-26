import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/axiosInstance";
import { mergeDashboard, kpiCardsFromDashboard } from "../utils/dashboardStats.js";
import AdminOrders from "../components/admin/AdminOrders";
import AdminProducts from "../components/admin/AdminProducts";
import AdminInventory from "../components/admin/AdminInventory";
import AdminCustomers from "../components/admin/AdminCustomers";
import AdminCoupons from "../components/admin/AdminCoupons";
import AdminReturns from "../components/admin/AdminReturns";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminSettings from "../components/admin/AdminSettings";
import AdminAccounting from "../components/admin/AdminAccounting";
import AdminInvoices from "../components/admin/AdminInvoices";
import AdminGstTaxes from "../components/admin/AdminGstTaxes";
import AdminReports from "../components/admin/AdminReports";
import AdminPayments from "../components/admin/AdminPayments";
import AdminReceipts from "../components/admin/AdminReceipts";
import AdminDashboardCharts from "../components/admin/AdminDashboardCharts";
import AdminBanners from "../components/admin/AdminBanners";

const navItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "orders", icon: "📦", label: "Orders" },
  { id: "products", icon: "🏷️", label: "Products" },
  { id: "inventory", icon: "📋", label: "Inventory" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "coupons", icon: "🎟️", label: "Coupons" },
  { id: "banners", icon: "🖼️", label: "Banners" },
  { id: "returns", icon: "🔄", label: "Returns" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const accountingNavItems = [
  { id: "accounting", icon: "📒", label: "Accounting" },
  { id: "invoices", icon: "📄", label: "Invoices" },
  { id: "gst", icon: "🧾", label: "GST & Taxes" },
  { id: "reports", icon: "📈", label: "Reports" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "receipts", icon: "🧾", label: "Receipts" },
];

export default function AdminPage({ onLogout, courierReceipts = [], lensReceipts = [], setCourierReceipts, setLensReceipts }) {
  const [collapsed, setCollapsed] = useState(false);
  const [admTab, setAdmTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [dashOrders, setDashOrders] = useState([]);
  const [dashProducts, setDashProducts] = useState([]);
  const [dashUpdatedAt, setDashUpdatedAt] = useState(null);
  const [dashAgeSec, setDashAgeSec] = useState(0);
  /** When true, Inventory opens with low-stock filter applied (from dashboard alert). */
  const [inventoryStartLow, setInventoryStartLow] = useState(false);

  const goToTab = (id, opts = {}) => {
    if (id === "inventory") setInventoryStartLow(!!opts.lowStockOnly);
    else setInventoryStartLow(false);
    setAdmTab(id);
    setMobileSidebarOpen(false);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const [st, ord, prod] = await Promise.all([api.get("/stats/dashboard"), api.get("/orders"), api.get("/products")]);
      setLiveStats(mergeDashboard(st.data?.data));
      setDashOrders(Array.isArray(ord.data?.data) ? ord.data.data : []);
      setDashProducts(Array.isArray(prod.data?.data) ? prod.data.data : []);
      setDashUpdatedAt(Date.now());
    } catch {
      setLiveStats(mergeDashboard(null));
      setDashOrders([]);
      setDashProducts([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (admTab !== "dashboard") return undefined;
    const id = setInterval(fetchDashboard, 30000);
    return () => clearInterval(id);
  }, [admTab, fetchDashboard]);

  useEffect(() => {
    if (dashUpdatedAt == null) return undefined;
    const tick = () => setDashAgeSec(Math.max(0, Math.floor((Date.now() - dashUpdatedAt) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dashUpdatedAt]);

  const kpis = useMemo(() => kpiCardsFromDashboard(mergeDashboard(liveStats)), [liveStats]);

  const recentOrders = useMemo(() => {
    if (!liveStats) return [];
    const m = mergeDashboard(liveStats);
    const raw = m.recentOrders?.length ? m.recentOrders : dashOrders.slice(0, 8);
    if (!raw?.length) return [];
    return raw.map((o) => ({
      id: `#${String(o._id).slice(-6)}`,
      customer: o.user?.name || o.user?.email || "—",
      product: o.items?.[0]?.name || "—",
      amount: `₹${Number(o.totalAmount || 0).toLocaleString("en-IN")}`,
      status: o.status,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
    }));
  }, [liveStats, dashOrders]);

  return (
    <div className="admin-wrap" style={{ width: "100%", minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <a href="#admin-main-content" className="skip-to-main">
        Skip to main content
      </a>
      {mobileSidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 959,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}${mobileSidebarOpen ? " mobile-open" : ""}`}>
        <div className="adm-logo">
          <img src="/LOGO.svg" alt="Eyelens" className="adm-logo-img" />
        </div>
        <div className="adm-nav">
          <div className="adm-section">Main</div>
          {navItems.slice(0, 5).map((n) => (
            <button
              key={n.id}
              className={`adm-item${admTab === n.id ? " active" : ""}`}
              onClick={() => goToTab(n.id)}
            >
              <span style={{ flexShrink: 0 }}>{n.icon}</span>
              <span className="adm-label">{n.label}</span>
              {n.badge && <span className="adm-badge">{n.badge}</span>}
            </button>
          ))}
          <div className="adm-section">Commerce</div>
          {navItems.slice(5).map((n) => (
            <button
              key={n.id}
              className={`adm-item${admTab === n.id ? " active" : ""}`}
              onClick={() => goToTab(n.id)}
            >
              <span style={{ flexShrink: 0 }}>{n.icon}</span>
              <span className="adm-label">{n.label}</span>
              {n.badge && <span className="adm-badge">{n.badge}</span>}
            </button>
          ))}
          <div className="adm-section">Accounting</div>
          {accountingNavItems.map((n) => (
            <button
              key={n.id}
              className={`adm-item${admTab === n.id ? " active" : ""}`}
              onClick={() => goToTab(n.id)}
            >
              <span style={{ flexShrink: 0 }}>{n.icon}</span>
              <span className="adm-label">{n.label}</span>
            </button>
          ))}
        </div>
        <button className="adm-toggle" onClick={() => setCollapsed(!collapsed)}>
          <span style={{ fontSize: 16, transition: "transform .28s", transform: collapsed ? "rotate(180deg)" : "none" }}>
            ‹‹
          </span>
          <span className="adm-label" style={{ fontSize: 12 }}>
            Collapse
          </span>
        </button>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              display: "none",
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1.5px solid var(--g200)",
              background: "transparent",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="adm-mob-menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="adm-topbar-title">
            {navItems.find((n) => n.id === admTab)?.label || accountingNavItems.find((n) => n.id === admTab)?.label || "Dashboard"}
            <span className="adm-topbar-sub">/ Overview</span>
          </div>
          <label htmlFor="adm-topbar-search" className="sr-only">
            Search admin
          </label>
          <input
            id="adm-topbar-search"
            className="input"
            placeholder="Search…"
            style={{ width: 200, padding: "8px 14px" }}
          />
          {(liveStats?.outOfStockCount ?? liveStats?.zeroStockCount ?? 0) > 0 ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title={`${liveStats.outOfStockCount ?? liveStats.zeroStockCount} product(s) out of stock`}
              onClick={() => goToTab("inventory", { lowStockOnly: true })}
              aria-label={`Stock alert: ${liveStats.outOfStockCount ?? liveStats.zeroStockCount} out of stock`}
              style={{ fontSize: 18, position: "relative", minWidth: 40 }}
            >
              🔔
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: "var(--red)",
                }}
              />
            </button>
          ) : null}
          <button onClick={onLogout} className="btn btn-ghost btn-sm">
            Logout
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "linear-gradient(135deg, var(--em-light), var(--em-mid))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--em-dark)",
              cursor: "pointer",
            }}
          >
            A
          </div>
        </div>
        <main id="admin-main-content" className="admin-content" tabIndex={-1}>
          {admTab === "dashboard" && (
            <div className="adm-page-section">
              {liveStats != null && dashUpdatedAt != null && (
                <p style={{ fontSize: 12, color: "var(--g500)", marginBottom: 12 }}>
                  Last updated: {dashAgeSec}s ago
                </p>
              )}
              {liveStats != null && (liveStats.outOfStockCount ?? liveStats.zeroStockCount ?? 0) > 0 ? (
                <div
                  role="alert"
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(220, 38, 38, 0.08)",
                    border: "1px solid rgba(220, 38, 38, 0.35)",
                    color: "var(--red)",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <span>
                    ✕ {liveStats.outOfStockCount ?? liveStats.zeroStockCount} product
                    {(liveStats.outOfStockCount ?? liveStats.zeroStockCount) === 1 ? " is" : "s are"} out of stock
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToTab("inventory", { lowStockOnly: true })}>
                    Open inventory
                  </button>
                </div>
              ) : null}
              {liveStats != null && (liveStats.lowStockCount ?? 0) > 0 ? (
                <div
                  role="status"
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.45)",
                    color: "#b45309",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <span>
                    ⚠ {liveStats.lowStockCount} product{liveStats.lowStockCount === 1 ? " is" : "s are"} low on stock (1–5 units)
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToTab("inventory", { lowStockOnly: true })}>
                    Open inventory
                  </button>
                </div>
              ) : null}
              <div className="kpi-grid">
                {kpis.map((k) => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-icon" style={{ background: k.bg }}>
                      {k.icon}
                    </div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.val}</div>
                    <div className={`kpi-delta${k.up ? " kpi-up" : " kpi-down"}`}>{k.delta}</div>
                  </div>
                ))}
              </div>
              {liveStats === null ? (
                <AdminDashboardCharts isLoading />
              ) : (
                <AdminDashboardCharts
                  revenueByDayLast30={liveStats.revenueByDayLast30}
                  revenueByDay={liveStats.revenueByDay}
                  ordersByStatus={liveStats.ordersByStatus}
                />
              )}
              <div className="adm-card" style={{ marginBottom: 20 }}>
                <div className="adm-card-pad">
                  <div className="adm-card-title">Recent Orders</div>
                  <div className="table-scroll">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "var(--g500)", padding: 28 }}>
                              No orders yet. New orders will appear here.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((o) => (
                            <tr key={o.id}>
                              <td>
                                <strong style={{ color: "var(--em)" }}>{o.id}</strong>
                              </td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div className="adm-avatar">{(o.customer && o.customer[0]) || "?"}</div>
                                  {o.customer}
                                </div>
                              </td>
                              <td>{o.product}</td>
                              <td>
                                <strong>{o.amount}</strong>
                              </td>
                              <td>
                                <span className={`badge badge-${o.status}`}>{o.status}</span>
                              </td>
                              <td style={{ color: "var(--g400)" }}>{o.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="adm-card">
                  <div className="adm-card-pad">
                    <div className="adm-card-title">Top selling products</div>
                    <div className="table-scroll">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Units sold</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveStats?.topSellingProducts?.length ? (
                            liveStats.topSellingProducts.map((t) => (
                              <tr key={String(t.productId)}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {t.imageUrl ? (
                                      <img
                                        src={t.imageUrl}
                                        alt={`${t.name || "Product"} by ${t.brand || "Eyelens"}`}
                                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                                      />
                                    ) : (
                                      <div
                                        className="adm-avatar"
                                        style={{ width: 40, height: 40, fontSize: 12 }}
                                        aria-hidden
                                      >
                                        —
                                      </div>
                                    )}
                                    <strong>{t.name}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge badge-em">{t.brand || "—"}</span>
                                </td>
                                <td>₹{Number(t.price || 0).toLocaleString("en-IN")}</td>
                                <td>{t.unitsSold}</td>
                                <td>
                                  <strong>₹{Number(t.revenue || 0).toLocaleString("en-IN")}</strong>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "var(--g500)", padding: 24 }}>
                                No sales data yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            </div>
          )}
          {admTab === "orders" && <AdminOrders />}
          {admTab === "products" && <AdminProducts />}
          {admTab === "inventory" && <AdminInventory startInLowFilter={inventoryStartLow} />}
          {admTab === "customers" && <AdminCustomers />}
          {admTab === "coupons" && <AdminCoupons />}
          {admTab === "banners" && <AdminBanners />}
          {admTab === "returns" && <AdminReturns />}
          {admTab === "analytics" && <AdminAnalytics />}
          {admTab === "settings" && <AdminSettings />}
          {admTab === "accounting" && <AdminAccounting orders={dashOrders} />}
          {admTab === "invoices" && <AdminInvoices orders={dashOrders} />}
          {admTab === "gst" && <AdminGstTaxes orders={dashOrders} products={dashProducts} />}
          {admTab === "reports" && <AdminReports orders={dashOrders} products={dashProducts} />}
          {admTab === "payments" && <AdminPayments orders={dashOrders} />}
          {admTab === "receipts" && (
            <AdminReceipts
              courierReceipts={courierReceipts}
              lensReceipts={lensReceipts}
              setCourierReceipts={setCourierReceipts}
              setLensReceipts={setLensReceipts}
            />
          )}
        </main>
      </div>
    </div>
  );
}
