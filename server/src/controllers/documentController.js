import prisma from '../prisma.js';

export const listDocuments = async (req, res) => {
  try {
    const { societyId } = req.query;
    const targetSocietyId = societyId || req.user?.societyId;

    if (!targetSocietyId) {
      return res.status(400).json({ success: false, message: 'societyId required' });
    }

    const documents = await prisma.document.findMany({
      where: { societyId: targetSocietyId },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json({ success: true, documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { title, fileUrl, category = 'BYLAWS' } = req.body;
    const societyId = req.user.societyId;

    if (!societyId) {
      return res.status(400).json({ success: false, message: 'Society affiliation required' });
    }

    const document = await prisma.document.create({
      data: {
        societyId,
        title,
        fileUrl: fileUrl || '/docs/sample-document.pdf',
        category,
        uploadedBy: req.user.name
      }
    });

    res.status(201).json({ success: true, message: 'Document added to repository', document });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
