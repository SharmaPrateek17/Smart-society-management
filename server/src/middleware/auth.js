import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'smart_society_secret_jwt_key_2026_super_secure';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        society: true,
        vendorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized for this resource. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
