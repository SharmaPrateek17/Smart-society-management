import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { JWT_SECRET } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, societyId, flatNumber, businessName, servicesOffered, serviceArea } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role,
        societyId: role === 'RESIDENT' || role === 'ADMIN' ? societyId : null,
        flatNumber: role === 'RESIDENT' || role === 'ADMIN' ? flatNumber : null
      }
    });

    if (role === 'VENDOR') {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: businessName || `${name} Services`,
          servicesOffered: servicesOffered || 'General Services',
          serviceArea: serviceArea || 'Citywide',
          verificationStatus: 'PENDING'
        }
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { society: true, vendorProfile: true }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        phone: fullUser.phone,
        role: fullUser.role,
        societyId: fullUser.societyId,
        society: fullUser.society,
        flatNumber: fullUser.flatNumber,
        vendorProfile: fullUser.vendorProfile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { society: true, vendorProfile: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        societyId: user.societyId,
        society: user.society,
        flatNumber: user.flatNumber,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { society: true, vendorProfile: true }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        societyId: user.societyId,
        society: user.society,
        flatNumber: user.flatNumber,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDemoAccounts = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        society: { select: { id: true, name: true, city: true } },
        vendorProfile: { select: { id: true, businessName: true, avgRating: true, verificationStatus: true } }
      },
      orderBy: { role: 'asc' }
    });

    const accounts = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      flatNumber: u.flatNumber,
      societyName: u.society?.name || null,
      businessName: u.vendorProfile?.businessName || null,
      verificationStatus: u.vendorProfile?.verificationStatus || null
    }));

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { society: true, vendorProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        societyId: user.societyId,
        society: user.society,
        flatNumber: user.flatNumber,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
