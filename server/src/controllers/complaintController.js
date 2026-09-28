import prisma from '../prisma.js';

export const createComplaint = async (req, res) => {
  try {
    const { category, description, attachmentUrl } = req.body;
    const residentId = req.user.id;
    const societyId = req.user.societyId;

    if (!societyId) {
      return res.status(400).json({ success: false, message: 'Must belong to a society to register a complaint' });
    }

    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        residentId,
        societyId,
        category,
        description,
        attachmentUrl: attachmentUrl || null,
        status: 'OPEN'
      },
      include: {
        resident: { select: { id: true, name: true, flatNumber: true, phone: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Complaint registered successfully', complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listComplaints = async (req, res) => {
  try {
    const { status, societyId } = req.query;
    const filter = {};

    if (req.user.role === 'RESIDENT') {
      filter.residentId = req.user.id;
    } else if (req.user.role === 'ADMIN') {
      filter.societyId = req.user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }

    if (status) {
      filter.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where: filter,
      include: {
        resident: { select: { id: true, name: true, flatNumber: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, complaints });
  } catch (error) {
    console.error('List complaints error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null
      },
      include: { resident: true }
    });

    res.json({ success: true, message: `Complaint status updated to ${status}`, complaint });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
