import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface CartNotificationProps {
  isVisible: boolean;
  onHide: () => void;
}

export default function CartNotification({ isVisible, onHide }: CartNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-1/2 left-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
        <CheckCircle className="w-6 h-6" />
        <span className="font-medium">Produit ajouté au panier</span>
      </div>
    </div>
  );
}