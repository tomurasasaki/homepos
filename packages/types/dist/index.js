"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalType = exports.AuditAction = exports.StockTransferStatus = exports.PaymentMethod = exports.TransactionStatus = exports.Role = void 0;
// RBAC Levels & Roles
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["STAFF"] = "STAFF";
    Role["KASIR"] = "KASIR";
})(Role || (exports.Role = Role = {}));
// Transaction Enums
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["DRAFT"] = "DRAFT";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PAID"] = "PAID";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["QRIS"] = "QRIS";
    PaymentMethod["DEBIT"] = "DEBIT";
    PaymentMethod["CREDIT"] = "CREDIT";
    PaymentMethod["TRANSFER"] = "TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var StockTransferStatus;
(function (StockTransferStatus) {
    StockTransferStatus["PENDING"] = "PENDING";
    StockTransferStatus["APPROVED"] = "APPROVED";
    StockTransferStatus["REJECTED"] = "REJECTED";
    StockTransferStatus["COMPLETED"] = "COMPLETED";
})(StockTransferStatus || (exports.StockTransferStatus = StockTransferStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var JournalType;
(function (JournalType) {
    JournalType["INCOME"] = "INCOME";
    JournalType["EXPENSE"] = "EXPENSE";
    JournalType["TRANSFER"] = "TRANSFER";
})(JournalType || (exports.JournalType = JournalType = {}));
