export type UserRole = 'customer' | 'provider' | 'provider_staff' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'pending_verification';
export type TenantStatus = 'active' | 'suspended' | 'cancelled';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  subscription_plan: SubscriptionPlan;
  status: TenantStatus;
  branding_logo?: string;
  branding_primary_color?: string;
  branding_secondary_color?: string;
  settings?: any;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  phone?: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  preferences?: any;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceProvider {
  id: string;
  tenant_id: string;
  user_id: string;
  business_name: string;
  business_name_ar?: string;
  description?: string;
  verification_status: VerificationStatus;
  kyc_documents?: any;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  commission_rate: number;
  is_active: boolean;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  tenant_id: string;
  provider_id: string;
  category_id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  base_price: number;
  currency: string;
  duration_minutes?: number;
  pricing_type: 'fixed' | 'hourly' | 'custom';
  is_active: boolean;
  images?: any;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  tenant_id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  booking_type: 'one_time' | 'recurring' | 'emergency';
  status: BookingStatus;
  scheduled_at: Date;
  completed_at?: Date;
  total_amount: number;
  commission_amount?: number;
  currency: string;
  payment_status: PaymentStatus;
  customer_address?: any;
  notes?: string;
  metadata?: any;
  cancellation_reason?: string;
  cancelled_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  type: string;
  title: string;
  title_ar?: string;
  message: string;
  message_ar?: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}
