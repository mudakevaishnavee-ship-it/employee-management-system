import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetail from './pages/EmployeeDetail';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-container">
      {isAuthenticated && !isLoginPage && <Sidebar />}
      <main className={isAuthenticated && !isLoginPage ? 'main-content' : 'main-content-full'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
          <Route path="/employees/new" element={<PrivateRoute><EmployeeForm /></PrivateRoute>} />
          <Route path="/employees/:id" element={<PrivateRoute><EmployeeDetail /></PrivateRoute>} />
          <Route path="/leaves" element={<PrivateRoute><Leaves /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
