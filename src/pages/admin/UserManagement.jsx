import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client.js';

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'customer' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // --- NEW: which row (by id) is currently being edited, and its draft values ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    api.get('/users')
      .then((res) => {
        if (active) setUsers(res.data.data.users);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.errors?.[0]?.message || 'Failed to load users');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      await api.post('/users', form);
      toast.success('User created');
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];
      const fieldErrors = {};
      apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
      setFormErrors(fieldErrors);
      toast.error(apiErrors[0]?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: delete ---
  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/${user._id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Failed to delete user');
    }
  };

  // --- NEW: enter edit mode for a row ---
  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({ name: user.name, email: user.email, phone: user.phone, role: user.role });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    setEditErrors({});
    try {
      await api.put(`/users/${id}`, editForm);
      toast.success('User updated');
      cancelEdit();
      fetchUsers();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];
      const fieldErrors = {};
      apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
      setEditErrors(fieldErrors);
      toast.error(apiErrors[0]?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  const isValid = form.name && form.email && form.phone && form.password;

  if (loading) return <p>Loading users…</p>;

  return (
    <div>
      <h2>User Management</h2>

      <form onSubmit={handleCreate} noValidate className="create-user-form">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        {formErrors.name && <span className="field-error">{formErrors.name}</span>}
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        {formErrors.email && <span className="field-error">{formErrors.email}</span>}
        <input name="phone" placeholder="Phone (10 digits)" value={form.phone} onChange={handleChange} />
        {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        {formErrors.password && <span className="field-error">{formErrors.password}</span>}
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="customer">customer</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Creating…' : 'Create User'}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {!error && users.length === 0 && <p>No users found.</p>}
      {!error && users.length > 0 && (
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = editingId === u._id;
              return (
                <tr key={u._id}>
                  {isEditing ? (
                    <>
                      <td>
                        <input name="name" value={editForm.name} onChange={handleEditChange} />
                        {editErrors.name && <span className="field-error">{editErrors.name}</span>}
                      </td>
                      <td>
                        <input name="email" value={editForm.email} onChange={handleEditChange} />
                        {editErrors.email && <span className="field-error">{editErrors.email}</span>}
                      </td>
                      <td>
                        <input name="phone" value={editForm.phone} onChange={handleEditChange} />
                        {editErrors.phone && <span className="field-error">{editErrors.phone}</span>}
                      </td>
                      <td>
                        <select name="role" value={editForm.role} onChange={handleEditChange}>
                          <option value="customer">customer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => saveEdit(u._id)} disabled={savingEdit}>
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={cancelEdit} disabled={savingEdit}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.role}</td>
                      <td>
                        <button onClick={() => startEdit(u)}>Edit</button>
                        <button onClick={() => handleDelete(u)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
