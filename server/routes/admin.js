import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import db from '../db.js';
import { UPLOADS_DIR } from '../config.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: admin.username });
});

router.use(authMiddleware);

router.get('/settings', (_req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

router.put('/settings', (req, res) => {
  const { website_name, shopkeeper_name, mobile, address, city, primary_color, accent_color } = req.body;
  db.prepare(`
    UPDATE settings SET
      website_name = ?, shopkeeper_name = ?, mobile = ?, address = ?,
      city = ?, primary_color = ?, accent_color = ?
    WHERE id = 1
  `).run(website_name, shopkeeper_name, mobile, address, city, primary_color, accent_color);
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

router.get('/tabs', (_req, res) => {
  res.json(db.prepare('SELECT * FROM tabs ORDER BY sort_order, id').all());
});

router.post('/tabs', (req, res) => {
  const { name, icon, sort_order } = req.body;
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM tabs').get().m;
  const result = db
    .prepare('INSERT INTO tabs (name, icon, sort_order) VALUES (?, ?, ?)')
    .run(name, icon || '📦', sort_order ?? maxOrder + 1);
  res.status(201).json(db.prepare('SELECT * FROM tabs WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/tabs/:id', (req, res) => {
  const { name, icon, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM tabs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tab not found' });
  db.prepare('UPDATE tabs SET name = ?, icon = ?, sort_order = ? WHERE id = ?').run(
    name ?? existing.name,
    icon ?? existing.icon,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM tabs WHERE id = ?').get(req.params.id));
});

router.delete('/tabs/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tabs WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tab not found' });
  res.json({ success: true });
});

router.get('/products', (req, res) => {
  const { tab_id } = req.query;
  if (tab_id) {
    return res.json(
      db.prepare('SELECT * FROM products WHERE tab_id = ? ORDER BY sort_order, id').all(tab_id)
    );
  }
  res.json(db.prepare('SELECT * FROM products ORDER BY tab_id, sort_order, id').all());
});

router.post('/products', (req, res) => {
  const {
    tab_id, name, image_url, size, price, description,
    tile_bg_color, tile_text_color, sort_order,
  } = req.body;
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM products WHERE tab_id = ?')
    .get(tab_id).m;
  const result = db.prepare(`
    INSERT INTO products (tab_id, name, image_url, size, price, description, tile_bg_color, tile_text_color, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tab_id, name, image_url || '', size || '', price || '', description || '',
    tile_bg_color || '#ffffff', tile_text_color || '#1f2937', sort_order ?? maxOrder + 1
  );
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const fields = ['tab_id', 'name', 'image_url', 'size', 'price', 'description', 'tile_bg_color', 'tile_text_color', 'sort_order'];
  const updated = { ...existing, ...req.body };
  db.prepare(`
    UPDATE products SET tab_id=?, name=?, image_url=?, size=?, price=?, description=?,
      tile_bg_color=?, tile_text_color=?, sort_order=? WHERE id=?
  `).run(
    updated.tab_id, updated.name, updated.image_url, updated.size, updated.price,
    updated.description, updated.tile_bg_color, updated.tile_text_color, updated.sort_order,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

router.delete('/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
