import { Router, Request, Response } from 'express';
import { fetchOnThisDayEvent } from '../services/onThisDayService';

export const onThisDayRouter = Router();

onThisDayRouter.get('/', async (req: Request, res: Response) => {
  try {
    const event = await fetchOnThisDayEvent();
    return res.json(event);
  } catch (error: any) {
    console.error('[OnThisDay Controller Error]:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to fetch On This Day data',
    });
  }
});
