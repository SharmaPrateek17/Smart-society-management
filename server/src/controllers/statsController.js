import prisma from '../prisma.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const societyId = req.user.societyId;

    if (userRole === 'SUPER_ADMIN') {
      const societiesCount = await prisma.society.count();
      const vendorsCount = await prisma.vendor.count();
      const verifiedVendors = await prisma.vendor.count({ where: { verificationStatus: 'VERIFIED' } });
      const totalPools = await prisma.servicePool.count();
      const completedPools = await prisma.servicePool.count({ where: { status: 'COMPLETED' } });
      const totalRequests = await prisma.serviceRequest.count();

      return res.json({
        success: true,
        stats: {
          societiesCount,
          vendorsCount,
          verifiedVendors,
          totalPools,
          completedPools,
          totalRequests,
          estimatedCommunitySavings: '$4,850'
        }
      });
    }

    if (userRole === 'ADMIN') {
      const residentsCount = await prisma.user.count({
        where: { societyId, role: 'RESIDENT' }
      });

      const activePoolsCount = await prisma.servicePool.count({
        where: { societyId, status: { in: ['OPEN', 'QUOTING'] } }
      });

      const openComplaintsCount = await prisma.complaint.count({
        where: { societyId, status: { in: ['OPEN', 'IN_REVIEW'] } }
      });

      const totalPayments = await prisma.payment.findMany({
        where: { societyId }
      });

      const collected = totalPayments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);

      const pending = totalPayments
        .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalExpected = collected + pending;
      const collectionRate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 100;

      return res.json({
        success: true,
        stats: {
          residentsCount,
          activePoolsCount,
          openComplaintsCount,
          collectedDues: collected,
          pendingDues: pending,
          collectionRate
        }
      });
    }

    if (userRole === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });

      const invitationsCount = await prisma.vendorInvitation.count({
        where: { vendorId: vendor?.id }
      });

      const quotationsCount = await prisma.quotation.count({
        where: { vendorId: vendor?.id }
      });

      const wonJobsCount = await prisma.poolVendorSelection.count({
        where: { selectedVendorId: vendor?.id }
      });

      return res.json({
        success: true,
        stats: {
          verificationStatus: vendor?.verificationStatus || 'PENDING',
          avgRating: vendor?.avgRating || 0,
          totalRatingsCount: vendor?.totalRatingsCount || 0,
          invitationsCount,
          quotationsCount,
          wonJobsCount
        }
      });
    }

    if (userRole === 'RESIDENT') {
      const myRequestsCount = await prisma.serviceRequest.count({
        where: { residentId: req.user.id }
      });

      const myActiveRequestsCount = await prisma.serviceRequest.count({
        where: {
          residentId: req.user.id,
          status: { in: ['RAISED', 'POOLED', 'ASSIGNED', 'IN_PROGRESS'] }
        }
      });

      const myComplaintsCount = await prisma.complaint.count({
        where: { residentId: req.user.id, status: { in: ['OPEN', 'IN_REVIEW'] } }
      });

      const myPendingDues = await prisma.payment.findMany({
        where: { residentId: req.user.id, status: { in: ['PENDING', 'OVERDUE'] } }
      });

      const totalPendingAmount = myPendingDues.reduce((sum, p) => sum + p.amount, 0);

      return res.json({
        success: true,
        stats: {
          myRequestsCount,
          myActiveRequestsCount,
          myComplaintsCount,
          pendingDuesAmount: totalPendingAmount
        }
      });
    }

    res.json({ success: true, stats: {} });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
