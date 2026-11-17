import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
} from 'react-icons/fa';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>EMS</h2>
        <div className="user-info">{user?.fullName} &middot; {user?.role}</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <FaTachometerAlt /> Dashboard
        </NavLink>

        {isAdminOrHr && (
          <>
            <div className="sidebar-section-label">Management</div>
            <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUsers /> Employees
            </NavLink>
            <NavLink to="/payroll" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaMoneyBillWave /> Payroll
            </NavLink>
            <NavLink to="/leaves" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaClipboardList /> Leave Requests
            </NavLink>
          </>
        )}

        <div className="sidebar-section-label">Personal</div>
        {!isAdminOrHr && (
          <NavLink to="/leaves" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaCalendarAlt /> My Leaves
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <FaUser /> My Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}
