export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  shortDescription: string;
  stock: number;
  categories: string[];
  specs: ProductSpecs;
  rating: number;
  reviewCount: number;
  tags: string[];
  weight: number; // grams
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecs {
  caseSize: string;
  caseMaterial: string;
  strapMaterial: string;
  movement: string;
  waterResistance: string;
  crystalType: string;
  warranty: string;
}

export interface CartItem {
  sku: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingInfo {
  address: Address;
  method: string;
}

export interface OrderItem {
  sku: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Order {
  orderId: string;
  cartId: string;
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  customer: CustomerInfo;
  shipping: ShippingInfo;
  pricing: PricingBreakdown;
  payment: {
    method: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnRequest {
  returnId: string;
  orderId: string;
  items: Array<{
    sku: string;
    quantity: number;
    reason: string;
  }>;
  customerNotes?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  estimatedDays: string;
}

export interface ShippingRateConfig {
  base: number;
  perKg: number;
  days: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  applicableBrands?: string[];
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  brand?: string[];
  category?: string[];
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  tags?: string[];
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
