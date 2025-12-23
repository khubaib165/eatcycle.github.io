# FoodShare (Eat-Cycle)

A web-based Food Donation Platform that connects donors (restaurants, institutions, households) with recipients in real time. Built with React, Tailwind CSS and Firebase (Cloud Functions + Firestore). This repository includes both Donor and Recipient dashboards, real-time chat (via Firestore), order management and authentication flows.

Maintainer: Khubaib  
Email: khubaib20103@gmail.com  
GitHub: https://github.com/khubaib165 (username: khubaib165)

---

## Table of Contents

- [Repository Contents](#repository-contents)  
- [Quick Demo / Screenshots](#quick-demo--screenshots)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Files of Interest / Structure](#files-of-interest--structure)  
- [Prerequisites](#prerequisites)  
- [Install & Run (Local Development)](#install--run-local-development)  
- [Environment / Configuration (optional)](#environment--configuration-optional)  
- [Testing & Manual Setup Notes](#testing--manual-setup-notes)  
- [Build for Production & Deployment](#build-for-production--deployment)  
- [Firebase (Backend) Notes](#firebase-backend-notes)  
- [Git / GitHub — push your code](#git--github---push-your-code)  
- [Troubleshooting](#troubleshooting)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## Repository Contents

This README was auto-filled using the source files included in the project. The project contains the following main files:

- `main.jsx` — App bootstrap and routing
- `Home.jsx` — Landing / role-selection page
- `Login.jsx` — Login UI + API call
- `Signup.jsx` — Signup UI + API call
- `DonorDashboard.jsx` — Donor dashboard (create listings, manage donations & orders, chat)
- `RecipientDashboard.jsx` — Recipient dashboard (browse listings, place orders, chat)
- `NotFound.jsx` — 404 fallback
- `info.jsx` — simple example component
- `index.css` — Tailwind setup imports

---

## Quick Demo / Screenshots

(You CAN USE YOUR OWN IMAGES!)
- Login / Signup
- Home (role selection)
- Donor Dashboard (Add Donation modal, listing cards)
- Recipient Dashboard (Search, Request modal)
- Chat modal (donor-recipient conversation)

---

## Features

- Donor & Recipient roles with separate dashboards
- Donor: Post new donations, view/manage listings, delete items
- Recipient: Browse available donations, request donations
- Orders stored in Firestore; chats stored under `chats/{orderId}/messages`
- Lightweight "real-time" update via polling (orders & chat)
- Responsive UI using Tailwind CSS
- Simple login/signup flows that store userId & token in localStorage/sessionStorage

---

## Tech Stack

- Frontend: React
- Styling: Tailwind CSS
- Icons: lucide-react
- Backend API: Firebase Cloud Functions (example base URL included)
- Database: Firestore (used for orders and chats)
- Build tool: Vite (assumed standard React tooling)
- Hosting: Firebase Hosting / Vercel / Netlify (instructions below)

---

## Files of Interest / Structure (summary)

- `main.jsx` — imports routes:
  - `/` `/login` → `Login.jsx`
  - `/signup` → `Signup.jsx`
  - `/home` → `Home.jsx`
  - `/donor` → `DonorDashboard.jsx`
  - `/reciver` → `RecipientDashboard.jsx`

Important components:
- `DonorDashboard.jsx` — interacts with:
  - Backend REST API: `https://us-central1-eat-cycle.cloudfunctions.net/api` (CRUD for listings)
  - Firestore REST API: reads/writes `orders` collection and `chats/{orderId}/messages` subcollections
- `RecipientDashboard.jsx` — reads listings from the same backend and writes orders to Firestore

---

## Prerequisites

- Node.js (v14+ recommended) and npm (or yarn)
- Git
- (Optional but recommended) Firebase project for Firestore & Cloud Functions if you want full backend behavior

---

## Install & Run (Local Development)

1. Clone the repo (example repo URL using your GitHub username — adjust if different):
   ```bash
   git clone https://github.com/khubaib165/foodshare-eat-cycle.git
   cd foodshare-eat-cycle
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the dev server (Vite assumed):
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open the app in your browser at the port Vite shows (usually http://localhost:5173).

If your project doesn't have `package.json` scripts yet, add this minimal package.json snippet to enable dev/build/preview using Vite:

```json
{
  "name": "foodshare",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "lucide-react": "^0.257.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

---

## Environment / Configuration (optional)

The project currently includes `API_BASE_URL` and `firebaseConfig` constants directly in components. For production and safety, we recommend moving these to environment variables.

Example `.env` file (Vite: variables must start with `VITE_`):

```
VITE_API_BASE_URL=https://us-central1-eat-cycle.cloudfunctions.net/api

VITE_FIREBASE_API_KEY=AIzaSyBs9jU6_1D8aMFIKMY0FQd8QWW4PuNJEjA
VITE_FIREBASE_AUTH_DOMAIN=eat-cycle.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eat-cycle
VITE_FIREBASE_STORAGE_BUCKET=eat-cycle.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=208388832351
VITE_FIREBASE_APP_ID=1:208388832351:web:53b8b572de0dd3f21aafea
VITE_FIREBASE_MEASUREMENT_ID=G-C4FT87BNNH
```

How to use them in code (example pattern):
```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

> NOTE: Your current code already contains a firebase config and API base URL for convenience; moving them to environment variables is recommended but not strictly required to run locally.

---

## Testing & Manual Setup Notes

1. Authentication
   - `Signup.jsx` posts to `${API_URL}/signup`
   - `Login.jsx` posts to `${API_URL}/login`
   - On successful login, the app stores `userId`, `token`, and `user` in `localStorage`. Many dashboard operations depend on `localStorage.getItem("userId")`.
   - If you don't have a backend running, you can manually set a test userId in browser console for development:
     ```js
     localStorage.setItem('userId', 'test-user-123')
     ```
   - Alternatively, implement or mock the backend endpoints.

2. Listings & Orders
   - Donor listings: backend at `${API_BASE_URL}/listings` (POST, GET, PUT, DELETE)
   - Orders: stored to Firestore via the REST API:
     `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders`
   - Chats: saved at `chats/{orderId}/messages` (Firestore subcollection) using the REST API.

3. Firestore permissions
   - For local testing with Firestore REST API, ensure your Firestore rules allow reads/writes or use an authenticated service account. For prototyping you can temporarily set permissive rules (NOT recommended for production).

---

## Build for Production & Deployment

### Build
```bash
npm run build
# or
yarn build
```
This produces a `dist/` (or `build/`) folder depending on your bundler configuration.

### Deploy to Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   - Choose Hosting (and Functions if you want to host API there).
   - For hosting, set `dist` (or `build`) as the public directory.

2. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

### Deploy to Vercel
- Install Vercel CLI or connect repo to Vercel dashboard; Vercel detects Vite/React apps automatically. Set environment variables in project settings.

---

## Firebase (Backend) Notes

- The frontend expects:
  - Cloud Functions-based REST API: `https://us-central1-eat-cycle.cloudfunctions.net/api`
    - Endpoints used in code:
      - `GET /listings` — list all listings
      - `POST /listings` — create listing
      - `PUT /listings/:id` — update listing
      - `DELETE /listings/:id` — delete listing
      - `GET /users/:userId/listings` — listings by user (DonorDashboard uses this)
      - `POST /signup` and `POST /login` — auth endpoints
  - Firestore collections:
    - `orders` — order documents containing fields such as orderId, donorId, recipientId, foodItem, status, orderDate...
    - `chats/{orderId}/messages` — messages per order with fields: sender, text, timestamp

If you don’t have existing functions, you can implement the above endpoints using Node.js + Express in Firebase Cloud Functions or create a simple Express server for local development (or mock with JSON Server).

---

## Git / GitHub — push your code

1. Initialize git (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FoodShare (Eat-Cycle)"
   ```

2. Create a repository on GitHub (example repo name `foodshare-eat-cycle`) under your account `khubaib165`:
   - Repository URL (example): `https://github.com/khubaib165/foodshare-eat-cycle.git`

3. Add remote and push:
   ```bash
   git remote add origin https://github.com/khubaib165/foodshare-eat-cycle.git
   git branch -M main
   git push -u origin main
   ```

> If prompted for credentials when pushing via HTTPS, create a GitHub Personal Access Token (PAT) and use it as the password, or set up SSH keys.

Recommended `.gitignore` for this project:
```
# node
node_modules/
# build output
dist/
build/
# env
.env
.env.local
.env.*.local
# editor
.vscode/
.idea/
.DS_Store
# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

## Troubleshooting

- `Cannot fetch Firestore documents` → check `firebaseConfig.projectId` and Firestore permissions/rules.
- `CORS` errors when calling your API → enable CORS in your Cloud Functions/express server.
- `login` or `signup` returns errors → make sure backend endpoints exist and return JSON shaped as expected (Login should return `userId`, `token`, `user`).
- `localStorage.getItem("userId")` missing → ensure login runs successfully or set a test userId manually.
- `node_modules` too large on push → ensure `.gitignore` contains `node_modules/`.

---

## Contributing

Contributions, improvements and bug fixes are welcome.

Steps:
1. Fork repo
2. Create branch (feature/your-feature)
3. Commit changes with clear message
4. Push branch and open a Pull Request

Please include:
- Purpose of change
- Screenshots (if UI)
- Any migration/installation steps

---

## License

This project is provided under the MIT License.

---

## Contact

Maintainer: Khubaib  
Email: khubaib20103@gmail.com  
GitHub: https://github.com/khubaib165

If you need me to:
- generate a production-ready `.env` and rewrite components to use environment variables,
- produce any missing `package.json` or Tailwind config files,
- or create Firebase Cloud Functions samples for the expected API — tell me which and I'll generate them.

Thank you — Good luck with your presentation and deployment!  
Save Food, Save Lives — FoodShare (Eat-Cycle)
