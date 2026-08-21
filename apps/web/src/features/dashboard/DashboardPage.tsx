import React, { useState } from 'react';
import { useAuthStore } from '../../lib/auth';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  CreditCard,
  History,
  LogOut,
  Store,
  DollarSign
} from 'lucide-react';
import { ProductsPage } from '../products/ProductsPage';
import { WarehousePage } from '../warehouse/WarehousePage';
import { HrPage } from '../hr/HrPage';
import { MembershipPage } from '../membership/MembershipPage';
import { CashReportPage } from '../cash-report/CashReportPage';
import { AuditLogPage } from '../audit-log/AuditLogPage';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'warehouse' | 'hr' | 'membership' | 'cash' | 'audit'>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'warehouse', label: 'Warehouse', icon: Boxes },
    { id: 'hr', label: 'HR & Attendance', icon: Users },
    { id: 'membership', label: 'Membership', icon: CreditCard },
    { id: 'cash', label: 'Cash & Shift', icon: DollarSign },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <Store className="text-indigo-400 h-6 w-6" />
            <div>
              <h2 className="font-bold text-base leading-tight">Back Office</h2>
              <p className="text-xs text-slate-400">{user?.name} ({user?.role})</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab}</h1>
          <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
            Tenant: {user?.tenant_id.slice(0, 8)}
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Sales Today</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">Rp 4.250.000</h3>
                  <span className="text-xs text-green-600 font-medium">↑ 12% vs yesterday</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Transactions</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">48</h3>
                  <span className="text-xs text-indigo-600 font-medium">Active Shifts: 1</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Items</span>
                  <h3 className="text-2xl font-bold text-red-600 mt-2">3</h3>
                  <span className="text-xs text-red-500 font-medium">Needs restock</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Members</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">124</h3>
                  <span className="text-xs text-green-600 font-medium">+5 this week</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'warehouse' && <WarehousePage />}
          {activeTab === 'hr' && <HrPage />}
          {activeTab === 'membership' && <MembershipPage />}
          {activeTab === 'cash' && <CashReportPage />}
          {activeTab === 'audit' && <AuditLogPage />}
        </div>
      </main>
    </div>
  );
}
