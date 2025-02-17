import React, { useState } from 'react';
import { ShoppingCart, X, MessageSquare, CreditCard, Wallet, PlaneTakeoff as TakeoutDining, UtensilsCrossed } from 'lucide-react';
import { CartItem, OrderType, PaymentMethod } from '../types';
import { brands } from '../data/brands';
import { loadStripe } from '@stripe/stripe-js';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearCart: () => void;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// Stripe sera configuré plus tard
const stripePromise = loadStripe('votre_cle_publique_stripe');

export default function Cart({ items, onUpdateQuantity, onClearCart, customerName, customerEmail, customerPhone }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('counter');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price || 0) * item.quantity;
  }, 0);

  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    if (promoCode === 'DADDY2025') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Code promo invalide');
      setPromoApplied(false);
    }
    setPromoCode('');
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      // Ici, nous simulerons simplement le paiement Stripe
      // Dans une vraie implémentation, nous appellerions l'API Stripe
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleSubmitOrder();
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitOrder = () => {
    if (items.length === 0) return;

    const orderNumber = Math.floor(Math.random() * 900) + 100;
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      items: items.map(item => ({
        ...item,
        comment: comments[item.id] || ''
      })),
      status: 'preparing',
      createdAt: new Date(),
      updatedAt: new Date(),
      customerName,
      customerEmail,
      customerPhone,
      table: `N°${orderNumber}`,
      orderType,
      paymentMethod,
      promoApplied,
      subtotal,
      discount,
      total,
      paid: true
    };

    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = [...existingOrders, order];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    alert('Commande validée !');
    onClearCart();
    setComments({});
    setPromoApplied(false);
    setIsOpen(false);
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [itemId]: comment
    }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-black text-white p-3 rounded-full shadow-lg"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Panier</h2>
                {customerName && (
                  <p className="text-sm text-gray-600">Commande pour {customerName}</p>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-gray-500 my-8">Votre panier est vide</p>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 mb-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {brands.find(b => b.id === item.brandId)?.name}
                        </p>
                        <p className="font-semibold">{item.product.price.toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ajouter un commentaire (ex: sans bacon)"
                        value={comments[item.id] || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        className="flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                    >
                      Appliquer
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-red-500 text-sm">{promoError}</p>
                  )}

                  {promoApplied && (
                    <p className="text-green-500 text-sm">Code promo DADDY2025 appliqué !</p>
                  )}

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Type de commande</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOrderType('takeaway')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                            orderType === 'takeaway'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <TakeoutDining className="w-4 h-4" />
                          À emporter
                        </button>
                        <button
                          onClick={() => setOrderType('dine-in')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                            orderType === 'dine-in'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                          Sur place
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mode de paiement</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPaymentMethod('counter')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                            paymentMethod === 'counter'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Wallet className="w-4 h-4" />
                          Au comptoir
                        </button>
                        <button
                          onClick={() => setPaymentMethod('stripe')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                            paymentMethod === 'stripe'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          Carte bancaire
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Remise (10%)</span>
                        <span>-{discount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  <button
                    onClick={paymentMethod === 'stripe' ? handleStripePayment : handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'stripe' ? (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Payer par carte
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5" />
                            Payer au comptoir
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}