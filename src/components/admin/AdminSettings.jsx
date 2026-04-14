import { useState } from "react";

export default function AdminSettings() {
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyReturns, setNotifyReturns] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [storeName, setStoreName] = useState("Eyelens");
  const [supportEmail, setSupportEmail] = useState("support@eyelens.in");
  const [supportPhone, setSupportPhone] = useState("+91 80 4567 8900");
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [freeShippingAbove, setFreeShippingAbove] = useState(999);
  const [savedStore, setSavedStore] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [savedShipping, setSavedShipping] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleSaveStore = (e) => {
    e.preventDefault();
    setSavedStore(true);
    setTimeout(() => setSavedStore(false), 2500);
  };

  const handleSavePrefs = (e) => {
    e.preventDefault();
    setSavedPrefs(true);
    setTimeout(() => setSavedPrefs(false), 2500);
  };

  const handleUpdateShipping = (e) => {
    e.preventDefault();
    setSavedShipping(true);
    setTimeout(() => setSavedShipping(false), 2500);
  };

  const handleClearTestData = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    setStoreName("Eyelens");
    setSupportEmail("support@eyelens.in");
    setSupportPhone("+91 80 4567 8900");
    setDeliveryDays(5);
    setFreeShippingAbove(999);
    setClearConfirm(false);
  };

  return (
    <div className="adm-page-section">
      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-pad">
          <div className="adm-card-title">Store details</div>
          <form onSubmit={handleSaveStore}>
            <div style={{ display: "grid", gap: 14, maxWidth: 480 }}>
              <div>
                <label className="field-label">Store name</label>
                <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Support email</label>
                <input className="input" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Support phone</label>
                <input className="input" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Currency</label>
                  <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Timezone</label>
                  <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="America/New_York">Eastern (EST)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>
              {savedStore ? "✓ Saved!" : "Save store details"}
            </button>
          </form>
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-pad">
          <div className="adm-card-title">Notifications</div>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>Choose which events trigger email alerts for admins.</p>
          <form onSubmit={handleSavePrefs}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} style={{ accentColor: "var(--em)" }} />
                <span>New order placed</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={notifyReturns} onChange={(e) => setNotifyReturns(e.target.checked)} style={{ accentColor: "var(--em)" }} />
                <span>Return request submitted</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={notifyLowStock} onChange={(e) => setNotifyLowStock(e.target.checked)} style={{ accentColor: "var(--em)" }} />
                <span>Product low stock alert</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>
              {savedPrefs ? "✓ Saved!" : "Save preferences"}
            </button>
          </form>
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: 20 }}>
        <div className="adm-card-pad">
          <div className="adm-card-title">Shipping & fulfilment</div>
          <form onSubmit={handleUpdateShipping}>
            <div style={{ display: "grid", gap: 14, maxWidth: 480 }}>
              <div>
                <label className="field-label">Default delivery (days)</label>
                <input className="input" type="number" min={1} max={14} value={deliveryDays} onChange={(e) => setDeliveryDays(Number(e.target.value) || 5)} />
              </div>
              <div>
                <label className="field-label">Free shipping above (₹)</label>
                <input className="input" type="number" value={freeShippingAbove} onChange={(e) => setFreeShippingAbove(Number(e.target.value) || 0)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>
              {savedShipping ? "✓ Updated!" : "Update shipping"}
            </button>
          </form>
        </div>
      </div>

      <div className="adm-card" style={{ borderColor: "var(--red)", background: "#FEF2F2" }}>
        <div className="adm-card-pad">
          <div className="adm-card-title" style={{ color: "var(--red)" }}>Danger zone</div>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>Irreversible actions. Use with caution.</p>
          <button
            type="button"
            className={`btn btn-sm ${clearConfirm ? "btn-danger" : "btn-ghost"}`}
            style={clearConfirm ? { border: "1.5px solid var(--red)" } : {}}
            onClick={handleClearTestData}
          >
            {clearConfirm ? "Click again to reset settings" : "Clear test data"}
          </button>
        </div>
      </div>
    </div>
  );
}
