import { Router, Request, Response } from 'express';
import { fetchWeatherData } from '../services/weatherService';

export const weatherRouter = Router();

weatherRouter.get('/', async (req: Request, res: Response) => {
  const city = (req.query.city as string) || 'Chennai';

  try {
    const data = await fetchWeatherData(city);
    return res.json(data);
  } catch (error: any) {
    console.error('[Weather Route Error]:', error?.message || error);
    return res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});
