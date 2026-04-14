import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#EAB308", "#2563EB", "#9333EA", "#16A34A", "#DC2626"];

/** Bar chart: prefers 30-day series from API; falls back to 7-day series. */
function ChartSkeletonCard({ titleWidth = "55%" }) {
  return (
    <div className="adm-card">
      <div className="adm-card-pad">
        <div className="adm-skel-row" style={{ width: titleWidth, height: 18, marginBottom: 16 }} />
        <div style={{ width: "100%", height: 260, borderRadius: 8, overflow: "hidden" }}>
          <div className="adm-skel-row" style={{ width: "100%", height: "100%", maxWidth: "100%" }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardCharts({
  isLoading = false,
  revenueByDayLast30 = [],
  revenueByDay = [],
  ordersByStatus = {},
}) {
  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
        <ChartSkeletonCard titleWidth="70%" />
        <ChartSkeletonCard titleWidth="50%" />
      </div>
    );
  }

  const useLast30 = Array.isArray(revenueByDayLast30) && revenueByDayLast30.length > 0;
  const series = useLast30 ? revenueByDayLast30 : revenueByDay;
  const barTitle = useLast30 ? "Revenue (last 30 days)" : "Revenue (last 7 days)";

  const barData = (series || []).map((d) => ({
    date: d.date?.slice?.(5) || d.date,
    revenue: d.revenue ?? 0,
  }));

  const pieData = Object.entries(ordersByStatus || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">{barTitle}</div>
          <div style={{ width: "100%", height: 260 }}>
            {barData.length ? (
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="var(--em)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--g500)", fontSize: 13 }}>No order data yet</div>
            )}
          </div>
        </div>
      </div>
      <div className="adm-card">
        <div className="adm-card-pad">
          <div className="adm-card-title">Orders by status</div>
          <div style={{ width: "100%", height: 260 }}>
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--g500)", fontSize: 13 }}>No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
