import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getListings(req: Request, res: Response) {
  try {
    // 1. Fetch raw listings first without relations to verify DB connection
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
    });

    console.log('Successfully fetched listings count:', listings.length);
    return res.status(200).json({ count: listings.length, listings });
  } catch (error: any) {
    console.error('--- DB FETCH ERROR ---');
    console.error(error);
    return res.status(500).json({ 
      error: 'Failed to retrieve crop listings', 
      details: error?.message || String(error)
    });
  }
}

export async function createListing(req: Request, res: Response) {
  try {
    const { title, cropType, quantityKg, pricePerKg, userId } = req.body;

    if (!title || !cropType || !quantityKg || !pricePerKg || !userId) {
      return res.status(400).json({ error: 'Missing required listing fields' });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        cropType,
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        userId,
      },
    });

    return res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error: any) {
    console.error('Create Listing Error:', error);
    return res.status(500).json({ error: 'Failed to create listing' });
  }
}