// src/schemas/couponSchema.js
import * as Yup from 'yup';

export const couponSchema = Yup.object({
  code: Yup.string().trim().required('Code is required'),
  discountType: Yup.string().oneOf(['PERCENT', 'FLAT']).required(),
  discountValue: Yup.number()
    .typeError('Must be a number')
    .positive('Must be greater than 0')
    .required('Discount value is required'),
  maxUses: Yup.number()
    .typeError('Must be a number')
    .integer()
    .min(1, 'Must be at least 1')
    .required('Max uses is required'),
  perUserLimit: Yup.number()
    .typeError('Must be a number')
    .integer()
    .min(1, 'Must be at least 1')
    .required('Per-user limit is required'),
  startsAt: Yup.date().required('Start date is required'),
  expiresAt: Yup.date()
    .required('Expiry date is required')
    .min(Yup.ref('startsAt'), 'Expiry must be after start date'),
});