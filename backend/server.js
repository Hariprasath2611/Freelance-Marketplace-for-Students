import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import connectDB from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { errorHandler, notFound } from './middleware/error.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment configurations
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Sockets
initSocket(server);

// Middleware configurations
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup uploads folder mapping for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Mount uploads static path
app.use('/uploads', express.static(uploadsPath));
app.use('/_/backend/uploads', express.static(uploadsPath));

// API Routes Mapping
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/proposals', proposalRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);

app.use('/api', apiRouter);
app.use('/_/backend/api', apiRouter);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Freelance Marketplace for Students API is running...' });
});

// Fallback error middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
