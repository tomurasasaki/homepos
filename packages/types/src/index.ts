// RBAC Levels & Roles
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  KASIR = 'KASIR',
}

// Transaction Enums
export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS = 'QRIS',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  TRANSFER = 'TRANSFER',
}

export enum StockTransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum JournalType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

// Standard API Response Interfaces
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// Auth Types
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenant_id: string;
  branch_id?: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    tenant_id: string;
    branch_id?: string;
  };
}

// Model Interfaces
export interface TenantDto {
  id: string;
  name: string;
  subdomain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDto {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: Role;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface BranchDto {
  id: string;
  tenant_id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface CategoryDto {
  id: string;
  tenant_id: string;
  name: string;
}

export interface ProductDto {
  id: string;
  tenant_id: string;
  category_id?: string;
  sku: string;
  name: string;
  price: number;
  cost_price: number;
  stock: number;
  is_active: boolean;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionDto {
  id: string;
  tenant_id: string;
  branch_id: string;
  user_id: string;
  shift_id: string;
  member_id?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid_amount: number;
  change: number;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  created_at: string;
  items: CartItem[];
}

export interface StockTransferDto {
  id: string;
  tenant_id: string;
  from_branch_id: string;
  to_branch_id: string;
  product_id: string;
  quantity: number;
  status: StockTransferStatus;
  notes?: string;
  created_at: string;
}

export interface ShiftDto {
  id: string;
  tenant_id: string;
  branch_id: string;
  user_id: string;
  start_cash: number;
  end_cash?: number;
  actual_cash?: number;
  difference?: number;
  start_time: string;
  end_time?: string;
}

export interface MemberDto {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  points: number;
  tier: string;
}

export interface AuditEventDto {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: AuditAction;
  entity: string;
  entity_id?: string;
  payload?: any;
  ip_address?: string;
  created_at: string;
}
