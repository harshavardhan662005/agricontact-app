import { Request, Response } from 'express';
import { prisma } from '../config/db';

// Allowed contract status transitions defined in Prisma Schema
const VALID_STATUSES = ['PROPOSED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

export async function createContract(req: Request, res: Response) {
  try {
    const { listingId, buyerId, farmerId, agreedQuantityKg, agreedPricePerKg, deliveryDate } = req.body;

    // Validate required fields
    if (!listingId || !buyerId || !farmerId || !agreedQuantityKg || !agreedPricePerKg || !deliveryDate) {
      return res.status(400).json({
        error: 'Missing required contract fields',
        requiredFields: ['listingId', 'buyerId', 'farmerId', 'agreedQuantityKg', 'agreedPricePerKg', 'deliveryDate'],
      });
    }

    // Verify listing, buyer, and farmer exist to prevent Prisma Foreign Key crashes
    const [listing, buyer, farmer] = await Promise.all([
      prisma.listing.findUnique({ where: { id: listingId } }),
      prisma.user.findUnique({ where: { id: buyerId } }),
      prisma.user.findUnique({ where: { id: farmerId } }),
    ]);

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (!buyer) return res.status(404).json({ error: 'Buyer user not found' });
    if (!farmer) return res.status(404).json({ error: 'Farmer user not found' });

    const contract = await prisma.contract.create({
      data: {
        listingId,
        buyerId,
        farmerId,
        agreedQuantityKg: Number(agreedQuantityKg),
        agreedPricePerKg: Number(agreedPricePerKg),
        deliveryDate: new Date(deliveryDate),
        status: 'PROPOSED',
      },
    });

    return res.status(201).json({ message: 'Contract proposed successfully', contract });
  } catch (error: any) {
    console.error('Create Contract Error:', error);
    return res.status(500).json({
      error: 'Failed to propose contract',
      details: error?.message || String(error),
    });
  }
}

export async function getContracts(req: Request, res: Response) {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, phone: true } },
        farmer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ count: contracts.length, contracts });
  } catch (error: any) {
    console.error('Fetch Contracts Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
}

export async function getUserContracts(req: Request, res: Response) {
  try {
    const userId = req.params.userId as string; // <-- Strictly cast as string

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [{ farmerId: userId }, { buyerId: userId }],
      },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, phone: true } },
        farmer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ count: contracts.length, contracts });
  } catch (error: any) {
    console.error('Fetch User Contracts Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user contracts' });
  }
}
export async function updateContractStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string; // <-- Strictly cast as string
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status field is required' });
    }

    if (!VALID_STATUSES.includes(status.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const existingContract = await prisma.contract.findUnique({ where: { id } });
    if (!existingContract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: { status: status.toUpperCase() as any },
    });

    return res.status(200).json({ message: 'Contract status updated', contract: updatedContract });
  } catch (error: any) {
    console.error('Update Contract Status Error:', error);
    return res.status(500).json({ error: 'Failed to update contract status' });
  }
}