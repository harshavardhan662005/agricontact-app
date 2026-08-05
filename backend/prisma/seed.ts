import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding AgriContact database...');

  // 1. Seed Farmer User
  const farmer = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {
      name: 'Ramesh Kumar',
      password: 'password123',
      role: 'FARMER',
    },
    create: {
      name: 'Ramesh Kumar',
      phone: '9876543210',
      password: 'password123',
      role: 'FARMER',
      latitude: 12.9716,
      longitude: 77.5946,
    },
  });

  // 2. Seed Buyer User
  const buyer = await prisma.user.upsert({
    where: { phone: '9123456789' },
    update: {
      name: 'Suresh Patel',
      password: 'password123',
      role: 'BUYER',
    },
    create: {
      name: 'Suresh Patel',
      phone: '9123456789',
      password: 'password123',
      role: 'BUYER',
      latitude: 13.0827,
      longitude: 80.2707,
    },
  });

  // 3. Seed Sample Listing
  const listing = await prisma.listing.create({
    data: {
      title: 'Fresh Organic Tomatoes',
      cropType: 'Tomato',
      quantityKg: 1000,
      pricePerKg: 35,
      userId: farmer.id,
    },
  });

  console.log('Database seeded successfully!', { farmerId: farmer.id, buyerId: buyer.id, listingId: listing.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });