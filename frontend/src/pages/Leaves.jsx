import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';

export default function Leaves() {
  const { user } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';
  const [tab, setTab] = useState(isAdminOrHr ? 'all' : 'my');
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (isAdminOrHr) {
        if (tab === 'pending') {
          const res = await api.get('/leaves/pending');
          setLeaves(res.data);
        } else {
          const res = await api.get('/leaves');
          setLeaves(res.data);
        }
      } else {
        const res = await api.get('/leaves/my');
        setLeaves(res.data);
      }
    } catch (err) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await api.get('/leaves/balance');
      setBalances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaves();
    if (!isAdminOrHr) fetchBalances();
  }, [tab]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      fetchBalances();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/leaves/${id}/${action}`);
      toast.success(`Leave ${action}d`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const statusBadge = (status) => (
    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
  );

  return (
    <div>
      <div className="page-header">
        <h1>{isAdminOrHr ? 'Leave Requests' : 'My Leaves'}</h1>
      </div>

      {isAdminOrHr && (
        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All Requests
          </button>
          <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            Pending
          </button>
        </div>
      )}

      {!isAdminOrHr && (
        <>
          <div className="card">
            <h2>Leave Balance</h2>
            <div className="balance-grid">
              {balances.map((b) => (
                <div key={b.id} className="balance-card">
                  <h4>{b.leaveType}</h4>
                  <div className="balance-num">{b.totalLeaves - b.usedLeaves}</div>
                  <div className="balance-total">of {b.totalLeaves} remaining</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Apply for Leave</h2>
            <form onSubmit={handleApply}>
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select name="leaveType" value={form.leaveType} onChange={handleChange}>
                    <option value="CASUAL">Casual</option>
                    <option value="SICK">Sick</option>
                    <option value="EARNED">Earned</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason</label>
                  <input name="reason" value={form.reason} onChange={handleChange} placeholder="Optional reason" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Apply Leave'}
              </button>
            </form>
          </div>
        </>
      )}

      <div className="card">
        <h2>{isAdminOrHr ? (tab === 'pending' ? 'Pending Requests' : 'All Leave Requests') : 'My Leave History'}</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isAdminOrHr && <th>Employee</th>}
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {isAdminOrHr && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    {isAdminOrHr && <td><strong>{l.employeeName}</strong></td>}
                    <td>{l.leaveType}</td>
                    <td>{l.startDate}</td>
                    <td>{l.endDate}</td>
                    <td>{l.reason || '-'}</td>
                    <td>{statusBadge(l.status)}</td>
                    {isAdminOrHr && (
                      <td>
                        {l.status === 'PENDING' ? (
                          <div className="actions">
                            <button className="btn btn-success btn-sm btn-icon" onClick={() => handleAction(l.id, 'approve')}>
                              <FaCheck />
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleAction(l.id, 'reject')}>
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 13 }}>{l.approvedByName || '-'}</span>
                        )}
                      </td>
                    )}
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
