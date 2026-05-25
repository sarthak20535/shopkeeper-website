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

- **Backend:** Node.js, Express, MongoDB (Atlas)
- **Frontend:** React, Vite, React Router
- **Storage:** MongoDB for shop data + GridFS for uploaded images (all persistent)

## Quick Start (local)

### 1. Create free MongoDB Atlas database

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create free account
2. Create a **free M0 cluster**
3. Database Access → Add user (username + password)
4. Network Access → Add IP `0.0.0.0/0` (allow from anywhere)
5. Connect → Drivers → copy connection string, e.g.:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/shopkeeper?retryWrites=true&w=majority
   ```

### 2. Run the app

```bash
cp .env.example server/.env
# Edit server/.env and paste your MONGODB_URI

npm run install:all

# Terminal 1
MONGODB_URI="your-uri" JWT_SECRET="dev-secret" npm run dev:server

# Terminal 2
npm run dev:client
```

- **Shop (public):** http://localhost:5173
- **Admin login:** http://localhost:5173/admin
- **Default credentials:** `admin` / `admin123`

## Deploy to Render (free)

1. Create **MongoDB Atlas** cluster (steps above)
2. Push repo to GitHub
3. [render.com](https://render.com) → your service → **Environment**
4. Add **`MONGODB_URI`** = your Atlas connection string
5. Redeploy (or sync Blueprint)

Your live URL: e.g. `https://shopkeeper-website-4y6v.onrender.com`

- **Admin:** `/admin` → login `admin` / `admin123`
- **Visitors:** open main URL, no login needed

> Render free tier sleeps after inactivity (~50s wake delay). MongoDB Atlas free tier keeps your data permanently.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Admin login token secret |
| `NODE_ENV` | Auto | `production` on Render |
| `PORT` | Auto | Set by Render |

## How it works when deployed

```
Shopkeeper (Admin)              MongoDB Atlas              Visitors (Users)
       │                              │                          │
       ▼                              ▼                          ▼
  /admin login ──► shop settings, products, images ◄── browse shop
```

Data and uploaded images persist in MongoDB even when Render restarts.

## Project Structure

```
safe/
├── server/          # Node.js API + MongoDB models
└── client/          # React frontend
```

## Admin Workflow

1. Log in at `/admin`
2. **Shop Settings** — website name, contact details, colors
3. **Menu Categories** — hamburger menu tabs
4. **Products** — add products with images and custom tiles

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/settings` | Shop settings |
| GET | `/api/public/tabs` | Menu categories |
| GET | `/api/public/tabs/:id/products` | Products in category |
| GET | `/api/public/files/:id` | Uploaded image |
| POST | `/api/admin/login` | Admin login |
| PUT | `/api/admin/settings` | Update shop settings |
| CRUD | `/api/admin/tabs` | Manage categories |
| CRUD | `/api/admin/products` | Manage products |
| POST | `/api/admin/upload` | Upload product image |
