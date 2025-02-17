import React from 'react';
import { brands } from '../data/brands';
import BrandCard from '../components/BrandCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Daddy's Dark Kitchen</h1>
          <p className="text-xl opacity-90">Découvrez nos 5 univers culinaires</p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </main>
    </div>
  );
}