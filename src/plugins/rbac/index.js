/**
 * 中文：RBAC 策略插件；提供角色与资源可见性判断
 * English: RBAC strategy plugin; provides role/resource visibility checks
 */
export const Roles = { admin: 'admin', merchant: 'merchant', cs: 'cs', adv: 'adv' }

export function canViewOrders(role) { return !!role }
export function canViewMerchantColumn(role) { return role === Roles.admin || role === Roles.merchant }
export function canViewCSColumn(role) { return role === Roles.admin || role === Roles.merchant || role === Roles.cs }
export function canViewAdvColumn(role) { return role === Roles.admin || role === Roles.merchant || role === Roles.adv }

