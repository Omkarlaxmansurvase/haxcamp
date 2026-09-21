# Luma

A full-stack furniture e-commerce web app with a customer storefront and an admin dashboard.
Built with React, Node.js/Express and PostgreSQL 

## Live links

| | |
|---|---|
| **Live app** | https://luma.omkxr.in |
| **GitHub** | https://github.com/Omkarlaxmansurvase/haxcamp |

> **Note:** the backend and database run on Render's free tier. If the site has been idle,
> the first request can take up to a minute while the server wakes up. Please give it a
> moment on first load.

---

## How to review the project (5-minute walkthrough)

### As a customer

1. **Landing page** (`/`): hero, brand story, category list, and a continuously scrolling product
   carousel. Hover a carousel card to enlarge it, click any product to open its full details.
2. **Catalog** (`/products`): filter by category in the sidebar. Hover a card to see "View details",
   click it to open the product detail modal with specifications, materials, dimensions, care
   instructions and highlights.
3. **Register / log in**: click **Login** in the navbar. A card opens with a **User / Admin** toggle
   and **Login / Register** tabs. Create a user account.
4. **Add to cart**: from a card or from the detail modal (choose a quantity). A toast confirms it
   and offers a **View cart** link.
5. **Checkout** (`/checkout`): change quantities, remove items, and **Place order**.
   Payments are intentionally not integrated. The order is saved to the database.
6. **Delivery, Support, About** pages: static pages with full-screen Lottie animation backgrounds.

### As an admin

1. Click **Login**, switch the toggle to **Admin**, open the **Register** tab, and create an account
   using the admin secret:

   ```
   admin_secret
   ```

2. After logging in, a **Listing** link appears in the navbar (customers never see it).
3. **Listing** (`/admin/listing`) shows:
   - Summary cards: orders, units sold, revenue.
   - A sales chart with **Revenue / Units sold / Buyers** tabs.
   - A products table with units sold and buyers per product.
4. **Add new listing**: a form card with an image upload on the left (live preview, drag and drop).
   All fields and the image are required. The image is uploaded to Cloudinary.
5. **Edit**: change any product detail. The image cannot be changed after listing.
6. **Delete**: asks for confirmation, then removes the product and its image.

Log in as a user in another browser to see the purchases appear in the admin stats.

---

## Features

- Customer and admin roles with JWT authentication (register and login for both)
- Product catalog with categories and a detailed product modal
- Cart and checkout stored in the database (no payment integration)
- Admin dashboard with sales analytics charts (Recharts)
- Admin can list, edit and delete products, with Cloudinary image upload
- Toast notifications with Lottie animations
- Animated UI: scroll reveals, infinite product carousel, Lottie backgrounds
- Responsive layout

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Framer Motion, Recharts, lottie-web, plain CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL (`pg`) |
| Auth | JWT (`jsonwebtoken`), password hashing (`bcryptjs`) |
| Image storage | Cloudinary (`multer` for uploads) |
| Hosting | Vercel (frontend), Render (backend and database), Hostinger DNS (custom domain) |

## Project structure

```
haxcamp/
├── backend/
│   ├── sql/schema.sql          # database tables
│   ├── src/
│   │   ├── index.js            # Express app and route mounting
│   │   ├── db.js               # PostgreSQL connection pool
│   │   ├── cloudinary.js       # image upload and delete helpers
│   │   ├── middleware/auth.js  # requireAuth, requireAdmin
│   │   └── routes/             # auth, products, cart, orders, admin
│   └── package.json
└── frontend/
    ├── public/images/          # hero and product images
    ├── src/
    │   ├── api/client.js       # all API calls
    │   ├── context/            # AuthContext (login state)
    │   ├── components/         # Navbar, modals, Toast, ProductCard, ...
    │   ├── pages/              # Landing, Products, Checkout, AdminListing, Delivery, Support, About
    │   ├── hooks/              # useLockBodyScroll
    │   └── assets/             # Lottie JSON animations
    └── vercel.json             # SPA rewrite for React Router
```

## Frontend routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/products` | Catalog | Public (login needed to add to cart) |
| `/checkout` | Cart and checkout | Logged-in users |
| `/admin/listing` | Admin dashboard | Admin only |
| `/delivery`, `/support`, `/about` | Info pages | Public |

---

## Data model

```
users        (id, name, email, password_hash, role: user | admin)
products     (id, name, category, description, long_description, price, image,
              image_public_id, brand, color, materials, dimensions, weight, care, features[])
orders       (id, user_id, status: cart | bought, created_at, bought_at)
order_items  (id, order_id, product_id, quantity, price)
```

- A **cart** is an order with `status = 'cart'`. Checkout flips it to `bought` and locks in the
  current product prices.
- The admin stats (revenue, units, buyers per product, sales per day) are computed from `bought`
  orders.
- Deleting a product also deletes its order items (its sales history) and its Cloudinary image.


```

---

## Security notes

- Passwords are hashed with bcrypt, and sessions use signed JWTs (7 days).
- Admin routes are protected by a role check on the server, not only hidden in the UI.
- Admin registration requires a secret held in an environment variable (`ADMIN_SECRET`).
- All SQL uses parameterized queries.
- Image uploads are limited to image files under 5 MB.

## Run locally

Requirements: Node.js 20+, PostgreSQL, and a Cloudinary account (for admin image upload).

```bash
git clone https://github.com/Omkarlaxmansurvase/haxcamp.git
cd haxcamp
```

### 1. Database

```bash
createdb luma
psql -d luma -f backend/sql/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/luma
JWT_SECRET=any_long_random_string
ADMIN_SECRET=admin_secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

```bash
npm run dev
```

Check http://localhost:5000/api/health.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open http://localhost:5173. Register an admin (secret above) and use **Add new listing** to create
the first products.

## Deployment

- **Database:** Render PostgreSQL (free tier).
- **Backend:** Render Web Service, root directory `backend`, build `npm install`, start `npm start`.
  Environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_SECRET`, `CLOUDINARY_URL`.
- **Frontend:** Vercel, root directory `frontend`, environment variable `VITE_API_URL` set to the
  backend URL. `vercel.json` rewrites all routes to `index.html` so React Router pages survive a refresh.
- **Domain:** a `luma` subdomain on a Hostinger domain, pointed to Vercel with a CNAME record.



## Author

Omkar