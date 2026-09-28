import prisma from '../prisma.js';

export const submitQuotation = async (req, res) => {
  try {
    const { poolId, pricePerUnit, totalEstimate, terms, availability } = req.body;

    if (!poolId || !pricePerUnit) {
      return res.status(400).json({ success: false, message: 'poolId and pricePerUnit are required' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(403).json({ success: false, message: 'User is not a registered vendor' });
    }

    if (vendor.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({ success: false, message: 'Vendor account must be verified by Super Admin before submitting quotes' });
    }

    const pool = await prisma.servicePool.findUnique({
      where: { id: poolId },
      include: { requests: true }
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Demand pool not found' });
    }

    const calculatedTotal = totalEstimate || (parseFloat(pricePerUnit) * pool.requests.length);

    // Upsert quotation
    const existingQuote = await prisma.quotation.findFirst({
      where: { poolId, vendorId: vendor.id }
    });

    let quotation;
    if (existingQuote) {
      quotation = await prisma.quotation.update({
        where: { id: existingQuote.id },
        data: {
          pricePerUnit: parseFloat(pricePerUnit),
          totalEstimate: parseFloat(calculatedTotal),
          terms,
          availability,
          submittedAt: new Date()
        }
      });
    } else {
      quotation = await prisma.quotation.create({
        data: {
          poolId,
          vendorId: vendor.id,
          pricePerUnit: parseFloat(pricePerUnit),
          totalEstimate: parseFloat(calculatedTotal),
          terms,
          availability
        }
      });
    }

    // Update invitation status if exists
    await prisma.vendorInvitation.updateMany({
      where: { poolId, vendorId: vendor.id },
      data: { status: 'QUOTED' }
    });

    res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully!',
      quotation
    });
  } catch (error) {
    console.error('Submit quotation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const getQuotationsForPool = async (req, res) => {
  try {
    const { poolId } = req.params;
    const quotations = await prisma.quotation.findMany({
      where: { poolId },
      include: {
        vendor: {
          include: {
            user: { select: { name: true, email: true, phone: true } }
          }
        }
      },
      orderBy: { pricePerUnit: 'asc' }
    });

    res.json({ success: true, quotations });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
