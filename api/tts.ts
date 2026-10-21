import type { Request, Response } from 'express';
import { handleTtsRequest } from '../src/services/ttsAndTranslationService';

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  return handleTtsRequest(req as Request, res as Response);
}
