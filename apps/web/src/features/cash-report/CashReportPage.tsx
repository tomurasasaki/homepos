import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '@pos/utils';
import { DollarSign, FileText } from 'lucide-react';

export function CashReportPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [actualCash, setActualCash] = useState(0);

  useEffect(() => {
    fetchJournals();
    fetchActiveShift();
  }, []);

  const fetchJournals = async () => {
    try {
      const res: any = await api.get('/cash-report/journals');
      setJournals(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveShift = async () => {
    try {
      const res: any = await api.get('/cash-report/shift/active');
      setActiveShift(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      await api.post(`/cash-report/shift/close/${activeShift.id}`, {
        actual_cash: Number(actualCash),
      });
      alert('Shift Closed and Journal entry created!');
      setActiveShift(null);
      fetchJournals();
    } catch (err: any) {
      alert(err.message || 'Failed to close shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Shift status / Close Shift card */}
      {activeShift && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md">
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <DollarSign className="text-green-600" size={18} />
            <span>Active Shift Closing</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Drawer Start Cash: {formatCurrency(activeShift.start_cash)}
          </p>

          <form onSubmit={handleCloseShift} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Counted Cash in Drawer (End Cash)
              </label>
              <input
                type="number"
                required
                value={actualCash || ''}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded text-xs shadow"
            >
              Reconcile & Close Shift
            </button>
          </form>
        </div>
      )}

      {/* Journal entries table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="text-gray-400" size={18} />
          <h3 className="font-bold text-gray-800">Financial Journal Records</h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="px-6 py-3 font-semibold">Reference</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Description</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j) => (
              <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-mono font-semibold text-gray-800">{j.reference}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      j.type === 'INCOME'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {j.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600 max-w-xs">{j.description}</td>
                <td className="px-6 py-3 font-bold text-gray-900">{formatCurrency(j.amount)}</td>
                <td className="px-6 py-3 text-gray-400">{formatDate(j.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
