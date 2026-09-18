import NodeCache from 'node-cache';

export const apiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
