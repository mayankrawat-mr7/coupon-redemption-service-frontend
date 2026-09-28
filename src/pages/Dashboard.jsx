import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/authContext.js';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        if (isAdmin) {
          const [usersRes, couponsRes] = await Promise.all([
            api.get('/users?limit=1'),          // we only need the count, not the rows
            api.get('/admin/coupons?limit=500'), // best-effort "total" — no true count endpoint
          ]);
          setStats({
            totalUsers: usersRes.data.data.pagination.totalCount,
            totalCoupons: couponsRes.data.data.length,
            activeCoupons: couponsRes.data.data.filter((c) => c.status === 'ACTIVE').length,
          });
        } else {
          const res = await api.get('/users/redemptions');
          setStats({ totalRedemptions: res.data.data.length });
        }
      } catch {
        setStats(null); // dashboard stats are a nice-to-have — fail quietly, don't block the page
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [isAdmin]);

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>

      {loading && <p>Loading dashboard…</p>}

      {!loading && stats && isAdmin && (
        <div className="dashboard-stats">
          <div className="stat-card"><strong>{stats.totalUsers}</strong><span>Total Users</span></div>
          <div className="stat-card"><strong>{stats.totalCoupons}</strong><span>Coupons (shown)</span></div>
          <div className="stat-card"><strong>{stats.activeCoupons}</strong><span>Active Coupons</span></div>
        </div>
      )}

      {!loading && stats && !isAdmin && (
        <div className="dashboard-stats">
          <div className="stat-card"><strong>{stats.totalRedemptions}</strong><span>Your Redemptions</span></div>
        </div>
      )}

      <div className="dashboard-links">
        {isAdmin ? (
          <>
            <Link to="/admin/users">Manage Users</Link>
            <Link to="/admin/coupons">Manage Coupons</Link>
          </>
        ) : (
          <>
            <Link to="/redeem">Redeem a Coupon</Link>
            <Link to="/my-redemptions">View My Redemptions</Link>
          </>
        )}
      </div>
    </div>
  );
}
