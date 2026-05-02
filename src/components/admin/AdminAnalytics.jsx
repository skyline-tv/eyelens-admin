import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axiosInstance";
import { useBriefSkeleton } from "../../hooks/useBriefSkeleton";

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("7d");
  const [funnel, setFunnel] = useState(null);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [funnelErr, setFunnelErr] = useState("");
  const bootSkel = useBriefSkeleton();

  useEffect(() => {
    let cancelled = false;
    setFunnelLoading(true);
    setFunnelErr("");
    api
      .get("/stats/funnel", { params: { period } })
      .then(({ data }) => {
        if (!cancelled && data?.success) setFunnel(data.data);
      })
      .catch(() => {
        if (!cancelled) setFunnelErr("Could not load funnel analytics.");
      })
      .finally(() => {
        if (!cancelled) setFunnelLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const funnelSteps = useMemo(() => {
    if (!funnel) return [];
    const uCart = funnel.uniqueCartVisitors || 0;
    const uCo = funnel.uniqueCheckoutVisitors || 0;
    const ord = funnel.ordersPlaced || 0;
    const max = Math.max(uCart, uCo, ord, 1);
    return [
      {
        key: "cart",
        label: "Viewed cart",
        sub: "Unique visitors who opened the cart page",
        count: uCart,
        widthPct: Math.round((uCart / max) * 100),
      },
      {
        key: "checkout",
        label: "Reached checkout",
        sub: "Unique visitors who loaded the checkout flow",
        count: uCo,
        widthPct: Math.round((uCo / max) * 100),
      },
      {
        key: "orders",
        label: "Orders placed",
        sub: "Completed orders in this period (from orders)",
        count: ord,
        widthPct: Math.round((ord / max) * 100),
      },
    ];
  }, [funnel]);

  const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-IN") : "—");
  const fmtPct = (n) => (typeof n === "number" ? `${n}%` : "—");

  if (bootSkel) {
    return (
      <div className="adm-page-section">
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="adm-skel-row" style={{ width: 120, height: 34 }} />
          ))}
        </div>
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi-card">
              <div className="adm-skel-row" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 12 }} />
              <div className="adm-skel-row" style={{ width: "58%", marginBottom: 8 }} />
              <div className="adm-skel-row" style={{ width: "42%", height: 24 }} />
              <div className="adm-skel-row" style={{ width: "72%", marginTop: 8 }} />
            </div>
          ))}
        </div>
        <div className="adm-row" style={{ flexWrap: "wrap" }}>
          <div className="adm-card" style={{ flex: "2 1 320px" }}>
            <div className="adm-card-pad">
              <div className="adm-skel-row" style={{ width: 200, marginBottom: 16 }} />
              {Array.from({ length: 5 }).map((_, r) => (
                <div key={r} className="adm-skel-row" style={{ width: "100%", height: 18, marginBottom: 14 }} />
              ))}
            </div>
          </div>
          <div className="adm-card" style={{ flex: "1 1 240px" }}>
            <div className="adm-card-pad">
              <div className="adm-skel-row" style={{ width: 160, marginBottom: 16 }} />
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} style={{ marginBottom: 16 }}>
                  <div className="adm-skel-row" style={{ width: "100%", marginBottom: 8 }} />
                  <div className="adm-skel-row" style={{ width: "100%", height: 10 }} />
                  <div className="adm-skel-row" style={{ width: "50%", marginTop: 8 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kpiLoading = funnelLoading && !funnel;

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["7d", "30d", "90d"].map((id) => (
          <button
            key={id}
            type="button"
            className={`inner-tab${period === id ? " active" : ""}`}
            onClick={() => setPeriod(id)}
          >
            {id === "7d" ? "Last 7 days" : id === "30d" ? "Last 30 days" : "Last 90 days"}
          </button>
        ))}
      </div>

      {funnelErr && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#FEF2F2",
            color: "#991B1B",
            fontSize: 13,
          }}
        >
          {funnelErr}
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "var(--em-light)" }}>🛒</div>
          <div className="kpi-label">Cart page visits</div>
          <div className="kpi-value">{kpiLoading ? "…" : fmt(funnel?.uniqueCartVisitors)}</div>
          <div className="kpi-delta" style={{ color: "#6B7280" }}>
            Unique visitors (store events)
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#EFF6FF" }}>📍</div>
          <div className="kpi-label">Reached checkout</div>
          <div className="kpi-value">{kpiLoading ? "…" : fmt(funnel?.uniqueCheckoutVisitors)}</div>
          <div className="kpi-delta" style={{ color: "#6B7280" }}>
            {kpiLoading ? "…" : fmtPct(funnel?.cartToCheckoutPercent)} cart → checkout
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#FFF7ED" }}>📦</div>
          <div className="kpi-label">Orders placed</div>
          <div className="kpi-value">{kpiLoading ? "…" : fmt(funnel?.ordersPlaced)}</div>
          <div className="kpi-delta" style={{ color: "#6B7280" }}>
            {kpiLoading ? "…" : `${fmt(funnel?.uniqueCustomersWhoOrdered)} distinct customers`}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#F0FDF4" }}>✅</div>
          <div className="kpi-label">Checkout conversion</div>
          <div className="kpi-value">{kpiLoading ? "…" : fmtPct(funnel?.checkoutToOrderPercent)}</div>
          <div className="kpi-delta" style={{ color: "#6B7280" }}>
            Orders ÷ reached checkout
          </div>
        </div>
      </div>

      <div className="adm-row" style={{ flexWrap: "wrap" }}>
        <div className="adm-card" style={{ flex: "2 1 320px" }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Checkout funnel</div>
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 18, lineHeight: 1.45 }}>
              Counts are for the selected window. Cart and checkout use anonymous visitor IDs from the storefront; orders come from your order records.
            </p>
            {kpiLoading ? (
              Array.from({ length: 3 }).map((_, r) => (
                <div key={r} className="adm-skel-row" style={{ width: "100%", height: 22, marginBottom: 14 }} />
              ))
            ) : (
              funnelSteps.map((row) => (
                <div key={row.key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#374151" }}>{row.label}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{row.sub}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: "var(--black)", fontSize: 18 }}>
                      {row.count.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="city-track" style={{ marginTop: 8 }}>
                    <div className="city-fill" style={{ width: `${row.widthPct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="adm-card" style={{ flex: "1 1 240px" }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Revenue (period)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--black)", marginBottom: 8 }}>
              {kpiLoading ? "…" : `₹${fmt(funnel?.revenueInPeriod)}`}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
              Sum of order totals with payment timestamps in this range. Compare with funnel steps to spot drop-off between checkout visits and completed purchases.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
