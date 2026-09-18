import { Router, Request, Response } from 'express';
import { fetchSportScoreMatches } from '../services/sportScoreService';

export const sportsRouter = Router();

sportsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    const matches = await fetchSportScoreMatches(forceRefresh);
    return res.json(matches);
  } catch (error: any) {
    console.error('[API /api/sports Error]:', error?.message || error);
    return res.json([]);
  }
});
