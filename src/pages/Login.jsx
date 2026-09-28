import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Where to send the user after login — either back to the page
  // that redirected them here, or the dashboard by default.
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.identifier) newErrors.identifier = 'Email or phone is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login(form.identifier, form.password);
      toast.success('Logged in');
      const destination =
        loggedInUser.role !== 'admin' && from.startsWith('/admin') ? '/' : from;
      navigate(destination, { replace: true });
    } catch (err) {
      // Backend error shape: { errors: [{ field, message }] }
      const message = err.response?.data?.errors?.[0]?.message || 'Login failed';
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.identifier.trim() && form.password;

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1>Sign in</h1>

        {errors.form && <div className="form-error">{errors.form}</div>}

        <label htmlFor="identifier">Email or Phone</label>
        <input
          id="identifier"
          name="identifier"
          value={form.identifier}
          onChange={handleChange}
          aria-invalid={!!errors.identifier}
        />
        {errors.identifier && <span className="field-error">{errors.identifier}</span>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}

        <button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}           
