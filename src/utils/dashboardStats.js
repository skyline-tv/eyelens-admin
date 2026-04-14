/** Normalized dashboard payload; used when API is down or still loading. */
export const EMPTY_DASHBOARD = {
  todayRevenue: 0,
  todayOrders: 0,
  thisMonthRevenue: 0,
  thisMonthOrders: 0,
  totalUsers: 0,
  totalProducts: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  zeroStockCount: 0,
  revenueByDayLast30: [],
  revenueByDay: [],
  ordersByStatus: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
  topSellingProducts: [],
  recentOrders: [],
};

export function mergeDashboard(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      ...EMPTY_DASHBOARD,
      ordersByStatus: { ...EMPTY_DASHBOARD.ordersByStatus },
      revenueByDayLast30: [],
      revenueByDay: [],
      topSellingProducts: [],
      recentOrders: [],
    };
  }
  return {
    ...EMPTY_DASHBOARD,
    ...raw,
    revenueByDayLast30: Array.isArray(raw.revenueByDayLast30) ? raw.revenueByDayLast30 : [],
    revenueByDay: Array.isArray(raw.revenueByDay) ? raw.revenueByDay : [],
    ordersByStatus: {
      ...EMPTY_DASHBOARD.ordersByStatus,
      ...(raw.ordersByStatus && typeof raw.ordersByStatus === "object" ? raw.ordersByStatus : {}),
    },
    topSellingProducts: Array.isArray(raw.topSellingProducts) ? raw.topSellingProducts : [],
    recentOrders: Array.isArray(raw.recentOrders) ? raw.recentOrders : [],
  };
}

export function kpiCardsFromDashboard(m) {
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const low = m.lowStockCount ?? 0;
  return [
    {
      icon: "💰",
      label: "Today's Revenue",
      val: fmt(m.todayRevenue ?? 0),
      delta: `${m.todayOrders ?? 0} orders today`,
      up: true,
      bg: "var(--em-light)",
    },
    {
      icon: "📦",
      label: "Today's Orders",
      val: String(m.todayOrders ?? 0),
      delta: "So far today",
      up: true,
      bg: "var(--g50)",
    },
    {
      icon: "📈",
      label: "This Month Revenue",
      val: fmt(m.thisMonthRevenue ?? 0),
      delta: `${m.thisMonthOrders ?? 0} orders this month`,
      up: true,
      bg: "var(--gold-lt)",
    },
    {
      icon: "👥",
      label: "Total Users",
      val: String(m.totalUsers ?? m.users ?? 0),
      delta: "Registered accounts",
      up: true,
      bg: "#FEF2F2",
    },
    {
      icon: "🏷️",
      label: "Catalog products",
      val: String(m.totalProducts ?? m.products ?? 0),
      delta: low > 0 ? `${low} low stock (1–5 units)` : "All SKUs in catalog",
      up: true,
      bg: "var(--g50)",
    },
  ];
}
