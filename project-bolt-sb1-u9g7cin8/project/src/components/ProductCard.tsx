import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isOutOfStock: boolean;
}

export default function ProductCard({ product, onAddToCart, isOutOfStock }: ProductCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      onAddToCart();
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="relative">
        {isOutOfStock ? (
          <div className="w-full h-48 bg-gray-900 flex items-center justify-center text-white text-center p-4">
            <p className="font-bold text-lg">
              ÉPUISÉ<br />
              Il a été victime de son succès !
            </p>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">{product.price.toFixed(2)} €</span>
          <button
            onClick={handleClick}
            className={`${
              isOutOfStock 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            } text-white px-4 py-2 rounded-lg transition-colors`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Épuisé' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}