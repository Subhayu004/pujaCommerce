export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Puja {
  id: string;
  name: string;
  slug: string;
  deity: string;
  short_description: string;
  description: string;
  price_paise: number;
  duration_mins: number;
  image: string;
  required_materials: string;
  booking_requirements: string;
  is_active: number;
  featured: number;
}

export interface Pujari {
  id: string;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  experience_years: number;
  specializations: string;
  languages: string;
  service_areas: string;
  phone?: string;
  email?: string;
  is_active: number;
  rating: number;
  review_count: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_paise: number;
  image: string;
  category: string;
  stock: number;
  is_active: number;
  featured: number;
}

export interface CartItem {
  id: string;
  item_type: 'puja' | 'product';
  puja_id?: string;
  product_id?: string;
  name: string;
  price_paise: number;
  quantity: number;
  image: string;
  item_total_paise: number;
  in_stock: boolean;
  scheduled_date?: string;
  scheduled_time?: string;
  pujari_id?: string;
  pujari_name?: string;
  preferred_language?: string;
  service_location?: string;
  additional_notes?: string;
}

export interface CartData {
  items: CartItem[];
  item_count: number;
  subtotal_paise: number;
  delivery_paise: number;
  tax_paise: number;
  discount_paise: number;
  total_paise: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'puja' | 'product';
  puja_id?: string;
  product_id?: string;
  item_name: string;
  price_paise: number;
  quantity: number;
  scheduled_date?: string;
  scheduled_time?: string;
  pujari_id?: string;
  pujari_name?: string;
  preferred_language?: string;
  service_location?: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  customer_notes?: string;
  subtotal_paise: number;
  tax_paise: number;
  delivery_paise: number;
  discount_paise: number;
  total_paise: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_id?: string;
  razorpay_order_id?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface AdminMetrics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_orders: number;
  verified_revenue_paise: number;
}
