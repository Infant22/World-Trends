import { Router, Request, Response } from 'express';
import { getNewsDataFeed, sanitizeCategory, sanitizeLanguage } from '../services/newsDataService';

export const newsRouter = Router();

newsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const rawCategory = (req.query.category as string) || 'all';
    const interests = (req.query.interests as string) || '';
    const rawLanguage = (req.query.language as string) || 'english';
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';

    const category = sanitizeCategory(rawCategory);
    const language = sanitizeLanguage(rawLanguage);

    if (req.query.format === 'array' || (category !== 'all' && req.query.format !== 'object')) {
      const articles = await getNewsDataFeed(category, interests, forceRefresh, language).catch(() => []);
      return res.json(articles);
    }

    // For 'all' or default object format:
    // Fetch dedicated category-first news feeds in parallel (cached per language & category)
    const [all, technology, world, sports, finance] = await Promise.all([
      getNewsDataFeed('all', interests, forceRefresh, language).catch(() => []),
      getNewsDataFeed('technology', interests, forceRefresh, language).catch(() => []),
      getNewsDataFeed('world', interests, forceRefresh, language).catch(() => []),
      getNewsDataFeed('sports', interests, forceRefresh, language).catch(() => []),
      getNewsDataFeed('finance', interests, forceRefresh, language).catch(() => []),
    ]);

    return res.json({
      all,
      technology,
      world,
      sports,
      finance,
    });
  } catch (error: any) {
    console.error('[API /api/news Error]:', error?.message || error);
    return res.json({
      all: [],
      technology: [],
      world: [],
      sports: [],
      finance: [],
    });
  }
});
