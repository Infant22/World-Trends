import { Router, Request, Response } from 'express';
import { resolveUniversalSearch } from '../services/searchService';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || req.query.query || '').trim();
    if (!query) {
      return res.json(null);
    }

    const result = await resolveUniversalSearch(query);
    return res.json(result);
  } catch (error: any) {
    console.error('[Search Router Error]:', error?.message || error);
    return res.status(500).json({ error: 'Search resolution failed.' });
  }
});
