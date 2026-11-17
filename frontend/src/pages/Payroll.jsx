import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaDownload, FaMoneyBillWave } from 'react-icons/fa';

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get('/employees').then((res) => setEmployees(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchPayslips(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchPayslips = async (empId) => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll/employee/${empId}`);
      setPayslips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    setGenerating(true);
    try {
      await api.post(`/payroll/generate/${selectedEmployee}?month=${month}&year=${year}`);
      toast.success('Payslip generated');
      fetchPayslips(selectedEmployee);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
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

  return (
    <div>
      <div className="page-header">
        <h1>Payroll Management</h1>
      </div>

      <div className="card">
        <h2>Generate Payslip</h2>
        <form onSubmit={handleGenerate}>
          <div className="form-row">
            <div className="form-group">
              <label>Employee</label>
              <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.designation || emp.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {monthNames.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Payslip'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {selectedEmployee && (
        <div className="card">
          <h2>Payslip History</h2>
          {loading ? (
            <div className="loading">Loading payslips...</div>
          ) : payslips.length === 0 ? (
            <div className="empty-state">
              <FaMoneyBillWave />
              <p>No payslips generated yet for this employee</p>
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
                    <th>Actions</th>
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
      )}
    </div>
  );
}
