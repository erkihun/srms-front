import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-key') {
  console.warn('⚠️  WARNING: Using default JWT secret in production!');
}

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. Please provide a Bearer token.' 
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ message: 'Invalid authorization header.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    
    if (!payload.id || !payload.role) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }

    req.user = {
      id: payload.id,
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
      department_id: payload.department_id ?? null,
      is_active: payload.is_active ?? true
    };

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    return res.status(401).json({ message: 'Authentication failed.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}.` 
      });
    }

    next();
  };
}

export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = jwt.verify(token, JWT_SECRET);
      
      req.user = {
        id: payload.id,
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        department_id: payload.department_id ?? null,
        is_active: payload.is_active ?? true
      };
    }
  } catch (err) {
    console.log('Optional auth failed:', err.message);
  }

  next();
}

export function requireActiveUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.is_active === false) {
    return res.status(403).json({ 
      message: 'Your account has been deactivated. Please contact administrator.' 
    });
  }

  next();
}

export function requireOwnershipOrRole(paramKey = 'id', ...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const resourceId = req.params[paramKey];
    
    if (req.user.id === parseInt(resourceId) || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      message: 'You do not have permission to access this resource.' 
    });
  };
}

export const authenticate = requireAuth;
