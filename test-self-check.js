const assert = require('assert');

// 1. Test Currency Formatter & Cart Calculations
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateCartTotals(items, taxRate = 0.11, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * taxRate);
  const total = taxableAmount + tax;
  return { subtotal, tax, discount, total };
}

console.log('--- RUNNING POS SELF-CHECKS ---');

// Test 1: Cart Calculation with 11% Tax
const items = [
  { product_id: 'p1', product_name: 'Espresso', price: 20000, quantity: 2, subtotal: 40000 },
  { product_id: 'p2', product_name: 'Croissant', price: 25000, quantity: 1, subtotal: 25000 },
];
const totals = calculateCartTotals(items, 0.11, 5000);
assert.strictEqual(totals.subtotal, 65000, 'Subtotal should be 65,000');
assert.strictEqual(totals.discount, 5000, 'Discount should be 5,000');
assert.strictEqual(totals.tax, 6600, 'Tax (11% of 60,000) should be 6,600');
assert.strictEqual(totals.total, 66600, 'Total should be 66,600');
console.log('✓ Cart & Tax calculations verified');

// Test 2: RBAC Role Hierarchy
const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  KASIR: 'KASIR',
};

function isAuthorized(userRole, allowedRoles) {
  if (userRole === Role.SUPER_ADMIN) return true;
  return allowedRoles.includes(userRole);
}

assert.strictEqual(isAuthorized(Role.SUPER_ADMIN, [Role.KASIR]), true, 'SuperAdmin can access any endpoint');
assert.strictEqual(isAuthorized(Role.KASIR, [Role.MANAGER]), false, 'Kasir cannot access Manager endpoint');
assert.strictEqual(isAuthorized(Role.STAFF, [Role.STAFF, Role.MANAGER]), true, 'Staff can access Staff endpoint');
console.log('✓ RBAC hierarchy verified');

// Test 3: Multi-Tenant Row Isolation Simulation
const mockDb = [
  { id: '1', tenant_id: 'tenant-A', name: 'Coffee Cup' },
  { id: '2', tenant_id: 'tenant-B', name: 'Tea Cup' },
];

function findTenantProducts(db, tenantId) {
  return db.filter((row) => row.tenant_id === tenantId);
}

const tenantAProducts = findTenantProducts(mockDb, 'tenant-A');
assert.strictEqual(tenantAProducts.length, 1);
assert.strictEqual(tenantAProducts[0].name, 'Coffee Cup');
assert.strictEqual(findTenantProducts(mockDb, 'tenant-B').length, 1);
console.log('✓ Multi-tenant row isolation verified');

console.log('--- ALL SELF-CHECKS PASSED ---');
