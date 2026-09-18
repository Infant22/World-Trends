import { Router, Request, Response } from 'express';
import { fetchRealTimeXTrends } from '../services/trendingService';

export const trendingRouter = Router();

trendingRouter.get('/', async (req: Request, res: Response) => {
  const country = (req.query.country as string) || (req.query.geo as string) || 'India';
  const interestsRaw = (req.query.interests as string) || '';
  const interests = interestsRaw
    ? interestsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    const topics = await fetchRealTimeXTrends(country, interests);
    return res.json(topics);
  } catch (error: any) {
    console.error('[Trending Route Error]:', error?.message || error);
    return res.status(500).json({ error: 'Failed to fetch trending topics.' });
  }
});
