import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { apiCache } from './services/cache';

import { weatherRouter } from './routes/weather';
import { currencyRouter } from './routes/currency';
import { countriesRouter } from './routes/countries';
import { newsRouter } from './routes/news';
import { sportsRouter } from './routes/sports';
import { onThisDayRouter } from './routes/onThisDay';
import { trendingRouter } from './routes/trending';
import { searchRouter } from './routes/search';

dotenv.config();

export { apiCache };

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Security: Allow localhost in development; restrict to CLIENT_ORIGIN in production
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy error: Origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiter: max 100 requests per 15 minutes per IP (exempt localhost ONLY in non-production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, error: 'Too many requests, please try again later.' },
  skip: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const isLocalhost =
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1';
    return isLocalhost && process.env.NODE_ENV !== 'production';
  },
});

app.use('/api', limiter);

// Mount API Routes
app.use('/api/weather', weatherRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/news', newsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/onthisday', onThisDayRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/search', searchRouter);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'World Trends API Engine',
    timestamp: new Date().toISOString(),
    cacheStats: apiCache.getStats(),
  });
});

// Global Error Handler: Prevents stack trace / internal details leakage
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message || 'An unexpected error occurred';
  res.status(status).json({ status, error: message });
});

// Start Express Server only when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌍 World Trends Express Server running on http://localhost:${PORT}`);
  });
}
