import { CartItem, ApiResponse } from '@pos/types';
/**
 * Format number into Indonesian Rupiah currency format
 */
export declare function formatCurrency(amount: number): string;
/**
 * Format ISO Date string to readable localized date string
 */
export declare function formatDate(dateString: string | Date): string;
/**
 * Calculate cart totals: subtotal, tax, discount, total
 */
export declare function calculateCartTotals(items: CartItem[], taxRate?: number, // 11% PPN standard
discountAmount?: number): {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
};
/**
 * Build standard API paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): ApiResponse<T[]>;
/**
 * Build standard API single response
 */
export declare function createResponse<T>(data: T): ApiResponse<T>;
