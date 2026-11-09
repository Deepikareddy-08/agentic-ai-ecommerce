# AuraStore - Frontend Application (React 19 + Vite 8)

This directory houses the client application for **AuraStore: Agentic AI-Based Personalized E-Commerce Platform**.

For the complete project documentation, system architecture, mathematical formulas, and full microservice startup guide, refer to the [Root README.md](../../README.md).

---

## 🎨 Frontend Highlights
- **Framework**: React 19 with JSX runtime.
- **Bundler & Dev Server**: Vite 8 with strict IPv4 port binding (`--host 127.0.0.1 --port 5173`).
- **Icons**: Lucide React (`lucide-react`).
- **HTTP Client**: Axios with automated bearer token auth interceptor and offline resilience.
- **Styling**: Glassmorphism dark/light hybrid design system with CSS custom properties.
- **Key Modules**:
  - `App.jsx`: Master application component with routing, cart drawer, catalog view, and responsive navigation.
  - `components/AiAdvisor.jsx`: Multi-turn conversational agent chat with streaming/markdown table rendering and tool indicator pills.
  - `components/AdminPanel.jsx`: Full CRUD inventory management, stock controls, and order tracking.
  - `components/ProductCard.jsx`: Glassmorphic product card with dynamic image fallback and instant cart dispatch.
  - `components/CompareModal.jsx`: Multi-product side-by-side spec comparison dock.

---

## 🚀 Running the Frontend

### Standalone (Dev Mode):
```bash
npm install
npm run dev
```
Runs at: `http://127.0.0.1:5173/`

### Universal Single-Command (All Microservices):
From the project root:
```bash
npm start
```
or double-click `START_AURA_STORE.bat` on your Desktop.
