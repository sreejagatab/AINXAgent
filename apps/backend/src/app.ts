import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { cache } from './lib/redis';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logging';
import { config } from './config';

// Import routes
import { authRouter } from './routes/auth.routes';
import { documentationRouter } from './routes/documentation.routes';
import { aiRouter } from './routes/ai.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => cache.call(...args),
  }),
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
app.use(limiter);

// Logging
app.use(requestLogger);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/docs', documentationRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

export { app }; 