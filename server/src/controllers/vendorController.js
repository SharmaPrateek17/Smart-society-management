import prisma from '../prisma.js';

export const listVendors = async (req, res) => {
  try {
    const { status, service } = req.query;
    const filter = {};

    if (status) {
      filter.verificationStatus = status;
    }

    const vendors = await prisma.vendor.findMany({
      where: filter,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: {
          select: { quotations: true, selections: true, ratings: true }
        }
      },
      orderBy: { avgRating: 'desc' }
    });

    let filtered = vendors;
    if (service) {
      filtered = vendors.filter((v) => v.servicesOffered.toLowerCase().includes(service.toLowerCase()));
    }

    res.json({ success: true, vendors: filtered });
  } catch (error) {
    console.error('List vendors error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        ratings: {
          include: {
            resident: { select: { name: true, flatNumber: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { invitations: true, quotations: true, selections: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const { businessName, servicesOffered, serviceArea } = req.body;
    const vendor = await prisma.vendor.update({
      where: { userId: req.user.id },
      data: {
        businessName,
        servicesOffered,
        serviceArea
      }
    });

    res.json({ success: true, message: 'Profile updated successfully', vendor });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const invitations = await prisma.vendorInvitation.findMany({
      where: { vendorId: vendor.id },
      include: {
        pool: {
          include: {
            category: true,
            society: true,
            _count: { select: { requests: true } },
            quotations: {
              where: { vendorId: vendor.id }
            },
            vendorSelection: true
          }
        }
      },
      orderBy: { invitedAt: 'desc' }
    });

    res.json({ success: true, invitations });
  } catch (error) {
    console.error('Get vendor invitations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyAssignedJobs = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const selections = await prisma.poolVendorSelection.findMany({
      where: { selectedVendorId: vendor.id },
      include: {
        pool: {
          include: {
            category: true,
            society: true,
            requests: {
              include: {
                resident: { select: { name: true, flatNumber: true, phone: true } },
                rating: true
              }
            },
            quotations: {
              where: { vendorId: vendor.id }
            }
          }
        }
      },
      orderBy: { selectedAt: 'desc' }
    });

    res.json({ success: true, jobs: selections });
  } catch (error) {
    console.error('Get vendor assigned jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const { id } = req.params; // vendorId
    const { status } = req.body; // VERIFIED, REJECTED, PENDING

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { verificationStatus: status }
    });

    res.json({ success: true, message: `Vendor verification set to ${status}`, vendor });
  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
