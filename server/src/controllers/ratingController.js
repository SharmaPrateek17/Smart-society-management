import prisma from '../prisma.js';

export const submitRating = async (req, res) => {
  try {
    const { serviceRequestId, rating, comment } = req.body;
    const residentId = req.user.id;

    if (!serviceRequestId || !rating) {
      return res.status(400).json({ success: false, message: 'serviceRequestId and rating (1-5) are required' });
    }

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        pool: {
          include: {
            vendorSelection: true
          }
        }
      }
    });

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (serviceRequest.residentId !== residentId) {
      return res.status(403).json({ success: false, message: 'Can only rate requests raised by yourself' });
    }

    const vendorId = serviceRequest.pool?.vendorSelection?.selectedVendorId;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'No selected vendor found for this service request' });
    }

    // Upsert rating
    const createdRating = await prisma.rating.upsert({
      where: { serviceRequestId },
      update: {
        rating: parseInt(rating),
        comment
      },
      create: {
        serviceRequestId,
        vendorId,
        residentId,
        rating: parseInt(rating),
        comment
      }
    });

    // Update request status to RATED
    await prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: 'RATED' }
    });

    // Recalculate vendor average rating
    const allVendorRatings = await prisma.rating.findMany({
      where: { vendorId }
    });

    const totalStars = allVendorRatings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalStars / allVendorRatings.length).toFixed(2));

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        avgRating,
        totalRatingsCount: allVendorRatings.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully! Thank you for your feedback.',
      rating: createdRating,
      vendorAvgRating: avgRating
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getVendorRatings = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const ratings = await prisma.rating.findMany({
      where: { vendorId },
      include: {
        resident: { select: { name: true, flatNumber: true } },
        serviceRequest: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, ratings });
  } catch (error) {
    console.error('Get vendor ratings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
