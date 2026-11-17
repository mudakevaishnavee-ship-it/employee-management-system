import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaEdit, FaSave } from 'react-icons/fa';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';
  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get('/departments'),
        ]);
        setEmployee(empRes.data);
        setForm(empRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        toast.error('Failed to load employee');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/employees/${id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        designation: form.designation,
        salary: form.salary ? Number(form.salary) : null,
        dateOfJoining: form.dateOfJoining,
      });
      toast.success('Employee updated');
      setEditing(false);
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
      setForm(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!employee) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Employee Details</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdminOrHr && !editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <FaEdit /> Edit
            </button>
          )}
          {editing && (
            <>
              <button className="btn btn-success" onClick={handleSave}>
                <FaSave /> Save
              </button>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(employee); }}>
                Cancel
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
            Back
          </button>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input name="firstName" value={form.firstName || ''} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName || ''} onChange={handleChange} disabled={!editing} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input value={form.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editing} />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input name="address" value={form.address || ''} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            {editing ? (
              <select name="departmentId" value={form.departmentId || ''} onChange={handleChange}>
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            ) : (
              <input value={form.departmentName || '-'} disabled />
            )}
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input name="designation" value={form.designation || ''} onChange={handleChange} disabled={!editing} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              name="salary"
              value={form.salary || ''}
              onChange={handleChange}
              disabled={!editing || !isAdminOrHr}
            />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={form.dateOfJoining || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Role</label>
          <input value={form.role || ''} disabled />
        </div>
      </div>
    </div>
  );
}
