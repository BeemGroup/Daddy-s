import React from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../types';

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link to={`/brand/${brand.id}`} className="group">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={brand.image}
          alt={brand.name}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">{brand.name}</h2>
            <p className="text-sm opacity-90">{brand.description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}