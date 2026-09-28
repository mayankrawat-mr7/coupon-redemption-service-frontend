import { useState, useEffect } from 'react';
import api from '../../api/client.js';

// A minimal horizontal bar — just an SVG rect scaled by percentage.
// No library needed for something this simple.
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
        <rect x="0" y="0" width="100" height="20" fill="var(--accent-bg, #e5e5ea)" />
        <rect x="0" y="0" width={pct} height="20" fill={color} />
      </svg>
      <span className="bar-value">{value} ({pct}%)</span>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.errors?.[0]?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Analytics</h2>

      <div className="dashboard-stats">
        <div className="stat-card"><strong>{data.coupons.total}</strong><span>Total Coupons</span></div>
        <div className="stat-card"><strong>{data.coupons.active}</strong><span>Active</span></div>
        <div className="stat-card"><strong>{data.coupons.paused}</strong><span>Paused</span></div>
        <div className="stat-card"><strong>{data.redemptions.total}</strong><span>Total Redemptions</span></div>
        <div className="stat-card"><strong>{data.redemptions.applied}</strong><span>Applied</span></div>
        <div className="stat-card"><strong>{data.redemptions.reverted}</strong><span>Reverted</span></div>
      </div>

      <h3>Coupon Status Breakdown</h3>
      <Bar label="Active" value={data.coupons.active} max={data.coupons.total} color="#4ade80" />
      <Bar label="Paused" value={data.coupons.paused} max={data.coupons.total} color="#f87171" />

      <h3>Redemption Status Breakdown</h3>
      <Bar label="Applied" value={data.redemptions.applied} max={data.redemptions.total} color="#4ade80" />
      <Bar label="Reverted" value={data.redemptions.reverted} max={data.redemptions.total} color="#f87171" />

      <h3>Overall Usage</h3>
      <Bar label="Used / Limit" value={data.usage.totalUsed} max={data.usage.totalLimit} color="var(--accent, #6366f1)" />
    </div>
  );
}