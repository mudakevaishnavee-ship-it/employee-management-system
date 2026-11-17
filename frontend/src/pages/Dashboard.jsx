import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaUsers, FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaUser } from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';
  const [stats, setStats] = useState({ employees: 0, departments: 0, pendingLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdminOrHr) {
          const [empRes, deptRes, leaveRes] = await Promise.all([
            api.get('/employees'),
            api.get('/departments'),
            api.get('/leaves/pending'),
          ]);
          setStats({
            employees: empRes.data.length,
            departments: deptRes.data.length,
            pendingLeaves: leaveRes.data.length,
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdminOrHr]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {isAdminOrHr ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><FaUsers /></div>
              <div className="stat-info">
                <h3>{stats.employees}</h3>
                <p>Total Employees</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FaBuilding /></div>
              <div className="stat-info">
                <h3>{stats.departments}</h3>
                <p>Departments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow"><FaCalendarAlt /></div>
              <div className="stat-info">
                <h3>{stats.pendingLeaves}</h3>
                <p>Pending Leaves</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Quick Actions</h2>
            <div className="quick-links">
              <Link to="/employees/new" className="quick-link">
                <FaUsers /> Add New Employee
              </Link>
              <Link to="/leaves" className="quick-link">
                <FaCalendarAlt /> Review Leave Requests
              </Link>
              <Link to="/payroll" className="quick-link">
                <FaMoneyBillWave /> Generate Payslips
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>Welcome, {user?.fullName}!</h2>
            <p style={{ color: '#64748b', marginBottom: 20 }}>
              Here are some quick links to get you started.
            </p>
            <div className="quick-links">
              <Link to="/leaves" className="quick-link">
                <FaCalendarAlt /> Apply for Leave
              </Link>
              <Link to="/profile" className="quick-link">
                <FaUser /> View My Profile
              </Link>
              <Link to="/profile" className="quick-link">
                <FaMoneyBillWave /> View My Payslips
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
