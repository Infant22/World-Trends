import { Router, Request, Response } from 'express';
import axios from 'axios';
import { apiCache } from '../index';

export const countriesRouter = Router();

countriesRouter.get('/:name', async (req: Request, res: Response) => {
  const countryName = String(req.params.name).trim();
  const cacheKey = `country_${countryName.toLowerCase()}`;

  // Check cache
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
    );

    const country = response.data[0];

    const currenciesFormatted = country.currencies
      ? Object.entries(country.currencies).map(([code, details]: [string, any]) => ({
          code,
          name: details.name,
          symbol: details.symbol || code,
        }))
      : [];

    const languagesFormatted = country.languages
      ? Object.values(country.languages) as string[]
      : [];

    const normalizedData = {
      name: country.name?.common || countryName,
      officialName: country.name?.official || countryName,
      flag: country.flag || '🏳️',
      capital: country.capital?.[0] || 'N/A',
      region: country.region || 'Global',
      subregion: country.subregion || '',
      population: country.population || 0,
      languages: languagesFormatted,
      currencies: currenciesFormatted,
      timezones: country.timezones || [],
      latlng: country.latlng || [0, 0],
      mapUrl: country.maps?.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(countryName)}`,
    };

    // Cache for 24 hours (86400 seconds)
    apiCache.set(cacheKey, normalizedData, 86400);

    return res.json(normalizedData);
  } catch (error: any) {
    console.error('[Countries Controller Error]:', error?.message || error);
    return res.status(404).json({ error: `Country '${countryName}' not found.` });
  }
});
