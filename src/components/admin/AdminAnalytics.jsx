import { useState } from "react";
import { useBriefSkeleton } from "../../hooks/useBriefSkeleton";

const TRAFFIC_SOURCES = [
  { source: "Direct", visits: 12400, share: 42 },
  { source: "Google", visits: 8200, share: 28 },
  { source: "Social", visits: 5100, share: 17 },
  { source: "Email", visits: 2900, share: 10 },
  { source: "Other", visits: 1400, share: 3 },
];

const DEVICE_BREAKDOWN = [
  { device: "Mobile", sessions: 18200, share: 62 },
  { device: "Desktop", sessions: 9800, share: 33 },
  { device: "Tablet", sessions: 1600, share: 5 },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("7d");
  const bootSkel = useBriefSkeleton();

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
        <div className="adm-card" style={{ marginTop: 24 }}>
          <div className="adm-card-pad">
            <div className="adm-skel-row" style={{ width: 220, marginBottom: 16 }} />
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                    <th>Avg. time</th>
                    <th>Bounce %</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: 4 }).map((_, c) => (
                        <td key={c} style={{ padding: "14px 10px" }}>
                          <div
                            className="adm-skel-row"
                            style={{ width: `${45 + ((r + c) % 5) * 10}%`, maxWidth: "100%" }}
                          />
                        </td>
                      ))}
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

  return (
    <div className="adm-page-section">
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["7d", "30d", "90d"].map((id) => (
          <button
            key={id}
            className={`inner-tab${period === id ? " active" : ""}`}
            onClick={() => setPeriod(id)}
          >
            {id === "7d" ? "Last 7 days" : id === "30d" ? "Last 30 days" : "Last 90 days"}
          </button>
        ))}
      </div>
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "var(--em-light)" }}>👁️</div>
          <div className="kpi-label">Page views</div>
          <div className="kpi-value">29.4K</div>
          <div className="kpi-delta kpi-up">↑ 14% vs previous</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#EFF6FF" }}>🛒</div>
          <div className="kpi-label">Add to cart rate</div>
          <div className="kpi-value">8.2%</div>
          <div className="kpi-delta kpi-up">↑ 0.5%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#FFF7ED" }}>✅</div>
          <div className="kpi-label">Checkout conversion</div>
          <div className="kpi-value">3.9%</div>
          <div className="kpi-delta kpi-up">↑ 0.2%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#F0FDF4" }}>↩️</div>
          <div className="kpi-label">Bounce rate</div>
          <div className="kpi-value">38%</div>
          <div className="kpi-delta kpi-down">↓ 2%</div>
        </div>
      </div>
      <div className="adm-row" style={{ flexWrap: "wrap" }}>
        <div className="adm-card" style={{ flex: "2 1 320px" }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Traffic sources</div>
            {TRAFFIC_SOURCES.map((row) => (
              <div key={row.source} className="city-bar" style={{ marginBottom: 14 }}>
                <div className="city-name" style={{ width: 90 }}>{row.source}</div>
                <div className="city-track">
                  <div className="city-fill" style={{ width: `${row.share}%` }} />
                </div>
                <div className="city-val">{row.visits.toLocaleString()} ({row.share}%)</div>
              </div>
            ))}
          </div>
        </div>
        <div className="adm-card" style={{ flex: "1 1 240px" }}>
          <div className="adm-card-pad">
            <div className="adm-card-title">Device breakdown</div>
            {DEVICE_BREAKDOWN.map((row) => (
              <div key={row.device} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{row.device}</span>
                  <span style={{ fontWeight: 700, color: "var(--black)" }}>{row.share}%</span>
                </div>
                <div className="city-track">
                  <div className="city-fill" style={{ width: `${row.share}%` }} />
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{row.sessions.toLocaleString()} sessions</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="adm-card" style={{ marginTop: 24 }}>
        <div className="adm-card-pad">
          <div className="adm-card-title">Top landing pages</div>
          <div className="table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Avg. time</th>
                  <th>Bounce %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["/", "Home", 12400, "1m 24s", 34],
                  ["/shop", "Shop (PLP)", 8200, "2m 10s", 28],
                  ["/collection", "Collection (PDP)", 5100, "3m 05s", 22],
                  ["/about", "About", 2100, "0m 52s", 58],
                ].map(([path, label, views, time, bounce]) => (
                  <tr key={path}>
                    <td><strong>{label}</strong><div style={{ fontSize: 11, color: "#9CA3AF" }}>{path}</div></td>
                    <td>{views.toLocaleString()}</td>
                    <td>{time}</td>
                    <td>{bounce}%</td>
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
