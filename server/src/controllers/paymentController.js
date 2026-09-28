import prisma from '../prisma.js';

export const createPayment = async (req, res) => {
  try {
    const { residentId, amount, month, status = 'PAID', receiptUrl } = req.body;
    const targetResidentId = residentId || req.user.id;
    const targetSocietyId = req.user.societyId;

    if (!targetSocietyId) {
      return res.status(400).json({ success: false, message: 'Society affiliation required' });
    }

    const resident = await prisma.user.findUnique({ where: { id: targetResidentId } });
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const generatedReceipt = receiptUrl || `REC-${Date.now().toString().slice(-6)}-${resident.flatNumber || 'FLAT'}`;

    const payment = await prisma.payment.create({
      data: {
        residentId: targetResidentId,
        societyId: targetSocietyId,
        amount: parseFloat(amount),
        month: month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        status,
        paymentDate: status === 'PAID' ? new Date() : null,
        receiptUrl: generatedReceipt
      },
      include: {
        resident: { select: { name: true, flatNumber: true, email: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Payment record created successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listPayments = async (req, res) => {
  try {
    const { residentId, societyId, status, month } = req.query;
    const filter = {};

    if (req.user.role === 'RESIDENT') {
      filter.residentId = req.user.id;
    } else if (req.user.role === 'ADMIN') {
      filter.societyId = req.user.societyId;
      if (residentId) filter.residentId = residentId;
    } else if (societyId) {
      filter.societyId = societyId;
    }

    if (status) {
      filter.status = status;
    }

    if (month) {
      filter.month = month;
    }

    const payments = await prisma.payment.findMany({
      where: filter,
      include: {
        resident: { select: { id: true, name: true, flatNumber: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Summary statistics
    const totalCollected = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      payments,
      summary: {
        totalCollected,
        totalPending,
        totalRecords: payments.length
      }
    });
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        paymentDate: status === 'PAID' ? new Date() : null,
        receiptUrl: status === 'PAID' ? `REC-${Date.now().toString().slice(-6)}` : null
      },
      include: { resident: true }
    });

    res.json({ success: true, message: `Payment marked as ${status}`, payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
