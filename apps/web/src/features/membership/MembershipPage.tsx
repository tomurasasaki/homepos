import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatCurrency } from '@pos/utils';
import { CreditCard, Tag } from 'lucide-react';

export function MembershipPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);

  // Form states
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');

  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchMembers();
    fetchVouchers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res: any = await api.get('/membership/members');
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res: any = await api.get('/membership/vouchers');
      setVouchers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/membership/members', {
        name: memberName,
        phone: memberPhone,
      });
      setMemberName('');
      setMemberPhone('');
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to create member');
    }
  };

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/membership/vouchers', {
        code: voucherCode,
        discount_amount: Number(discountAmount),
      });
      setVoucherCode('');
      setDiscountAmount(0);
      fetchVouchers();
    } catch (err: any) {
      alert(err.message || 'Failed to create voucher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Members Management */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={16} />
              <span>Register Member</span>
            </h3>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-xs"
              >
                Register
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 font-semibold">Points</th>
                  <th className="px-6 py-3 font-semibold">Tier</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-6 py-3 text-gray-500">{m.phone}</td>
                    <td className="px-6 py-3 font-bold text-indigo-600">{m.points}</td>
                    <td className="px-6 py-3">
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-semibold">
                        {m.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voucher Config */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag size={16} />
              <span>Create Discount Voucher</span>
            </h3>
            <form onSubmit={handleAddVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full border rounded p-2 font-mono uppercase"
                  placeholder="e.g. DISCOUNT50"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Discount Amount (IDR)</label>
                <input
                  type="number"
                  required
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-xs"
              >
                Create Promo
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="px-6 py-3 font-semibold">Promo Code</th>
                  <th className="px-6 py-3 font-semibold">Discount Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono font-bold text-gray-800">{v.code}</td>
                    <td className="px-6 py-3 text-gray-900 font-semibold">{formatCurrency(v.discount_amount)}</td>
                    <td className="px-6 py-3">
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
