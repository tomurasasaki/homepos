"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.calculateCartTotals = calculateCartTotals;
exports.createPaginatedResponse = createPaginatedResponse;
exports.createResponse = createResponse;
/**
 * Format number into Indonesian Rupiah currency format
 */
function formatCurrency(amount) {
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
function formatDate(dateString) {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}
/**
 * Calculate cart totals: subtotal, tax, discount, total
 */
function calculateCartTotals(items, taxRate = 0.11, // 11% PPN standard
discountAmount = 0) {
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
function createPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const meta = {
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
function createResponse(data) {
    return {
        data,
    };
}
