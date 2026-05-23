'use client';

// app/checkout/page.tsx — Pakistani Payment Checkout

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, Smartphone, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, placeOrder } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank';

const PAYMENT_METHODS = [
  {
    id: 'cod' as PaymentMethod,
    label: 'Cash on Delivery',
    sublabel: 'Payment when Product Recieved',
    icon: Truck,
    color: 'green',
  },
  {
    id: 'jazzcash' as PaymentMethod,
    label: 'JazzCash',
    sublabel: 'Pay Using Mobile wallet',
    icon: Smartphone,
    color: 'red',
  },
  {
    id: 'easypaisa' as PaymentMethod,
    label: 'Easypaisa',
    sublabel: 'Pay Using Telenor wallet',
    icon: Smartphone,
    color: 'green',
  },
  {
    id: 'bank' as PaymentMethod,
    label: 'Bank Transfer',
    sublabel: 'Direct send to the bank account',
    icon: Building2,
    color: 'blue',
  },
];

// ⚠️ Apni actual details yahan dalo
const PAYMENT_DETAILS = {
  jazzcash: {
    number: '0317-1600275',
    name:   'Art Fusion PK',
  },
  easypaisa: {
    number: '0317-1600275',
    name:   'Art Fusion PK',
  },
  bank: {
    bankName:   'Meezan Bank',
    accountTitle: 'Art Fusion',
    accountNo:  '01234567891234',
    iban:       'PK36MEZN0001234567891234',
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [cartItems,   setCartItems]   = useState<any[]>([]);
  const [total,       setTotal]       = useState('0');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [orderId,     setOrderId]     = useState('');
  const [error,       setError]       = useState('');

  // Form state
  const [address,       setAddress]       = useState('');
  const [city,          setCity]          = useState('');
  const [phone,         setPhone]         = useState('');
  const [payMethod,     setPayMethod]     = useState<PaymentMethod>('cod');
  const [senderNumber,  setSenderNumber]  = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [accountName,   setAccountName]   = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      getCart().then(data => {
        setCartItems(data.items || []);
        setTotal(data.total || '0');
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    setError('');
    if (!address || !city || !phone) {
      setError('Address, city and mobile number are required');
      return;
    }
    if (payMethod !== 'cod' && !transactionId) {
      setError('Transaction ID required');
      return;
    }

    setSubmitting(true);
    try {
      const data = await placeOrder({
        address: `${address}, ${city} | Phone: ${phone}`,
        paymentMethod: payMethod,
        paymentDetails: {
          senderNumber,
          transactionId,
          accountName,
        },
      });
      setOrderId(data.orderId);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully! 🎉</h2>
        <p className="text-gray-500 mb-2">Order ID:</p>
        <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg mb-6">{orderId}</p>

        {payMethod === 'cod' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-semibold text-green-800 mb-1">✅ Cash on Delivery</p>
            <p className="text-green-700">Get your cash ready at the time of delivery. Delivered within 3-5 business days.</p>
          </div>
        )}
        {(payMethod === 'jazzcash' || payMethod === 'easypaisa') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-semibold text-blue-800 mb-1">⏳ Payment Verification</p>
            <p className="text-blue-700">Your Order will Confirmed after Payment Verification.You will be Updated in next 24 hours.</p>
          </div>
        )}
        {payMethod === 'bank' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-semibold text-blue-800 mb-1">⏳ Bank Transfer Verification</p>
            <p className="text-blue-700">Bank transfer verification took 1-2 business days.</p>
          </div>
        )}

        <Button onClick={() => router.push('/')} className="w-full bg-black text-white">
          Go to Home
        </Button>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Pehle login karo</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-8">

          {/* Left — Form */}
          <div className="md:col-span-3 space-y-6">

            {/* Delivery Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House No, Street, Area..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Lahore, Karachi..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPayMethod(method.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        payMethod === method.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className={`text-xs mt-0.5 ${payMethod === method.id ? 'text-gray-300' : 'text-gray-400'}`}>
                        {method.sublabel}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* JazzCash instructions */}
              {payMethod === 'jazzcash' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-red-800 mb-2">JazzCash Process:</p>
                  <div className="bg-white rounded-lg p-3 mb-3 font-mono text-center">
                    <p className="text-xs text-gray-500 mb-1">JazzCash Number</p>
                    <p className="text-lg font-bold text-gray-900">{PAYMENT_DETAILS.jazzcash.number}</p>
                    <p className="text-xs text-gray-500">{PAYMENT_DETAILS.jazzcash.name}</p>
                  </div>
                  <ol className="list-decimal list-inside text-red-700 space-y-1">
                    <li>Open JazzCash app</li>
                    <li>Go to Send Money</li>
                    <li>Enter the Given Number</li>
                    <li>Rs. {parseFloat(total).toLocaleString()} Send</li>
                    <li>Insert Transaction ID below</li>
                  </ol>
                  <div className="mt-3 space-y-2">
                    <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)}
                      placeholder="Your JazzCash number" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                      placeholder="Transaction ID *" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Easypaisa instructions */}
              {payMethod === 'easypaisa' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-green-800 mb-2">Easypaisa Process:</p>
                  <div className="bg-white rounded-lg p-3 mb-3 font-mono text-center">
                    <p className="text-xs text-gray-500 mb-1">Easypaisa Number</p>
                    <p className="text-lg font-bold text-gray-900">{PAYMENT_DETAILS.easypaisa.number}</p>
                    <p className="text-xs text-gray-500">{PAYMENT_DETAILS.easypaisa.name}</p>
                  </div>
                  <ol className="list-decimal list-inside text-green-700 space-y-1">
                    <li>Open Easypaisa app</li>
                    <li>Go to Send Money</li>
                    <li>Enter the Given Number</li>
                    <li>Rs. {parseFloat(total).toLocaleString()} Send</li>
                    <li>Insert Transaction ID below</li>
                  </ol>
                  <div className="mt-3 space-y-2">
                    <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)}
                      placeholder="Your Easypaisa number" className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                      placeholder="Transaction ID *" className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Bank Transfer instructions */}
              {payMethod === 'bank' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-blue-800 mb-3">Bank Account Details:</p>
                  <div className="bg-white rounded-lg p-4 space-y-2 mb-3">
                    {[
                      ['Bank', PAYMENT_DETAILS.bank.bankName],
                      ['Account Title', PAYMENT_DETAILS.bank.accountTitle],
                      ['Account No', PAYMENT_DETAILS.bank.accountNo],
                      ['IBAN', PAYMENT_DETAILS.bank.iban],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}:</span>
                        <span className="font-mono font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-bold text-gray-900">Rs. {parseFloat(total).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)}
                      placeholder="Your account holder name" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                      placeholder="Transaction ID / Reference No *" className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {/* COD note */}
              {payMethod === 'cod' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  ✅ Cash on Delivery selected.Keep<strong>Rs. {parseFloat(total).toLocaleString()}</strong> ready at the time of Delivery.
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base font-medium"
            >
              {submitting ? '⏳ Order placing Please wait...' : `Place Order — Rs. ${parseFloat(total).toLocaleString()}`}
            </Button>
          </div>

          {/* Right — Order summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary ({cartItems.length} items)</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item: any) => (
                  <div key={item.cartId} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image
                        ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.image}`} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">🎨</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.artistName}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">Rs. {item.price?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>Rs. {parseFloat(total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span><span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
                  <span>Total</span><span>Rs. {parseFloat(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
