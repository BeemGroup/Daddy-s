import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle2, Coffee, ChefHat, RefreshCw, Trash2, Clock, MessageSquare, Mail, Phone, Download, CreditCard, Wallet, PlaneTakeoff as TakeoutDining, UtensilsCrossed } from 'lucide-react';
import { Order } from '../types';
import NotificationSound from '../components/NotificationSound';

const STATUS_LABELS = {
  preparing: 'En préparation',
  ready: 'Prêt',
  completed: 'Terminé'
};

export default function KDS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playSound, setPlaySound] = useState(false);
  const lastOrdersRef = useRef<Order[]>([]);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        try {
          const newOrders = JSON.parse(savedOrders).map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt)
          }));
          
          const hasNewOrders = newOrders.some(
            (order: Order) => {
              const isNew = !lastOrdersRef.current.some(
                (lastOrder) => lastOrder.id === order.id
              );
              return order.status === 'preparing' && isNew;
            }
          );
          
          if (hasNewOrders) {
            if (notificationTimeoutRef.current) {
              clearTimeout(notificationTimeoutRef.current);
            }
            
            notificationTimeoutRef.current = setTimeout(() => {
              setPlaySound(true);
            }, 5000);
          }
          
          lastOrdersRef.current = newOrders;
          setOrders(newOrders);
        } catch (error) {
          console.error('Erreur lors du chargement des commandes:', error);
        }
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 1000);
    
    return () => {
      clearInterval(interval);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleClearCompleted = () => {
    const updatedOrders = orders.filter(order => order.status !== 'completed');
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleExportCompleted = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    if (completedOrders.length === 0) {
      alert('Aucune commande terminée à exporter');
      return;
    }

    const headers = [
      'N° Commande',
      'Date',
      'Client',
      'Téléphone',
      'Email',
      'Type de commande',
      'Mode de paiement',
      'Produits',
      'Commentaires',
      'Sous-total',
      'Remise',
      'Total',
      'Temps de préparation',
      'Statut paiement'
    ].join(';');

    const rows = completedOrders.map(order => {
      const products = order.items
        .map(item => `${item.quantity}x ${item.product.name} (${item.product.price.toFixed(2)}€)`)
        .join(', ');
      
      const comments = order.items
        .filter(item => item.comment)
        .map(item => `${item.product.name}: ${item.comment}`)
        .join(', ');

      const preparationTime = Math.floor(
        (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / 1000 / 60
      );

      return [
        order.table,
        new Date(order.createdAt).toLocaleString('fr-FR'),
        order.customerName || '',
        order.customerPhone || '',
        order.customerEmail || '',
        order.orderType === 'takeaway' ? 'À emporter' : 'Sur place',
        order.paymentMethod === 'stripe' ? 'Carte bancaire' : 'Au comptoir',
        products,
        comments,
        order.subtotal?.toFixed(2) || '0.00',
        order.discount?.toFixed(2) || '0.00',
        order.total?.toFixed(2) || '0.00',
        `${preparationTime} minutes`,
        order.paid ? 'Payé' : 'En attente'
      ].join(';');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_terminees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'preparing':
        return <ChefHat className="w-6 h-6 text-blue-500" />;
      case 'ready':
        return <Coffee className="w-6 h-6 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeElapsed = (date: Date, status: Order['status']) => {
    if (status === 'completed') {
      return '00:00';
    }
    const orderDate = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((currentTime.getTime() - orderDate.getTime()) / 1000);
    return formatTime(seconds);
  };

  const getTimeColor = (date: Date) => {
    const orderDate = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((currentTime.getTime() - orderDate.getTime()) / 1000);
    if (seconds >= 200) return 'text-red-500';
    if (seconds >= 150) return 'text-orange-500';
    return 'text-green-500';
  };

  const formatParisDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSound 
        play={playSound} 
        onPlay={() => setPlaySound(false)} 
      />
      <header className="bg-black text-white p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">Système d'Affichage Cuisine</h1>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-6 h-6 text-gray-400" />
                <span className="text-2xl font-bold">{formatParisDateTime(currentTime)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleExportCompleted}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2"
                title="Exporter les commandes terminées"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={handleClearCompleted}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2"
                title="Effacer les commandes terminées"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-gray-400">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['preparing', 'ready', 'completed'] as const).map((status) => (
            <div key={status} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <h2 className="text-xl font-bold">{STATUS_LABELS[status]}</h2>
                  <span className="bg-gray-200 px-2 py-1 rounded-full text-sm ml-auto">
                    {sortedOrders.filter(order => order.status === status).length}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {sortedOrders
                  .filter(order => order.status === status)
                  .map(order => (
                    <div 
                      key={order.id} 
                      className={`bg-white rounded-lg border-2 ${
                        status === 'preparing' ? 'border-blue-500' :
                        status === 'ready' ? 'border-green-500' :
                        'border-gray-200'
                      } p-4 space-y-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            {order.table}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                              order.orderType === 'takeaway' 
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {order.orderType === 'takeaway' ? (
                                <>
                                  <TakeoutDining className="w-4 h-4" />
                                  À emporter
                                </>
                              ) : (
                                <>
                                  <UtensilsCrossed className="w-4 h-4" />
                                  Sur place
                                </>
                              )}
                            </span>
                            {order.customerName && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{order.customerName}</span>
                              </>
                            )}
                          </h3>
                          {order.customerPhone && (
                            <div className="flex items-center gap-2 mt-1 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{order.customerPhone}</span>
                            </div>
                          )}
                          {order.customerEmail && (
                            <div className="flex items-center gap-2 mt-1 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{order.customerEmail}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4" />
                              <span className={status === 'preparing' ? getTimeColor(order.createdAt) : 'text-gray-500'}>
                                {getTimeElapsed(order.createdAt, status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.paymentMethod === 'stripe' ? (
                                <CreditCard className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Wallet className="w-4 h-4 text-green-500" />
                              )}
                              <span className="font-bold">{order.total?.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                        {status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(
                              order.id,
                              status === 'preparing' ? 'ready' : 'completed'
                            )}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${
                              status === 'preparing'
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {status === 'preparing' ? 'Marquer comme prêt' : 'Terminer'}
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                              {item.quantity}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.product.name}</h4>
                              <p className="text-sm text-gray-600">{item.product.description}</p>
                              {item.comment && (
                                <div className="flex items-center gap-2 mt-2">
                                  <MessageSquare className="w-4 h-4 text-red-500" />
                                  <p className="text-sm font-bold text-red-500">{item.comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {sortedOrders.filter(order => order.status === status).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune commande
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}