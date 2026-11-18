// Single source of truth for Simple Mode role decisions.
//
// The SPA role values (User.role) are: admin | manager | supervisor | finance,
// plus the legacy `owner` value still selectable in UserForm. The role mismatch
// fix (owner must get Manager-level access) is implemented here once and reused
// by DefaultLayout, QuickActions, ShiftDayView and the landing router, instead
// of every gate growing its own copy of the list.

export const MANAGER_LEVEL_ROLES = ['admin', 'manager', 'owner', 'finance']

/**
 * Manager-level users (admin, owner, manager, finance, or Frappe is_staff).
 * These roles keep the old UI as "Manager Mode" and may create deliveries
 * (Delivery DocType: CRUD for manager-level, read-only for supervisor).
 */
export function isManagerLevel(user) {
  if (!user) return false
  if (user.is_staff) return true
  return MANAGER_LEVEL_ROLES.includes(user.role)
}

/**
 * Roles that may close the day / create the daily Reconciliation.
 * Mirrors the auth store's canCloseDay getter.
 */
export function canCloseDay(user) {
  if (!user) return false
  if (user.is_staff) return true
  return ['admin', 'manager', 'owner', 'finance'].includes(user.role)
}

/**
 * Which home screen a user lands on after login.
 * admin / manager / owner / finance -> Manager Mode (existing dashboard).
 * everyone else (supervisor, future operator roles) -> Simple Mode.
 */
export function landingPath(user) {
  return isManagerLevel(user) ? '/' : '/simple'
}

/**
 * Generic role gate, mirroring DefaultLayout's sidebar `can()`: `roles` omitted
 * = everyone; admin (and Frappe is_staff) sees everything; `owner` counts as
 * manager-level. Reused by the hub screens so they share one definition of
 * "who may see this" instead of each one re-typing the list.
 */
export function canSee(user, roles) {
  if (!roles) return true
  if (!user) return false
  if (user.is_staff) return true
  if (roles.includes(user.role)) return true
  return user.role === 'owner' && roles.includes('manager')
}
