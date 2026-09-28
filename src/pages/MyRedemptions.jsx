import { useState, useEffect } from 'react';
import api from '../api/client.js';

export default function MyRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRedemptions() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/users/redemptions');
        setRedemptions(res.data.data);
      } catch (err) {
        setError(err.response?.data?.errors?.[0]?.message || 'Failed to load redemptions');
      } finally {
        setLoading(false);
      }
    }
    fetchRedemptions();
  }, []);

  if (loading) return <p>Loading your redemptions…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (redemptions.length === 0) return <p>You haven't redeemed any coupons yet.</p>;

  return (
    <div>
      <h2>My Redemptions</h2>
      <table>
        <thead>
          <tr>
            <th>Coupon</th><th>Discount</th><th>Order ID</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {redemptions.map((r) => (
            <tr key={r._id}>
              <td>{r.couponId?.code ?? '—'}</td>
              <td>
                {r.couponId
                  ? r.couponId.discountType === 'PERCENT'
                    ? `${r.couponId.discountValue}%`
                    : `₹${r.couponId.discountValue}`
                  : '—'}
              </td>
              <td>{r.orderId}</td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}