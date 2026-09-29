    import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client.js';

export default function Redeem() {
  const [form, setForm] = useState({ code: '', orderId: '', orderAmount: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // last successful redemption, to show details

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResult(null); // clear old success message once they start a new attempt
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await api.post('/users/redemptions', form);
      const { coupon, redemption } = res.data.data;
      setResult({ coupon, redemption });
      toast.success('Coupon redeemed!');
      setForm({ code: '', orderId: '', orderAmount: '' });
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];
      const fieldErrors = {};
      apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
      setErrors(fieldErrors);
      toast.error(apiErrors[0]?.message || 'Redemption failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.code.trim() && form.orderId.trim() && Number(form.orderAmount) > 0;

  return (
    <div>
      <h2>Redeem a Coupon</h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="code">Coupon Code</label>
        <input
          id="code"
          name="code"
          value={form.code}
          onChange={handleChange}
          aria-invalid={!!errors.code}
        />
        {errors.code && <span className="field-error">{errors.code}</span>}

        <label htmlFor="orderId">Order ID</label>
        <input
          id="orderId"
          name="orderId"
          value={form.orderId}
          onChange={handleChange}
          aria-invalid={!!errors.orderId}
        />
        {errors.orderId && <span className="field-error">{errors.orderId}</span>}

        <label htmlFor="orderAmount">Order Amount (₹)</label>
        <input
          id="orderAmount"
          name="orderAmount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.orderAmount}
          onChange={handleChange}
          aria-invalid={!!errors.orderAmount}
        />
        {errors.orderAmount && <span className="field-error">{errors.orderAmount}</span>}

        {/* Non-field-specific errors (e.g. "Coupon is not active", "Coupon has expired") */}
        {errors.null && <div className="form-error">{errors.null}</div>}

        <button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Redeeming…' : 'Redeem'}
        </button>
      </form>

      {result && (
        <div className="redeem-result">
          <h3>Success</h3>
          <p>Code: {result.coupon.code}</p>
          <p>Discount: {result.coupon.discountType === 'PERCENT'
            ? `${result.coupon.discountValue}%`
            : `₹${result.coupon.discountValue}`}
          </p>
          <p>Order: {result.redemption.orderId}</p>
          <p>Order Amount: ₹{result.redemption.orderAmount.toFixed(2)}</p>
          <p>Discount Applied: ₹{result.redemption.discountAmount.toFixed(2)}</p>
          <p><strong>Amount to Pay: ₹{result.redemption.finalAmount.toFixed(2)}</strong></p>
        </div>
      )}
    </div>
  );
}
