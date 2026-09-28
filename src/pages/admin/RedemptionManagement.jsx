import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client.js';

export default function RedemptionManagement() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revertingId, setRevertingId] = useState(null); // tracks which row's revert is in flight

  async function fetchRedemptions() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/redemptions');
      setRedemptions(res.data.data);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let active = true;
  api.get('/admin/redemptions')
    .then((res) => { if (active) setRedemptions(res.data.data); })
    .catch((err) => {
      if (active) setError(err.response?.data?.errors?.[0]?.message || 'Failed to load redemptions');
    })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, []);

  const handleRevert = async (redemption) => {
    const confirmed = window.confirm(
      `Revert redemption for order ${redemption.orderId}? This will decrease the coupon's used count.`
    );
    if (!confirmed) return;

    setRevertingId(redemption._id);
    try {
      await api.patch(`/admin/redemptions/${redemption._id}/revert`);
      toast.success('Redemption reverted');
      fetchRedemptions(); // refresh so status + coupon usedCount reflect reality
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Failed to revert redemption');
    } finally {
      setRevertingId(null);
    }
  };

  if (loading) return <p>Loading redemptions…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (redemptions.length === 0) return <p>No redemptions found.</p>;

  return (
    <div>
      <h2>Redemptions</h2>
      <table>
        <thead>
          <tr>
            <th>Coupon</th><th>User</th><th>Order ID</th>
            <th>Status</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redemptions.map((r) => (
            <tr key={r._id}>
              <td>{r.couponId?.code ?? '—'}</td>
              <td>{r.userId?.name ?? '—'} ({r.userId?.email ?? '—'})</td>
              <td>{r.orderId}</td>
              <td>{r.status}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                {r.status === 'APPLIED' ? (
                  <button
                    onClick={() => handleRevert(r)}
                    disabled={revertingId === r._id}
                  >
                    {revertingId === r._id ? 'Reverting…' : 'Revert'}
                  </button>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}