import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { brands } from '../data/brands';
import ProductCard from '../components/ProductCard';

interface BrandPageProps {
  onAddToCart: (brandId: string, productId: string) => void;
  outOfStockProducts: Set<string>;
}

export default function BrandPage({ onAddToCart, outOfStockProducts }: BrandPageProps) {
  const { brandId } = useParams<{ brandId: string }>();
  const brand = brands.find(b => b.id === brandId);

  if (!brand) {
    return <div>Marque non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className="h-[40vh] relative bg-center bg-cover"
        style={{ backgroundImage: `url(${brand.image})` }}
      >
        <div className="absolute inset-0 bg-black/50">
          <div className="max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <Link to="/" className="text-white mb-8 inline-flex items-center hover:underline">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{brand.name}</h1>
            <p className="text-xl text-white opacity-90">{brand.description}</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {brand.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isOutOfStock={outOfStockProducts.has(product.id)}
              onAddToCart={() => onAddToCart(brand.id, product.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}