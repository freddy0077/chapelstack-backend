export enum Permission {
  // User & Role management
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  VIEW_ROLES = 'VIEW_ROLES',

  // Branch management
  MANAGE_BRANCHES = 'MANAGE_BRANCHES',
  VIEW_BRANCHES = 'VIEW_BRANCHES',

  // Member management
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  VIEW_MEMBERS = 'VIEW_MEMBERS',

  // Financial permissions
  MANAGE_FINANCES = 'MANAGE_FINANCES',
  VIEW_FINANCES = 'VIEW_FINANCES',

  // Attendance permissions
  MANAGE_ATTENDANCE = 'MANAGE_ATTENDANCE',
  VIEW_ATTENDANCE = 'VIEW_ATTENDANCE',

  // Form permissions
  MANAGE_FORMS = 'MANAGE_FORMS',
  VIEW_FORMS = 'VIEW_FORMS',
  SUBMIT_FORMS = 'SUBMIT_FORMS',

  // Report permissions
  MANAGE_REPORTS = 'MANAGE_REPORTS',
  VIEW_REPORTS = 'VIEW_REPORTS',

  // Content management
  MANAGE_CONTENT = 'MANAGE_CONTENT',
  VIEW_CONTENT = 'VIEW_CONTENT',

  // System settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  VIEW_SETTINGS = 'VIEW_SETTINGS',

  // Communication permissions
  MANAGE_COMMUNICATIONS = 'MANAGE_COMMUNICATIONS',
  VIEW_COMMUNICATIONS = 'VIEW_COMMUNICATIONS',

  // Subscription management permissions
  MANAGE_ORGANIZATION_SUBSCRIPTIONS = 'MANAGE_ORGANIZATION_SUBSCRIPTIONS',
  VIEW_SUBSCRIPTION_ANALYTICS = 'VIEW_SUBSCRIPTION_ANALYTICS',
  ENABLE_DISABLE_ORGANIZATIONS = 'ENABLE_DISABLE_ORGANIZATIONS',
  MANAGE_SUBSCRIPTION_PLANS = 'MANAGE_SUBSCRIPTION_PLANS',
  VIEW_SUBSCRIPTION_PAYMENTS = 'VIEW_SUBSCRIPTION_PAYMENTS',
  HANDLE_SUBSCRIPTION_DISPUTES = 'HANDLE_SUBSCRIPTION_DISPUTES',
}
