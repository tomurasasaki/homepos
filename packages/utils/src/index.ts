import { CartItem, PaginationMeta, ApiResponse } from '@pos/types';

/**
 * Format number into Indonesian Rupiah currency format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO Date string to readable localized date string
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Calculate cart totals: subtotal, tax, discount, total
 */
export function calculateCartTotals(
  items: CartItem[],
  taxRate: number = 0.11, // 11% PPN standard
  discountAmount: number = 0
): { subtotal: number; tax: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * taxRate);
  const total = taxableAmount + tax;

  return { subtotal, tax, discount, total };
}

/**
 * Build standard API paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<T[]> {
  const totalPages = Math.ceil(total / limit);
  const meta: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
  };

  return {
    data,
    meta,
  };
}

/**
 * Build standard API single response
 */
export function createResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
  };
}
