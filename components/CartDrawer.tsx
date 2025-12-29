
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  savedItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater: (item: CartItem) => void;
  onMoveToCart: (item: CartItem) => void;
  onRemoveSaved: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  savedItems,
  onUpdateQuantity, 
  onRemove,
  onSaveForLater,
  onMoveToCart,
  onRemoveSaved,
  onCheckout
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRemove = (item: CartItem) => {
    setNotification(`${item.name} removed from cart.`);
    onRemove(item.id);
  };

  const handleSaveForLater = (item: CartItem) => {
    setNotification(`${item.name} saved for later.`);
    onSaveForLater(item);
  };

  const handleMoveToCart = (item: CartItem) => {
    setNotification(`${item.name} moved back to cart.`);
    onMoveToCart(item);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-[#F9F8F3]">
          <h2 className="text-2xl font-bold serif text-[#2D5A27]">Your Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Notification */}
        {notification && (
          <div className="bg-[#A4C639]/10 border-b border-[#A4C639]/20 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#A4C639] rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27]">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-[#2D5A27]/40 hover:text-[#2D5A27]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-10">
          {/* Active Cart Section */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A4C639] mb-6">Current Items ({items.length})</h3>
            <div className="space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 font-medium italic text-sm">Empty cart.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#2D5A27]/20 transition-all bg-[#F9F8F3]/50 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                      <p className="text-[#A4C639] font-bold text-xs mb-3">₹{item.price}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-[#2D5A27] transition-all text-[#2D5A27]"
                          >
                            -
                          </button>
                          <span className="font-bold text-xs min-w-[20px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:border-[#2D5A27] transition-all text-[#2D5A27]"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => handleSaveForLater(item)}
                          className="text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 hover:text-[#2D5A27] transition-all"
                        >
                          Save for Later
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(item)} 
                      className="text-gray-200 hover:text-red-500 transition-colors p-2 self-start"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Saved For Later Section */}
          {savedItems.length > 0 && (
            <div className="pt-10 border-t border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D5A27]/40 mb-6">Saved for Later ({savedItems.length})</h3>
              <div className="space-y-6">
                {savedItems.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-gray-50 bg-white opacity-70 hover:opacity-100 transition-all group">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-500 group-hover:text-gray-900 text-sm transition-all">{item.name}</h3>
                      <button 
                        onClick={() => handleMoveToCart(item)}
                        className="mt-2 text-[9px] font-black uppercase tracking-widest text-[#A4C639] hover:text-[#2D5A27] transition-all"
                      >
                        Move to Cart
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemoveSaved(item.id)}
                      className="text-gray-200 hover:text-red-400 p-2 self-start"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-[#F9F8F3] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6 px-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#2D5A27]/40">Subtotal</span>
               <span className="text-xl font-bold text-[#2D5A27]">₹{items.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-[#2D5A27] hover:bg-[#1a3817] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl hover:shadow-[#2D5A27]/30 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Go to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
