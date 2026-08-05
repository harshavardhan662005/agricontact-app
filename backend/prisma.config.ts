import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default defineConfig({
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});