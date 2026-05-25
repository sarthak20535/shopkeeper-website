import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/settings', (_req, res) => {
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(settings);
});

router.get('/tabs', (_req, res) => {
  const tabs = db.prepare('SELECT * FROM tabs ORDER BY sort_order, id').all();
  res.json(tabs);
});

router.get('/tabs/:tabId/products', (req, res) => {
  const tab = db.prepare('SELECT * FROM tabs WHERE id = ?').get(req.params.tabId);
  if (!tab) return res.status(404).json({ error: 'Tab not found' });

  const products = db
    .prepare('SELECT * FROM products WHERE tab_id = ? ORDER BY sort_order, id')
    .all(req.params.tabId);

  res.json({ tab, products });
});

export default router;
