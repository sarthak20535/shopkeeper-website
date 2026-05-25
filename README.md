# Shopkeeper Website

A customizable product catalog website for small shopkeepers. Visitors can browse products and view shop contact info — **no online ordering or booking**.

## Features

### Public (Visitor)
- Hamburger menu with customizable category tabs
- Each tab opens a page with product tiles
- Shop info page: shopkeeper name, mobile, address, city
- Browse-only — no cart or checkout

### Admin (Shopkeeper)
- Set website name, shop details, and theme colors
- Create/edit/delete menu categories (hamburger tabs)
- Add products with fully customizable tiles:
  - Name, image (upload or URL), size, price, description
  - Custom tile background and text colors
  - Live tile preview while editing

## Tech Stack

- **Backend:** Node.js, Express, SQLite
- **Frontend:** React, Vite, React Router

## Quick Start

```bash
# Install dependencies
npm run install:all

# Terminal 1 — start API server
npm run dev:server

# Terminal 2 — start React app
npm run dev:client
```

- **Shop (public):** http://localhost:5173
- **Admin login:** http://localhost:5173/admin
- **Default credentials:** `admin` / `admin123`

## How it works when deployed (real users)

**Yes — once deployed, this is exactly how it works:**

1. You deploy **one website** to a public URL (e.g. `https://my-shop.onrender.com`)
2. The **shopkeeper (admin)** logs in at `/admin`, sets shop name, categories, and products
3. **Anyone visiting that URL** instantly sees what the admin configured — no login needed for visitors
4. Data is saved in the **SQLite database** on the server

> **Free tier note:** Render’s free plan does not include persistent disks. Shop data and uploaded images may reset when the app redeploys or restarts. For permanent storage, upgrade to a paid plan with a disk, or we can switch the app to a hosted database (e.g. Turso/PostgreSQL).

```
Shopkeeper (Admin)                    Visitors (Users)
       │                                      │
       ▼                                      ▼
  /admin login ──► saves to DB ◄── reads from DB ──► browse products
  add products         │                              view shop info
  set shop details     │                              hamburger menu
                       ▼
                 shop.db + uploads/
```

**Important:** Right now this is **one shop per deployment**. Every visitor sees the same shop. If you want **many shopkeepers each with their own separate shop** on one platform (like `shop1.yoursite.com`, `shop2.yoursite.com`), that needs multi-tenant support — say the word and we can add that.

## Deploy to Render (recommended, free tier)

1. Push this project to **GitHub**
2. Go to [render.com](https://render.com) → **New** → **Blueprint** (or Web Service)
3. Connect your repo — Render reads `render.yaml` automatically
4. Deploy. You get a URL like `https://shopkeeper-website.onrender.com`
5. Open `/admin`, log in with `admin` / `admin123`, **change the password** (see below)
6. Share the main URL with customers

**Free tier:** Works without a paid disk. Data may be lost on redeploy/restart — fine for testing; use a paid disk or hosted DB for production.

### Environment variables (production)

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Secret for admin login tokens (auto-generated on Render) |
| `NODE_ENV` | Set to `production` |
| `PORT` | Set automatically by hosting platform |

Copy `.env.example` for local production testing.

## Deploy with Docker

```bash
docker build -t shopkeeper-website .
docker run -p 3001:3001 -v shop-data:/data -e JWT_SECRET=your-secret shopkeeper-website
```

Open http://localhost:3001

## Production build (local)

```bash
npm run install:all
npm run build
JWT_SECRET=your-secret NODE_ENV=production npm start
```

Single server serves both API and React app on port 3001.

## Change admin password after deploy

The default password is only for first setup. To change it, run on the server (or locally):

```bash
node -e "
const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')(process.env.DATA_DIR ? process.env.DATA_DIR + '/shop.db' : './server/shop.db');
const hash = bcrypt.hashSync('YOUR_NEW_PASSWORD', 10);
db.prepare('UPDATE admin SET password_hash = ? WHERE id = 1').run(hash);
console.log('Password updated');
"
```

Or we can add a "Change password" screen in the admin panel if you want.


```
safe/
├── server/          # Node.js API
│   ├── index.js
│   ├── db.js        # SQLite schema
│   └── routes/      # public + admin APIs
└── client/          # React frontend
    └── src/
        ├── pages/   # Home, Category, Contact, Admin
        └── components/
```

## Admin Workflow

1. Log in at `/admin`
2. **Shop Settings** — set website name, your name, mobile, address, city, colors
3. **Menu Categories** — add tabs like "Groceries", "Electronics" (these appear in the hamburger menu)
4. **Products** — add products to each category with images and custom tile styling

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/settings` | Shop settings |
| GET | `/api/public/tabs` | Menu categories |
| GET | `/api/public/tabs/:id/products` | Products in category |
| POST | `/api/admin/login` | Admin login |
| PUT | `/api/admin/settings` | Update shop settings |
| CRUD | `/api/admin/tabs` | Manage categories |
| CRUD | `/api/admin/products` | Manage products |
| POST | `/api/admin/upload` | Upload product image |
