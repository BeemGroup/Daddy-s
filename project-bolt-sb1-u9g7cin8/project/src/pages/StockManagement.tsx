import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { brands } from '../data/brands';
import { Product } from '../types';

interface ProductWithBrand extends Product {
  brandName: string;
  brandId: string;
}

interface StockManagementProps {
  outOfStockProducts: Set<string>;
  onToggleStock: (productId: string) => void;
}

export default function StockManagement({ outOfStockProducts, onToggleStock }: StockManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Créer une liste plate de tous les produits avec leur marque
  const allProducts: ProductWithBrand[] = brands.flatMap(brand =>
    brand.products.map(product => ({
      ...product,
      brandName: brand.name,
      brandId: brand.id,
    }))
  );

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center text-white mb-6 hover:underline">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold mb-4">Gestion des Stocks</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Marque</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prix</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={`${product.brandId}-${product.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={brands.find(b => b.id === product.brandId)?.image}
                          alt={product.brandName}
                          className="w-8 h-8 rounded-full object-cover mr-3"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {product.brandName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {product.price.toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        outOfStockProducts.has(product.id)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {outOfStockProducts.has(product.id) ? 'Épuisé' : 'En stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onToggleStock(product.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          outOfStockProducts.has(product.id)
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {outOfStockProducts.has(product.id)
                          ? 'Remettre en stock'
                          : 'Marquer épuisé'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}