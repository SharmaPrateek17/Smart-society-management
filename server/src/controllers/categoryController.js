import prisma from '../prisma.js';

export const listCategories = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: { serviceRequests: true, servicePools: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, marketPrice } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description,
        icon: icon || 'wrench',
        marketPrice: parseFloat(marketPrice) || 30.0
      }
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
