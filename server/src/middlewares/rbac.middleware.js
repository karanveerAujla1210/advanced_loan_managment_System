const permissions = {
  ADMIN: ['*'], // Full access
  MANAGER: [
    'borrowers:read', 'borrowers:write', 'borrowers:delete',
    'loans:read', 'loans:write', 'loans:approve', 'loans:disburse',
    'payments:read', 'payments:write',
    'reports:read', 'reports:export',
    'users:read', 'branches:read'
  ],
  COUNSELLOR: [
    'leads:read', 'leads:write', 'leads:convert',
    'borrowers:read', 'borrowers:write',
    'loans:read', 'loans:write'
  ],
  ADVISOR: [
    'loans:read', 'loans:write', 'loans:approve',
    'borrowers:read',
    'reports:read'
  ],
  OPERATION: [
    'loans:read', 'loans:disburse',
    'disbursements:read', 'disbursements:write',
    'borrowers:read'
  ],
  COLLECTION: [
    'loans:read', 'payments:read', 'payments:write',
    'borrowers:read', 'borrowers:contact',
    'collections:read', 'collections:write'
  ],
  LEGAL: [
    'loans:read', 'legal-cases:read', 'legal-cases:write',
    'borrowers:read', 'borrowers:contact'
  ]
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = permissions[userRole] || [];
    
    // Admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }

    // Check specific permission
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient permissions',
      required: requiredPermission,
      userRole 
    });
  };
};

module.exports = { checkPermission, permissions };