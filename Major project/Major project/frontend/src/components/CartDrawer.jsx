import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { orderApi } from '../services/api';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart, currentUser, onOpenAuth, onProceedToPayment }) => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const shippingAddress = '123 Tech Park Avenue, Cyber City, Bangalore - 560001';

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal > 1000 ? 0 : 150;
  const grandTotal = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!currentUser) {
      onOpenAuth && onOpenAuth();
      return;
    }

    if (cartItems.length === 0) return;

    if (onProceedToPayment) {
      onProceedToPayment();
      return;
    }

    setCheckingOut(true);
    try {
      const orderPayload = {
        shippingAddress: shippingAddress,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await orderApi.create(orderPayload);
      setOrderSuccess(res.data);
      onClearCart && onClearCart();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Order checkout failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-surface)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag className="text-primary" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Shopping Cart ({cartItems.length})</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {orderSuccess ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <CheckCircle2 size={64} style={{ color: 'var(--success)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Order Confirmed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
              Your order has been recorded in the PostgreSQL database.
            </p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', width: '100%', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>
              <div><strong>Order ID:</strong> #{orderSuccess.id}</div>
              <div style={{ marginTop: '4px' }}><strong>Status:</strong> <span className="badge badge-success">{orderSuccess.status}</span></div>
              <div style={{ marginTop: '4px' }}><strong>Total:</strong> ₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}</div>
              <div style={{ marginTop: '4px' }}><strong>Items:</strong> {orderSuccess.items?.length || 0} product(s)</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setOrderSuccess(null); onClose(); }} style={{ width: '100%' }}>
              Continue Shopping
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <ShoppingBag size={56} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Your cart is empty</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 1.5rem' }}>
              Explore our catalogue or ask our AI Advisor for recommendations.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Browse Catalogue
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.85rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#0a0f1d', flexShrink: 0 }}>
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.product.price?.toLocaleString('en-IN')} each</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', padding: '2px 6px', color: 'var(--text-main)', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.8rem', padding: '0 6px', fontWeight: 600 }}>{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', padding: '2px 6px', color: 'var(--text-main)', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price summary & Checkout button */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Estimated Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginBottom: '1.25rem' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {!currentUser ? (
                <button className="btn btn-primary" onClick={onOpenAuth} style={{ width: '100%', padding: '0.75rem' }}>
                  Log In to Complete Checkout
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #0d2757 0%, #1e3a8a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {checkingOut ? 'Opening Secure Payment...' : (
                    <>
                      <span>🔒 Proceed to Secure Payment</span> <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
