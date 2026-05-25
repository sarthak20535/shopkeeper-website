import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { Settings, Admin, Tab, Product, formatDoc } from '../models/index.js';
import { saveUpload } from '../gridfs.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id.toString(), username: admin.username }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(authMiddleware);

router.get('/settings', async (_req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(formatDoc(settings));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { website_name, shopkeeper_name, mobile, address, city, primary_color, accent_color } = req.body;
    const settings = await Settings.findOneAndUpdate(
      {},
      { website_name, shopkeeper_name, mobile, address, city, primary_color, accent_color },
      { new: true, upsert: true }
    );
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

router.post('/tabs', async (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;
    const maxTab = await Tab.findOne().sort({ sort_order: -1 });
    const tab = await Tab.create({
      name,
      icon: icon || '📦',
      sort_order: sort_order ?? (maxTab ? maxTab.sort_order + 1 : 0),
    });
    res.status(201).json(formatDoc(tab));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tabs/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Tab not found' });
    }

    const existing = await Tab.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Tab not found' });

    const { name, icon, sort_order } = req.body;
    existing.name = name ?? existing.name;
    existing.icon = icon ?? existing.icon;
    existing.sort_order = sort_order ?? existing.sort_order;
    await existing.save();

    res.json(formatDoc(existing));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tabs/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Tab not found' });
    }

    const tab = await Tab.findByIdAndDelete(req.params.id);
    if (!tab) return res.status(404).json({ error: 'Tab not found' });

    await Product.deleteMany({ tab_id: tab._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { tab_id } = req.query;
    const filter = tab_id ? { tab_id } : {};
    const products = await Product.find(filter).sort({ tab_id: 1, sort_order: 1, createdAt: 1 });
    res.json(products.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const {
      tab_id, name, image_url, size, price, description,
      tile_bg_color, tile_text_color, sort_order,
    } = req.body;

    if (!tab_id || !mongoose.Types.ObjectId.isValid(tab_id)) {
      return res.status(400).json({ error: 'A valid category (tab_id) is required' });
    }

    const maxProduct = await Product.findOne({ tab_id }).sort({ sort_order: -1 });
    const product = await Product.create({
      tab_id,
      name,
      image_url: image_url || '',
      size: size || '',
      price: price || '',
      description: description || '',
      tile_bg_color: tile_bg_color || '#ffffff',
      tile_text_color: tile_text_color || '#1f2937',
      sort_order: sort_order ?? (maxProduct ? maxProduct.sort_order + 1 : 0),
    });

    res.status(201).json(formatDoc(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const fields = [
      'tab_id', 'name', 'image_url', 'size', 'price', 'description',
      'tile_bg_color', 'tile_text_color', 'sort_order',
    ];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        existing[field] = req.body[field];
      }
    }
    await existing.save();

    res.json(formatDoc(existing));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const fileId = await saveUpload(req.file.buffer, filename, req.file.mimetype);

    res.json({ url: `/api/public/files/${fileId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
