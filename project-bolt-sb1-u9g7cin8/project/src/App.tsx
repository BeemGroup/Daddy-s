import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import KDS from './pages/KDS';
import StockManagement from './pages/StockManagement';
import Login from './pages/Login';
import Cart from './components/Cart';
import NameDialog from './components/NameDialog';
import CartNotification from './components/CartNotification';
import { CartItem } from './types';
import { brands } from './data/brands';

const OUT_OF_STOCK_KEY = 'outOfStockProducts';

function App() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(OUT_OF_STOCK_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sauvegarder les produits épuisés dans le localStorage
  useEffect(() => {
    localStorage.setItem(OUT_OF_STOCK_KEY, JSON.stringify([...outOfStockProducts]));
  }, [outOfStockProducts]);

  const handleAddToCart = (brandId: string, productId: string) => {
    if (!customerName && location.pathname !== '/kds') {
      setShowNameDialog(true);
      return;
    }

    if (outOfStockProducts.has(productId)) {
      return;
    }

    const brand = brands.find(b => b.id === brandId);
    const product = brand?.products.find(p => p.id === productId);

    if (!product) {
      return;
    }

    setCartItems(prevItems => [
      ...prevItems,
      { 
        brandId, 
        productId, 
        quantity: 1, 
        product,
        id: `${brandId}-${productId}-${Date.now()}`
      }
    ]);
    
    setShowCartNotification(true);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity === 0) {
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleNameSubmit = (name: string, email: string, phone: string) => {
    setCustomerName(name);
    setCustomerEmail(email);
    setCustomerPhone(phone);
    setShowNameDialog(false);
  };

  const handleToggleStock = (productId: string) => {
    setOutOfStockProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
        // Retirer le produit du panier s'il est épuisé
        setCartItems(prevItems => 
          prevItems.filter(item => item.productId !== productId)
        );
      }
      return newSet;
    });
  };

  const [isCartVisible, setIsCartVisible] = useState(true);
  
  useEffect(() => {
    const hiddenPaths = ['/kds', '/stock', '/login'];
    setIsCartVisible(!hiddenPaths.includes(location.pathname));
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home outOfStockProducts={outOfStockProducts} />} />
          <Route 
            path="/brand/:brandId" 
            element={
              <BrandPage 
                onAddToCart={handleAddToCart} 
                outOfStockProducts={outOfStockProducts}
              />
            } 
          />
          <Route 
            path="/kds" 
            element={
              <ProtectedRoute>
                <KDS />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute>
                <StockManagement 
                  outOfStockProducts={outOfStockProducts}
                  onToggleStock={handleToggleStock}
                />
              </ProtectedRoute>
            } 
          />
        </Routes>
        {isCartVisible && (
          <>
            <Cart 
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onClearCart={handleClearCart}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
            />
            <NameDialog
              isOpen={showNameDialog}
              onClose={() => setShowNameDialog(false)}
              onSubmit={handleNameSubmit}
            />
            <CartNotification 
              isVisible={showCartNotification}
              onHide={() => setShowCartNotification(false)}
            />
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;