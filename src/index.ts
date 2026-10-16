import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import materialRoutes from './routes/materials.routes';
import transactionRoutes from './routes/transactions.routes';
import reviewRoutes from './routes/review.routes';
import interactionRoutes from './routes/interaction.routes';
import materialReviewRoutes from './routes/materialReview.routes';
import notificationRoutes from './routes/notification.routes';
import walletRoutes from './routes/wallet.routes';

import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import ticketRoutes from './routes/ticket.routes';
import couponRoutes from './routes/coupon.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/material-reviews', materialReviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/coupons', couponRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
