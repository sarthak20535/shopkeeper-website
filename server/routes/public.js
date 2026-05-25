import { Router } from 'express';
import mongoose from 'mongoose';
import { Settings, Tab, Product, formatDoc } from '../models/index.js';
import { getUploadMeta, openDownloadStream } from '../gridfs.js';

const router = Router();

router.get('/settings', async (_req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(formatDoc(settings));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tabs', async (_req, res) => {
  try {
    const tabs = await Tab.find().sort({ sort_order: 1, createdAt: 1 });
    res.json(tabs.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tabs/:tabId/products', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.tabId)) {
      return res.status(404).json({ error: 'Tab not found' });
    }

    const tab = await Tab.findById(req.params.tabId);
    if (!tab) return res.status(404).json({ error: 'Tab not found' });

    const products = await Product.find({ tab_id: tab._id }).sort({ sort_order: 1, createdAt: 1 });
    res.json({ tab: formatDoc(tab), products: products.map(formatDoc) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/files/:fileId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      return res.status(404).end();
    }

    const meta = await getUploadMeta(req.params.fileId);
    if (!meta) return res.status(404).end();

    res.set('Content-Type', meta.contentType || 'application/octet-stream');
    openDownloadStream(req.params.fileId).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
