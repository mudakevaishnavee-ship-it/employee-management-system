import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaSave, FaDownload, FaMoneyBillWave } from 'react-icons/fa';

export default function Profile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employees/me');
        setEmployee(res.data);
        setForm({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        const payRes = await api.get('/payroll/my');
        setPayslips(payRes.data);
      } catch (err) {
        if (user?.role === 'ADMIN') {
          setEmployee(null);
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/employees/${employee.id}`, form);
      toast.success('Profile updated');
      setEditing(false);
      const res = await api.get('/employees/me');
      setEmployee(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (payslipId) => {
    try {
      const res = await api.get(`/payroll/download/${payslipId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${payslipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!employee) {
    return (
      <div>
        <div className="page-header"><h1>My Profile</h1></div>
        <div className="card">
          <div className="empty-state">
            <p>No employee profile linked to this account.</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
              Admin accounts do not have an employee profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
          {editing && (
            <>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                <FaSave /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setEditing(false);
                setForm({
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  phone: employee.phone || '',
                  address: employee.address || '',
                });
              }}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{employee.firstName} {employee.lastName}</h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              {employee.designation || 'Employee'} &middot; {employee.departmentName}
            </p>
          </div>
        </div>

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
            <input value={employee.email} disabled />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <input value={employee.departmentName || '-'} disabled />
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input value={employee.designation || '-'} disabled />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Salary</label>
            <input value={employee.salary?.toFixed(2) || '-'} disabled />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input value={employee.dateOfJoining || '-'} disabled />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>My Payslips</h2>
        {payslips.length === 0 ? (
          <div className="empty-state">
            <FaMoneyBillWave />
            <p>No payslips available yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{monthNames[p.month - 1]} {p.year}</strong></td>
                    <td>{p.basicSalary?.toFixed(2)}</td>
                    <td>{p.hra?.toFixed(2)}</td>
                    <td>{p.allowances?.toFixed(2)}</td>
                    <td>{p.deductions?.toFixed(2)}</td>
                    <td><strong>{p.netSalary?.toFixed(2)}</strong></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDownload(p.id)}>
                        <FaDownload /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
