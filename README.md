# Future Self Snapshot · Continuum

A 5-question AI-powered portrait experience built with React + Vite.  
Powered by the Claude API — no backend required.

---

## Prerequisites

- **Node.js** v18 or later — [download here](https://nodejs.org)
- An **Anthropic API key** — [get one here](https://console.anthropic.com)

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

> **Note:** The app calls `https://api.anthropic.com/v1/messages` directly from
> the browser. This requires your API key to be injected via a proxy or a small
> local middleware — see the section below.

---

## Connecting Your API Key (Required)

The fetch in `src/App.jsx` omits the `x-api-key` header intentionally so the key
is never hardcoded in client code. To run locally, the easiest options are:

### Option A — Vite dev proxy (recommended)

1. Create a `.env` file in the project root:
   ```
   VITE_ANTHROPIC_KEY=sk-ant-...
   ```

2. Add a proxy in `vite.config.js` and update the fetch URL:

   **vite.config.js**
   ```js
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         "/api": {
           target: "https://api.anthropic.com",
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, ""),
           configure: (proxy) => {
             proxy.on("proxyReq", (proxyReq) => {
               proxyReq.setHeader("x-api-key", process.env.VITE_ANTHROPIC_KEY);
               proxyReq.setHeader("anthropic-version", "2023-06-01");
             });
           },
         },
       },
     },
   });
   ```

   **src/App.jsx** — change the fetch URL from:
   ```js
   const response = await fetch("https://api.anthropic.com/v1/messages", {
   ```
   to:
   ```js
   const response = await fetch("/api/v1/messages", {
   ```

### Option B — Claude.ai hosted artifact

Deploy via Claude.ai as an artifact — the API key injection is handled
automatically by the platform (this is how the app was originally designed).

---

## Build for Production

```bash
npm run build
# Output → dist/
```

```bash
npm run preview   # Preview the production build locally
```

---

## Project Structure

```
future-self-snapshot/
├── index.html          # Entry HTML (loads DM Sans font)
├── vite.config.js      # Vite config
├── package.json
└── src/
    ├── main.jsx        # React root mount
    └── App.jsx         # Full FutureSelfSnapshot UI & logic
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 5 |
| UI | React 18 |
| Styling | Inline JS styles (zero CSS files) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Fonts | DM Sans via Google Fonts |
