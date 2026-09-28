import prisma from '../prisma.js';

export const createNotice = async (req, res) => {
  try {
    const { title, content, category = 'GENERAL' } = req.body;
    const postedBy = req.user.id;
    const societyId = req.user.societyId;

    if (!societyId) {
      return res.status(400).json({ success: false, message: 'Admin must be linked to a society to post notices' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const notice = await prisma.notice.create({
      data: {
        societyId,
        postedBy,
        title,
        content,
        category
      },
      include: {
        admin: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Notice published successfully', notice });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listNotices = async (req, res) => {
  try {
    const { societyId, category } = req.query;
    const targetSocietyId = societyId || req.user?.societyId;

    if (!targetSocietyId) {
      return res.status(400).json({ success: false, message: 'societyId required' });
    }

    const filter = { societyId: targetSocietyId };
    if (category) {
      filter.category = category;
    }

    const notices = await prisma.notice.findMany({
      where: filter,
      include: {
        admin: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, notices });
  } catch (error) {
    console.error('List notices error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
