# FoodExpress — React + Vite

FoodExpress is the existing food-delivery demo converted from plain HTML and inline JavaScript into a React application powered by Vite.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Features
- Customer registration and login
- Customer and admin views
- Restaurant browsing and food menu
- Add items to cart, update quantities, and remove items
- `FOOD10` coupon (10% off, capped at ₹100)
- Checkout with delivery details and demo payment methods
- Customer order history
- Admin order overview, revenue summary, and order-status updates
- Browser `localStorage` persistence

## Demo notes
This is a frontend-only demo. Accounts, cart, and orders are stored in the current browser's local storage. It does not include a secure backend, real payment processing, or real delivery integration. For a real deployment, connect authentication and order data to a backend and never store plaintext passwords in production.
