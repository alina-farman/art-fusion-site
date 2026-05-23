'use client';

// app/cart/page.tsx

import { useState, useEffect, useCallback } from 'react';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, removeCartItem, updateCartQuantity } from "@/lib/api";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const [items,   setItems]   = useState<any[]>([]);
  const [total,   setTotal]   = useState('0');
  const [loading, setLoading] = useState(true);
  // ✅ Track which item's quantity is being updated
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setItems(data.items || []);
      setTotal(data.total || '0');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setLoading(false);
  }, [isAuthenticated, fetchCart]);

  const handleRemove = async (artworkId: string) => {
    try {
      await removeCartItem(artworkId);
      fetchCart();
    } catch (e: any) { alert(e.message); }
  };

  // ✅ Quantity change handler
  const handleQuantityChange = async (artworkId: string, newQty: number) => {
    if (newQty < 1) return; // minimum 1
    setUpdatingId(artworkId);
    try {
      await updateCartQuantity(artworkId, newQty);
      // Optimistically update local state for instant UI feedback
      setItems((prev) =>
        prev.map((item) =>
          item.artworkId === artworkId
            ? { ...item, quantity: newQty, subtotal: item.price * newQty }
            : item
        )
      );
      // Then re-fetch to get correct total from server
      await fetchCart();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <ShoppingBag className="h-16 w-16 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-600">Login First</h2>
      <Link href="/"><Button>Go To Home</Button></Link>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 My Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Cart is empty</p>
            <Link href="/gallery"><Button>Visit Gallery</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item: any) => {
                const qty = item.quantity ?? 1;
                const isUpdating = updatingId === item.artworkId;

                return (
                  <div
                    key={item.cartId}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
                    style={{ opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">by {item.artistName}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Rs. {item.price?.toLocaleString()} / piece
                      </p>

                      {/* ✅ Quantity control */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleQuantityChange(item.artworkId, qty - 1)}
                          disabled={qty <= 1 || isUpdating}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                                     text-gray-600 hover:border-gray-400 hover:bg-gray-50
                                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold text-gray-900">
                          {isUpdating ? '...' : qty}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(item.artworkId, qty + 1)}
                          disabled={isUpdating}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                                     text-gray-600 hover:border-gray-400 hover:bg-gray-50
                                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>

                        {/* Subtotal for this item */}
                        <span className="ml-2 font-bold text-gray-900 text-sm">
                          = Rs. {(item.price * qty).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.artworkId)}
                      disabled={isUpdating}
                      className="text-red-400 hover:text-red-600 self-start disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-2 mb-3">
                {items.map((item: any) => {
                  const qty = item.quantity ?? 1;
                  return (
                    <div key={item.cartId} className="flex justify-between text-xs text-gray-500">
                      <span className="truncate max-w-[140px]">{item.title} × {qty}</span>
                      <span>Rs. {(item.price * qty).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-2 border-t pt-3">
                <span>Items ({items.reduce((s, i) => s + (i.quantity ?? 1), 0)})</span>
                <span>Rs. {parseFloat(total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900 mb-5">
                <span>Total</span>
                <span>Rs. {parseFloat(total).toLocaleString()}</span>
              </div>
              <Link href="/checkout">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  Checkout →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}