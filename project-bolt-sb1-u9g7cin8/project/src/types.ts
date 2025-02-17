export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  outOfStock?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  description: string;
  products: Product[];
}

export interface CartItem {
  id: string; // Identifiant unique pour chaque ligne du panier
  productId: string;
  brandId: string;
  quantity: number;
  product: Product;
  comment?: string;
}

export type OrderType = 'takeaway' | 'dine-in';
export type PaymentMethod = 'stripe' | 'counter';

export interface Order {
  id: string;
  items: CartItem[];
  status: 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  table?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderType?: OrderType;
  paymentMethod?: PaymentMethod;
  total?: number;
  subtotal?: number;
  discount?: number;
  paid?: boolean;
}