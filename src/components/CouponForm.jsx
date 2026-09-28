import { Formik, Form, Field, ErrorMessage } from 'formik';
import { couponSchema } from '../schemas/couponSchema.js';

// Converts an ISO datetime to yyyy-mm-dd for <input type="date">
const toDateInput = (isoString) =>
  isoString ? new Date(isoString).toISOString().slice(0, 10) : '';

const blankValues = {
  code: '',
  discountType: 'PERCENT',
  discountValue: '',
  maxUses: '',
  perUserLimit: '',
  startsAt: '',
  expiresAt: '',
};

export default function CouponForm({ coupon, onSubmit, onCancel }) {
  // If a coupon was passed in, we're editing — pre-fill from it.
  // Otherwise, start blank — we're creating.
  const initialValues = coupon
    ? {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses,
        perUserLimit: coupon.perUserLimit,
        startsAt: toDateInput(coupon.startsAt),
        expiresAt: toDateInput(coupon.expiresAt),
      }
    : blankValues;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={couponSchema}
      onSubmit={onSubmit}
      enableReinitialize // lets the form reset if `coupon` prop changes (switching which row you're editing)
    >
      {({ isSubmitting }) => (
        <Form className="coupon-form">
          <Field name="code" placeholder="Code" />
          <ErrorMessage name="code" component="span" className="field-error" />

          <Field name="discountType" as="select">
            <option value="PERCENT">PERCENT</option>
            <option value="FLAT">FLAT</option>
          </Field>

          <Field name="discountValue" type="number" placeholder="Discount Value" />
          <ErrorMessage name="discountValue" component="span" className="field-error" />

          <Field name="maxUses" type="number" placeholder="Max Uses" />
          <ErrorMessage name="maxUses" component="span" className="field-error" />

          <Field name="perUserLimit" type="number" placeholder="Per-User Limit" />
          <ErrorMessage name="perUserLimit" component="span" className="field-error" />

          <label>
            Starts <Field name="startsAt" type="date" />
          </label>
          <ErrorMessage name="startsAt" component="span" className="field-error" />

          <label>
            Expires <Field name="expiresAt" type="date" />
          </label>
          <ErrorMessage name="expiresAt" component="span" className="field-error" />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : coupon ? 'Save Changes' : 'Create Coupon'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
          )}
        </Form>
      )}
    </Formik>
  );
}