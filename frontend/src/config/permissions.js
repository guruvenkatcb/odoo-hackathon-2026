export const ROLES = {
  FLEET_MANAGER: 'fleet_manager',
  DRIVER: 'driver',
  SAFETY_MANAGER: 'safety_manager',
  FINANCIAL_ANALYST: 'financial_analyst',
}

// Which roles can access each route
export const ROUTE_PERMISSIONS = {
  '/': [ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.SAFETY_MANAGER, ROLES.FINANCIAL_ANALYST],
  '/vehicles': [ROLES.FLEET_MANAGER],
  '/drivers': [ROLES.FLEET_MANAGER, ROLES.SAFETY_MANAGER],
  '/trips': [ROLES.FLEET_MANAGER, ROLES.DRIVER],
  '/maintenance': [ROLES.FLEET_MANAGER, ROLES.SAFETY_MANAGER],
  '/fuel-expenses': [ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
  '/reports': [ROLES.FLEET_MANAGER, ROLES.SAFETY_MANAGER, ROLES.FINANCIAL_ANALYST],
}

export function canAccessRoute(role, path) {
  const allowed = ROUTE_PERMISSIONS[path]
  if (!allowed) return true
  return allowed.includes(role)
}

// Which Quick Action buttons each role sees on the Dashboard
export const QUICK_ACTIONS = {
  [ROLES.FLEET_MANAGER]: ['vehicle', 'driver', 'dispatch', 'expense'],
  [ROLES.DRIVER]: ['dispatch'],
  [ROLES.SAFETY_MANAGER]: ['driver'],
  [ROLES.FINANCIAL_ANALYST]: ['expense'],
}