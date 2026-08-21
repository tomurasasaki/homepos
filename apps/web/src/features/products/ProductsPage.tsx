import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatCurrency } from '@pos/utils';
import { Package, Plus } from 'lucide-react';

export function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/pos/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post('/pos/products', {
        sku,
        name,
        price: Number(price),
        cost_price: Number(costPrice),
        category_name: categoryName,
      });

      setSku('');
      setName('');
      setPrice(0);
      setCostPrice(0);
      setCategoryName('');
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add product form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Plus size={18} className="text-indigo-600" />
          <span>Add New Product</span>
        </h3>

        {error && (
          <div className="bg-red-50 text-red-600 p-2.5 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">SKU Code</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Selling Price</label>
            <input
              type="number"
              required
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 block w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Cost Price</label>
            <input
              type="number"
              required
              value={costPrice || ''}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              className="mt-1 block w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-600">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Beverages"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded text-xs shadow mt-2"
          >
            Create Product
          </button>
        </form>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="text-gray-400" size={18} />
          <h3 className="font-bold text-gray-800">Product List</h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="px-6 py-3 font-semibold">SKU</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Selling Price</th>
              <th className="px-6 py-3 font-semibold">Cost Price</th>
              <th className="px-6 py-3 font-semibold">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 font-mono">{p.sku}</td>
                <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-3 text-gray-500">{p.category?.name || 'General'}</td>
                <td className="px-6 py-3 font-semibold text-indigo-600">{formatCurrency(p.price)}</td>
                <td className="px-6 py-3 text-gray-500">{formatCurrency(p.cost_price)}</td>
                <td className="px-6 py-3 font-semibold">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
