import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import listingRoutes from './routes/listing.routes';
import contractRoutes from './routes/contract.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/contracts', contractRoutes);

// Global Error Handler so Express never crashes or hangs silently
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Global Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});