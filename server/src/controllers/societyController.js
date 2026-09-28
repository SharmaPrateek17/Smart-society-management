import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';

export const listSocieties = async (req, res) => {
  try {
    const societies = await prisma.society.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true, phone: true } },
        _count: {
          select: {
            members: true,
            serviceRequests: true,
            servicePools: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, societies });
  } catch (error) {
    console.error('List societies error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const society = await prisma.society.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, name: true, email: true, phone: true } },
        members: {
          select: { id: true, name: true, email: true, phone: true, flatNumber: true, role: true },
          orderBy: { flatNumber: 'asc' }
        },
        servicePools: {
          include: {
            category: true,
            _count: { select: { requests: true, quotations: true } }
          }
        },
        _count: {
          select: {
            members: true,
            serviceRequests: true,
            complaints: true,
            notices: true
          }
        }
      }
    });

    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    res.json({ success: true, society });
  } catch (error) {
    console.error('Get society error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createSociety = async (req, res) => {
  try {
    const { name, address, city, totalFlats, adminName, adminEmail, adminPhone, adminPassword } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({ success: false, message: 'Name, address, and city are required' });
    }

    let adminId = null;

    if (adminEmail && adminPassword) {
      const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Admin user email already registered' });
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await prisma.user.create({
        data: {
          name: adminName || `${name} Admin`,
          email: adminEmail,
          passwordHash,
          phone: adminPhone || null,
          role: 'ADMIN'
        }
      });
      adminId = newAdmin.id;
    }

    const society = await prisma.society.create({
      data: {
        name,
        address,
        city,
        totalFlats: Number(totalFlats) || 50,
        adminId
      },
      include: { admin: true }
    });

    if (adminId) {
      await prisma.user.update({
        where: { id: adminId },
        data: { societyId: society.id }
      });
    }

    res.status(201).json({ success: true, message: 'Society onboarded successfully', society });
  } catch (error) {
    console.error('Create society error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const inviteResident = async (req, res) => {
  try {
    const { id } = req.params; // societyId
    const { name, email, flatNumber, phone, temporaryPassword } = req.body;

    if (!name || !email || !flatNumber) {
      return res.status(400).json({ success: false, message: 'Name, email, and flatNumber are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Resident with this email is already registered' });
    }

    const passwordHash = await bcrypt.hash(temporaryPassword || 'welcome123', 10);

    const resident = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: 'RESIDENT',
        societyId: id,
        flatNumber
      }
    });

    res.status(201).json({
      success: true,
      message: `Resident mapped to Flat ${flatNumber} successfully`,
      resident: {
        id: resident.id,
        name: resident.name,
        email: resident.email,
        flatNumber: resident.flatNumber,
        societyId: resident.societyId
      }
    });
  } catch (error) {
    console.error('Invite resident error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
