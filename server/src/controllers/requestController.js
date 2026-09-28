import prisma from '../prisma.js';

export const createRequest = async (req, res) => {
  try {
    const { categoryId, description, preferredDate, urgency = 'NORMAL', individualOnly = false } = req.body;
    const residentId = req.user.id;
    const societyId = req.user.societyId;

    if (!societyId) {
      return res.status(400).json({ success: false, message: 'User must belong to a society to raise service requests' });
    }

    if (!categoryId || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    let poolId = null;
    let initialStatus = 'RAISED';

    // Demand Aggregation Engine logic:
    // If not strictly individual/urgent, check for an existing open/quoting pool or auto-create a cycle
    if (!individualOnly && urgency !== 'URGENT') {
      let activePool = await prisma.servicePool.findFirst({
        where: {
          societyId,
          categoryId,
          status: { in: ['OPEN', 'QUOTING'] }
        }
      });

      if (!activePool) {
        // Create new weekly demand aggregation cycle
        const cycleStart = new Date();
        const cycleEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days window

        activePool = await prisma.servicePool.create({
          data: {
            societyId,
            categoryId,
            status: 'OPEN',
            cycleStart,
            cycleEnd
          }
        });
      }

      poolId = activePool.id;
      initialStatus = 'POOLED';
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        residentId,
        societyId,
        categoryId,
        description,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        urgency,
        status: initialStatus,
        poolId
      },
      include: {
        category: true,
        pool: true,
        resident: { select: { id: true, name: true, flatNumber: true, phone: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: poolId ? 'Request raised and successfully added to society demand pool!' : 'Individual service request raised.',
      request: serviceRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const listRequests = async (req, res) => {
  try {
    const { societyId, status, categoryId, residentOnly } = req.query;
    const filter = {};

    if (req.user.role === 'RESIDENT' || residentOnly === 'true') {
      filter.residentId = req.user.id;
    } else if (req.user.role === 'ADMIN') {
      filter.societyId = req.user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }

    if (status) {
      filter.status = status;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const requests = await prisma.serviceRequest.findMany({
      where: filter,
      include: {
        category: true,
        pool: {
          include: {
            vendorSelection: {
              include: {
                selectedVendor: true
              }
            }
          }
        },
        resident: { select: { id: true, name: true, flatNumber: true, phone: true, email: true } },
        rating: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('List requests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        category: true,
        pool: {
          include: {
            quotations: { include: { vendor: true } },
            vendorSelection: { include: { selectedVendor: true } }
          }
        },
        resident: { select: { id: true, name: true, flatNumber: true, phone: true, email: true } },
        rating: true
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['RAISED', 'POOLED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status },
      include: { category: true, resident: true }
    });

    res.json({ success: true, message: `Request status updated to ${status}`, request: updated });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
