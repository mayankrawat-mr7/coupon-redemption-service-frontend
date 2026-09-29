import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client.js';
import CouponForm from '../../components/CouponForm.jsx';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // null = no form shown; 'new' = create form; a coupon object = editing that coupon
  const [formTarget, setFormTarget] = useState(null);

  async function fetchCoupons() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let active = true;
  api.get('/admin/coupons')
    .then((res) => { if (active) setCoupons(res.data.data); })
    .catch((err) => {
      if (active) setError(err.response?.data?.errors?.[0]?.message || 'Failed to load coupons');
    })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, []);

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.delete(`/admin/coupons/${coupon._id}`);
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Failed to delete coupon');
    }
  };

  // Called by Formik on submit — works for both create and edit,
  // since we already know which mode we're in from formTarget.
  const handleFormSubmit = async (values, { setSubmitting, setErrors }) => {
    const isEditing = formTarget && formTarget !== 'new';
    const payload = {
      ...values,
      discountValue: Number(values.discountValue),
      maxUses: Number(values.maxUses),
      perUserLimit: Number(values.perUserLimit),
      startsAt: new Date(values.startsAt).toISOString(),
      expiresAt: new Date(values.expiresAt).toISOString(),
    };

    try {
      if (isEditing) {
        await api.put(`/admin/coupons/${formTarget._id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setFormTarget(null);
      fetchCoupons();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];
      // Map backend field errors onto Formik's error state, same shape
      // ErrorMessage already knows how to read.
      const fieldErrors = {};
      apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
      setErrors(fieldErrors);
      toast.error(apiErrors[0]?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading coupons…</p>;

  return (
    <div>
      <h2>Coupon Management</h2>

      {!formTarget && (
        <button onClick={() => setFormTarget('new')}>+ New Coupon</button>
      )}

      {formTarget && (
        <CouponForm
          coupon={formTarget === 'new' ? null : formTarget}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {error && <p className="form-error">{error}</p>}
      {!error && coupons.length === 0 && <p>No coupons found.</p>}
      {!error && coupons.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Code</th><th>Type</th><th>Value</th><th>Max Uses</th>
              <th>Per-User Limit</th><th>Used</th>
              <th>Starts</th><th>Expires</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.discountType}</td>
                <td>{c.discountValue}</td>
                <td>{c.maxUses}</td>
                <td>{c.perUserLimit}</td>
                <td>{c.usedCount}</td>
                <td>{new Date(c.startsAt).toLocaleDateString()}</td>
                <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => setFormTarget(c)}>Edit</button>
                  <button onClick={() => handleDelete(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
