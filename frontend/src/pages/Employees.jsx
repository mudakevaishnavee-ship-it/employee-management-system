import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEye, FaTrash } from 'react-icons/fa';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchEmployees();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/employees/search?keyword=${encodeURIComponent(search)}`);
      setEmployees(res.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeptFilter = async (deptId) => {
    setDeptFilter(deptId);
    setSearch('');
    if (!deptId) {
      fetchEmployees();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/employees/department/${deptId}`);
      setEmployees(res.data);
    } catch (err) {
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete employee ${name}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <Link to="/employees/new" className="btn btn-primary">
          <FaPlus /> Add Employee
        </Link>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, designation, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <select
          className="filter-select"
          value={deptFilter}
          onChange={(e) => handleDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <FaSearch />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                    <td>{emp.email}</td>
                    <td>{emp.departmentName || '-'}</td>
                    <td>{emp.designation || '-'}</td>
                    <td><span className={`badge badge-${emp.role?.toLowerCase()}`}>{emp.role}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => navigate(`/employees/${emp.id}`)}>
                          <FaEye />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}>
                          <FaTrash />
                        </button>
                      </div>
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
