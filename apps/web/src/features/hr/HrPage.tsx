import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatCurrency } from '@pos/utils';
import { Users, Clock, Play } from 'lucide-react';

export function HrPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res: any = await api.get('/hr/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/employees', {
        name,
        position,
        salary: Number(salary),
      });
      setName('');
      setPosition('');
      setSalary(0);
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const clockIn = async (employeeId: string) => {
    try {
      await api.post(`/hr/attendance/clock-in/${employeeId}`);
      fetchEmployees();
      alert('Clocked In Successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to clock in');
    }
  };

  const clockOut = async (employeeId: string) => {
    try {
      await api.post(`/hr/attendance/clock-out/${employeeId}`);
      fetchEmployees();
      alert('Clocked Out Successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to clock out');
    }
  };

  const runPayroll = async () => {
    try {
      const res: any = await api.post('/hr/payroll/process');
      alert(`Payroll Processed! Total Expense: ${formatCurrency(res.data.totalExpense)}`);
    } catch (err: any) {
      alert(err.message || 'Failed to run payroll');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Users size={20} />
          <span>HR Management</span>
        </h2>
        <button
          onClick={runPayroll}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-2 px-4 rounded shadow flex items-center gap-1"
        >
          <Play size={14} /> Run Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Employee Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Add Employee</h3>
          <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Position</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. Cashier"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Monthly Base Salary</label>
              <input
                type="number"
                required
                value={salary || ''}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-xs"
            >
              Add Employee
            </button>
          </form>
        </div>

        {/* Employee List & Attendance Controls */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="text-gray-400" size={18} />
            <h3 className="font-bold text-gray-800">Attendance & Shifts</h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Position</th>
                <th className="px-6 py-3 font-semibold">Salary</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const hasClockedIn = emp.attendances?.some((a: any) => a.check_out === null);
                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{emp.name}</td>
                    <td className="px-6 py-3 text-gray-500">{emp.position}</td>
                    <td className="px-6 py-3 font-semibold text-gray-700">{formatCurrency(emp.salary)}</td>
                    <td className="px-6 py-3 space-x-2">
                      {!hasClockedIn ? (
                        <button
                          onClick={() => clockIn(emp.id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded text-xs font-semibold"
                        >
                          Clock In
                        </button>
                      ) : (
                        <button
                          onClick={() => clockOut(emp.id)}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-2.5 py-1 rounded text-xs font-semibold"
                        >
                          Clock Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
