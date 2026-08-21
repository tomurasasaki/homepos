import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatDate } from '@pos/utils';
import { History, ShieldAlert } from 'lucide-react';

export function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res: any = await api.get('/audit-log');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-indigo-600" size={20} />
        <h2 className="text-lg font-bold text-gray-800">System Audit Trail</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <History className="text-gray-400" size={18} />
          <h3 className="font-bold text-gray-800">Append-Only Action Logs</h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Action</th>
              <th className="px-6 py-3 font-semibold">Entity</th>
              <th className="px-6 py-3 font-semibold">Entity ID</th>
              <th className="px-6 py-3 font-semibold">IP Address</th>
              <th className="px-6 py-3 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{log.user?.name || log.user_id || 'System'}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      log.action === 'CREATE'
                        ? 'bg-green-50 text-green-700'
                        : log.action === 'DELETE'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-gray-700">{log.entity}</td>
                <td className="px-6 py-3 font-mono text-gray-500">{log.entity_id || '-'}</td>
                <td className="px-6 py-3 text-gray-400">{log.ip_address || 'local'}</td>
                <td className="px-6 py-3 text-gray-400">{formatDate(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
