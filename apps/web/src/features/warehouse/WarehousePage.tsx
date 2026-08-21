import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Boxes, RefreshCw } from 'lucide-react';

export function WarehousePage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form states
  const [opnameBranch, setOpnameBranch] = useState('');
  const [opnameProduct, setOpnameProduct] = useState('');
  const [actualQty, setActualQty] = useState(0);

  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [transferProduct, setTransferProduct] = useState('');
  const [transferQty, setTransferQty] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchStocks();
    fetchTransfers();
    fetchBranches();
    fetchProducts();
  }, []);

  const fetchStocks = async () => {
    try {
      const res: any = await api.get('/warehouse/stocks');
      setStocks(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransfers = async () => {
    try {
      const res: any = await api.get('/warehouse/transfers');
      setTransfers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/store-config/branches');
      setBranches(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/pos/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/warehouse/opname', {
        branch_id: opnameBranch,
        product_id: opnameProduct,
        actual_quantity: Number(actualQty),
      });
      fetchStocks();
      alert('Opname updated successfully');
    } catch (err: any) {
      alert(err.message || 'Opname failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/warehouse/transfer', {
        from_branch_id: fromBranch,
        to_branch_id: toBranch,
        product_id: transferProduct,
        quantity: Number(transferQty),
        notes,
      });
      fetchStocks();
      fetchTransfers();
      alert('Stock transferred successfully');
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opname Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <RefreshCw size={16} />
            <span>Stock Opname (Adjustment)</span>
          </h3>
          <form onSubmit={handleOpname} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Branch</label>
              <select
                required
                value={opnameBranch}
                onChange={(e) => setOpnameBranch(e.target.value)}
                className="w-full border rounded p-2 bg-white"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Product</label>
              <select
                required
                value={opnameProduct}
                onChange={(e) => setOpnameProduct(e.target.value)}
                className="w-full border rounded p-2 bg-white"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Actual Physical Quantity</label>
              <input
                type="number"
                required
                value={actualQty || ''}
                onChange={(e) => setActualQty(Number(e.target.value))}
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-xs"
            >
              Adjust Stock
            </button>
          </form>
        </div>

        {/* Transfer Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Boxes size={16} />
            <span>Stock Transfer</span>
          </h3>
          <form onSubmit={handleTransfer} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">From Branch</label>
                <select
                  required
                  value={fromBranch}
                  onChange={(e) => setFromBranch(e.target.value)}
                  className="w-full border rounded p-2 bg-white"
                >
                  <option value="">Source</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">To Branch</label>
                <select
                  required
                  value={toBranch}
                  onChange={(e) => setToBranch(e.target.value)}
                  className="w-full border rounded p-2 bg-white"
                >
                  <option value="">Destination</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Product</label>
              <select
                required
                value={transferProduct}
                onChange={(e) => setTransferProduct(e.target.value)}
                className="w-full border rounded p-2 bg-white"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-gray-600 font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={transferQty || ''}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 font-semibold mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="e.g. Restock"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded text-xs"
            >
              Transfer Stock
            </button>
          </form>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Boxes className="text-gray-400" size={18} />
          <h3 className="font-bold text-gray-800">Current Stock Levels</h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="px-6 py-3 font-semibold">Branch</th>
              <th className="px-6 py-3 font-semibold">Product Name</th>
              <th className="px-6 py-3 font-semibold">SKU</th>
              <th className="px-6 py-3 font-semibold">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold text-gray-900">{s.branch?.name}</td>
                <td className="px-6 py-3">{s.product?.name}</td>
                <td className="px-6 py-3 font-mono">{s.product?.sku}</td>
                <td className="px-6 py-3 font-bold">{s.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
