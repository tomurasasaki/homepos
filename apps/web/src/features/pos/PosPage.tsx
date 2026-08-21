import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { formatCurrency, calculateCartTotals } from '@pos/utils';
import { CartItem, PaymentMethod } from '@pos/types';
import { ShoppingCart, Plus, Minus, Trash2, LogOut, Coffee } from 'lucide-react';

export function PosPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [products, setProducts] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [startCash, setStartCash] = useState<number>(100000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchActiveShift();
  }, []);

  const fetchProducts = async () => {
    try {
      const res: any = await api.get('/pos/products');
      setProducts(res.data || []);
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

  const openShift = async () => {
    if (!user?.branch_id) return;
    try {
      const res: any = await api.post('/cash-report/shift/open', {
        branch_id: user.branch_id,
        start_cash: Number(startCash),
      });
      setActiveShift(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to open shift');
    }
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const { subtotal, tax, discount, total } = calculateCartTotals(cart);

  const handleCheckout = async () => {
    if (!activeShift) {
      alert('Open a shift first');
      return;
    }
    if (paidAmount < total) {
      alert('Paid amount cannot be less than total');
      return;
    }

    setLoading(true);
    try {
      await api.post('/pos/checkout', {
        branch_id: user?.branch_id || activeShift.branch_id,
        shift_id: activeShift.id,
        items: cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity })),
        paid_amount: Number(paidAmount),
        payment_method: paymentMethod,
      });

      setMessage('Payment successful!');
      setCart([]);
      setPaidAmount(0);
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!activeShift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full text-center">
          <Coffee className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kasir Shift Inactive</h2>
          <p className="text-sm text-gray-600 mb-4">Please input starting drawer cash to begin your shift.</p>
          <input
            type="number"
            value={startCash}
            onChange={(e) => setStartCash(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2 text-sm mb-4 text-center"
            placeholder="Starting Cash (IDR)"
          />
          <button
            onClick={openShift}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md"
          >
            Start Shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Product selection grid */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">POS Front Office</h1>
            <p className="text-sm text-gray-500">Cashier: {user?.name} | Shift Active</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg text-gray-700"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {message && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm mb-4 font-semibold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                  {p.category?.name || 'General'}
                </span>
                <h3 className="font-semibold text-gray-800 mt-2">{p.name}</h3>
                <p className="text-xs text-gray-400">SKU: {p.sku}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-indigo-600">{formatCurrency(p.price)}</span>
                <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart side panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col justify-between shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <ShoppingCart size={20} />
            <span>Current Order</span>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
            {cart.length} items
          </span>
        </div>

        {/* Cart items list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <ShoppingCart size={40} className="mx-auto mb-2 opacity-30" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{item.product_name}</h4>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, -1)}
                    className="p-1 bg-white border rounded hover:bg-gray-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, 1)}
                    className="p-1 bg-white border rounded hover:bg-gray-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill summary and payment */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="text-xs space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (11%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-800 pt-1 border-t">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="text-xs border rounded p-2 bg-white"
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.QRIS}>QRIS</option>
              <option value={PaymentMethod.DEBIT}>Debit</option>
              <option value={PaymentMethod.CREDIT}>Credit</option>
            </select>
            <input
              type="number"
              value={paidAmount || ''}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="Paid Amount"
              className="text-xs border rounded p-2 bg-white"
            />
          </div>

          {paidAmount >= total && paidAmount > 0 && (
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded flex justify-between font-bold">
              <span>Change:</span>
              <span>{formatCurrency(paidAmount - total)}</span>
            </div>
          )}

          <button
            disabled={cart.length === 0 || loading || paidAmount < total}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 text-sm shadow"
          >
            {loading ? 'Processing...' : 'Charge'}
          </button>
        </div>
      </div>
    </div>
  );
}
