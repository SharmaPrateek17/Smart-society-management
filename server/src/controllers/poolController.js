import prisma from '../prisma.js';

export const listPools = async (req, res) => {
  try {
    const { societyId, status } = req.query;
    const filter = {};

    if (req.user.role === 'ADMIN') {
      filter.societyId = req.user.societyId;
    } else if (societyId) {
      filter.societyId = societyId;
    }

    if (status) {
      filter.status = status;
    }

    const pools = await prisma.servicePool.findMany({
      where: filter,
      include: {
        category: true,
        requests: {
          include: {
            resident: { select: { id: true, name: true, flatNumber: true, phone: true } }
          }
        },
        invitations: {
          include: {
            vendor: true
          }
        },
        quotations: {
          include: {
            vendor: true
          }
        },
        vendorSelection: {
          include: {
            selectedVendor: true,
            admin: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate dynamic savings metrics for each pool
    const poolsWithMetrics = pools.map((pool) => {
      const unitCount = pool.requests.length;
      const benchmarkPrice = pool.category.marketPrice || 0;
      const individualTotalMarket = benchmarkPrice * unitCount;

      let winningQuote = null;
      if (pool.vendorSelection) {
        winningQuote = pool.quotations.find((q) => q.vendorId === pool.vendorSelection.selectedVendorId);
      } else if (pool.quotations.length > 0) {
        // Find best quote so far
        winningQuote = [...pool.quotations].sort((a, b) => a.pricePerUnit - b.pricePerUnit)[0];
      }

      const pooledTotal = winningQuote ? winningQuote.pricePerUnit * unitCount : 0;
      const totalSavings = individualTotalMarket > pooledTotal && pooledTotal > 0 ? individualTotalMarket - pooledTotal : 0;
      const savingsPercent = individualTotalMarket > 0 && totalSavings > 0 ? Math.round((totalSavings / individualTotalMarket) * 100) : 0;

      return {
        ...pool,
        metrics: {
          unitCount,
          benchmarkPrice,
          individualTotalMarket,
          currentBestPerUnit: winningQuote?.pricePerUnit || null,
          pooledTotal,
          totalSavings,
          savingsPercent
        }
      };
    });

    res.json({ success: true, pools: poolsWithMetrics });
  } catch (error) {
    console.error('List pools error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getPool = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await prisma.servicePool.findUnique({
      where: { id },
      include: {
        category: true,
        society: true,
        requests: {
          include: {
            resident: { select: { id: true, name: true, flatNumber: true, phone: true } },
            rating: true
          }
        },
        invitations: {
          include: {
            vendor: true
          }
        },
        quotations: {
          include: {
            vendor: true
          }
        },
        vendorSelection: {
          include: {
            selectedVendor: true,
            admin: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Demand pool not found' });
    }

    const unitCount = pool.requests.length;
    const benchmarkPrice = pool.category.marketPrice || 0;
    const individualTotalMarket = benchmarkPrice * unitCount;

    // Enhance quotations with comparison details
    const comparedQuotations = pool.quotations.map((quote) => {
      const totalCost = quote.pricePerUnit * unitCount;
      const savings = individualTotalMarket > totalCost ? individualTotalMarket - totalCost : 0;
      const savingsPercent = individualTotalMarket > 0 ? Math.round((savings / individualTotalMarket) * 100) : 0;

      return {
        ...quote,
        calculatedTotal: totalCost,
        savings,
        savingsPercent,
        isSelected: pool.vendorSelection?.selectedVendorId === quote.vendorId
      };
    });

    res.json({
      success: true,
      pool: {
        ...pool,
        quotations: comparedQuotations,
        metrics: {
          unitCount,
          benchmarkPrice,
          individualTotalMarket
        }
      }
    });
  } catch (error) {
    console.error('Get pool error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const inviteVendors = async (req, res) => {
  try {
    const { id } = req.params; // poolId
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ success: false, message: 'vendorIds array is required' });
    }

    const pool = await prisma.servicePool.findUnique({ where: { id } });
    if (!pool) {
      return res.status(404).json({ success: false, message: 'Demand pool not found' });
    }

    const results = [];
    for (const vendorId of vendorIds) {
      const existing = await prisma.vendorInvitation.findUnique({
        where: {
          poolId_vendorId: {
            poolId: id,
            vendorId
          }
        }
      });

      if (!existing) {
        const invitation = await prisma.vendorInvitation.create({
          data: {
            poolId: id,
            vendorId,
            status: 'INVITED'
          }
        });
        results.push(invitation);
      }
    }

    // Advance pool status to QUOTING if still OPEN
    if (pool.status === 'OPEN') {
      await prisma.servicePool.update({
        where: { id },
        data: { status: 'QUOTING' }
      });
    }

    res.json({
      success: true,
      message: `Successfully invited ${results.length} vendor(s) to bid on pooled demand`,
      invitationsCount: results.length
    });
  } catch (error) {
    console.error('Invite vendors error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const selectVendor = async (req, res) => {
  try {
    const { id } = req.params; // poolId
    const { vendorId } = req.body;
    const adminId = req.user.id;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'vendorId is required' });
    }

    const pool = await prisma.servicePool.findUnique({
      where: { id },
      include: {
        category: true,
        requests: true,
        quotations: { where: { vendorId } }
      }
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Demand pool not found' });
    }

    const selectedQuote = pool.quotations[0];
    if (!selectedQuote) {
      return res.status(400).json({ success: false, message: 'This vendor has not submitted a quotation for this pool yet' });
    }

    // Upsert pool vendor selection
    const selection = await prisma.poolVendorSelection.upsert({
      where: { poolId: id },
      update: {
        selectedVendorId: vendorId,
        selectedBy: adminId,
        selectedAt: new Date()
      },
      create: {
        poolId: id,
        selectedVendorId: vendorId,
        selectedBy: adminId,
        selectedAt: new Date()
      },
      include: { selectedVendor: true }
    });

    // Update pool status to ASSIGNED
    await prisma.servicePool.update({
      where: { id },
      data: { status: 'ASSIGNED' }
    });

    // Update all member requests in the pool to ASSIGNED
    await prisma.serviceRequest.updateMany({
      where: { poolId: id },
      data: { status: 'ASSIGNED' }
    });

    // Automatically post a notice to the society
    await prisma.notice.create({
      data: {
        societyId: pool.societyId,
        postedBy: adminId,
        title: `Vendor Selected for Pooled ${pool.category.name}`,
        content: `Great news! ${selection.selectedVendor.businessName} has been selected for the pooled ${pool.category.name} drive at $${selectedQuote.pricePerUnit} per flat (${pool.requests.length} flats pooled). The vendor will begin servicing as per schedule.`,
        category: 'MAINTENANCE'
      }
    });

    res.json({
      success: true,
      message: `Vendor ${selection.selectedVendor.businessName} awarded contract! All ${pool.requests.length} pooled residents notified.`,
      selection
    });
  } catch (error) {
    console.error('Select vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
