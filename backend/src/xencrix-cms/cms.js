import { Router } from 'express';
import { createRequire } from 'node:module';
import { isAllowedFrontendOrigin } from '../config/frontend-origin.js';

const require = createRequire(import.meta.url);
const defaultContent = require('./default-content.json');

const REQUIRED_KEYS = ['company', 'hero', 'process', 'services', 'team', 'pages'];
const STRING_LIMIT = 5000;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value, { min = 0, max = STRING_LIMIT } = {}) {
  return typeof value === 'string' && value.trim().length >= min && value.length <= max;
}

function validateContent(content) {
  if (!isRecord(content) || REQUIRED_KEYS.some((key) => !(key in content))) return false;
  if (Object.keys(content).some((key) => !REQUIRED_KEYS.includes(key))) return false;
  const { company, hero, process, services, team, pages } = content;
  if (!isRecord(company) || !['name', 'legalName', 'tagline', 'subTagline', 'phone', 'email', 'address', 'city', 'workingHours']
    .every((key) => isString(company[key], { min: 1 }))) return false;
  if (!isRecord(company.socials) || !['linkedin', 'twitter', 'facebook', 'instagram', 'whatsapp']
    .every((key) => isString(company.socials[key], { max: 1000 }))) return false;
  if (!isRecord(hero) || !['headline', 'mainTagline', 'description', 'aboutParagraph', 'valueBadgeLabel']
    .every((key) => isString(hero[key], { min: 1 }))) return false;
  if (!['primaryCta', 'secondaryCta'].every((key) => isRecord(hero[key])
    && isString(hero[key].label, { min: 1 }) && isString(hero[key].target, { min: 1, max: 1000 }))) return false;
  if (!Array.isArray(hero.valuePoints) || hero.valuePoints.length < 1
    || !hero.valuePoints.every((item) => isRecord(item)
      && isString(item.title, { min: 1 }) && isString(item.subtitle, { min: 1 }))) return false;
  if (![process, services, team].every((items) => Array.isArray(items) && items.length > 0)) return false;
  if (!process.every((item) => isRecord(item)
    && ['id', 'step', 'title', 'description'].every((key) => isString(item[key], { min: 1 })))) return false;
  if (!services.every((item) => isRecord(item)
    && ['id', 'title', 'code', 'description'].every((key) => isString(item[key], { min: 1 })))) return false;
  if (!team.every((item) => isRecord(item)
    && ['id', 'name', 'role', 'bio', 'linkedin'].every((key) => isString(item[key], { min: 1 })))) return false;
  if (!isRecord(pages) || !['home', 'services', 'about', 'contact'].every((key) => isRecord(pages[key]))) return false;
  if (!['title', 'description'].every((key) => isString(pages.home[key], { min: 1 }))) return false;
  return ['services', 'about', 'contact'].every((page) =>
    ['eyebrow', 'title', 'description', 'metaTitle', 'metaDescription']
      .every((key) => isString(pages[page][key], { min: 1 })));
}

export function createCmsRouter({ db, requireAdmin, frontendUrl, allowLoopbackAliases = false }) {
  const router = Router();
  const contentCollection = db.collection('siteContent');
  router.use(async (_request, _response, next) => {
    try {
      await contentCollection.updateOne(
        { _id: 'site-content' },
        { $setOnInsert: { content: defaultContent, updatedAt: new Date().toISOString() } },
        { upsert: true },
      );
      return next();
    } catch (error) {
      return next(error);
    }
  });
  router.use((request, response, next) => {
    if (request.method === 'GET') {
      response.setHeader('Access-Control-Allow-Origin', '*');
      return next();
    }
    const origin = request.headers.origin;
    if (isAllowedFrontendOrigin(origin, frontendUrl, allowLoopbackAliases)) {
      response.setHeader('Access-Control-Allow-Origin', origin || frontendUrl);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
      response.setHeader('Vary', 'Origin');
      if (request.method === 'OPTIONS') return response.sendStatus(204);
      return next();
    }
    return response.status(403).json({ error: 'Origin is not allowed by CORS.' });
  });

  router.get('/content', async (_request, response) => {
    const row = await contentCollection.findOne({ _id: 'site-content' });
    return response.json({ content: row.content, updatedAt: row.updatedAt });
  });

  router.put('/content', requireAdmin, async (request, response) => {
    const content = request.body?.content;
    if (!validateContent(content) || Buffer.byteLength(JSON.stringify(content), 'utf8') > 512 * 1024) {
      return response.status(400).json({
        error: 'Content is invalid. Check the required fields, arrays, page metadata, and the 512 KB limit.',
      });
    }
    const updatedAt = new Date().toISOString();
    await contentCollection.updateOne(
      { _id: 'site-content' },
      { $set: { content, updatedAt } },
      { upsert: true },
    );
    return response.json({ content, updatedAt });
  });

  return router;
}

export { validateContent };
