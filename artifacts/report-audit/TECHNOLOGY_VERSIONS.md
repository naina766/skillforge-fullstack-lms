# SkillForge LMS — Verified Technology Versions

**Audit Date:** 12 October 2026  
**Host Environment:** Windows (x64)  
**Workspace:** `D:\Assignment\SkillForge`  
**Live Application:** [https://skillforge-fullstack-lms.vercel.app/](https://skillforge-fullstack-lms.vercel.app/)

This document provides a factual, evidence-based verification of every technology, runtime, library, and framework used in the SkillForge project.

---

## 1. Runtime Environment & Package Management

| Component | Category | Config / Specified Version | Installed in `node_modules` | Tested in Audit | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node.js** | JavaScript Runtime | `v20` (specified in `.github/workflows/ci.yml`) | N/A (System Runtime) | **v24.13.1** | Executed `node -v` in workspace terminal. |
| **npm** | Package Manager | Standard bundled with Node | N/A (System Runtime) | **11.6.2** | Executed `npm -v` in workspace terminal. |
| **TypeScript (Server)** | Language / Compiler | `^5.5.4` (`server/package.json`) | **5.9.3** | **5.9.3** | `tsc` compiled server successfully with 0 errors. |
| **TypeScript (Client)** | Language / Compiler | `^5.5.4` (`client/package.json`) | **5.9.3** | **5.9.3** | `tsc && vite build` compiled client bundle with 0 errors. |

---

## 2. Backend Architecture & Server Dependencies

| Library / Tool | Category | Version in `package.json` | Installed Version | Tested in Audit | Purpose & Verification Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Express.js** | HTTP Web Framework | `^4.19.2` | **4.22.2** | **4.22.2** | Core backend HTTP API server (`server/src/app.ts`). |
| **Mongoose** | MongoDB ODM | `^8.5.1` | **8.24.4** | **8.24.4** | Database schemas, models, and query builders (`server/src/models/`). |
| **MongoDB** | Database Engine | `mongo:7.0` (Docker / CI) | Local Service on `27017` | **7.0.x** | Tested connection on local port `27017` and Dockerfile definition. |
| **jsonwebtoken** | JWT Authentication | `^9.0.2` | **9.0.3** | **9.0.3** | Issues short-lived access tokens (15m) and refresh tokens (7d). |
| **bcryptjs** | Password Hashing | `^2.4.3` | **2.4.3** | **2.4.3** | Salted password hashing with 10 salt rounds (`server/src/services/auth.service.ts`). |
| **cookie-parser** | HTTP Cookie Parser | `^1.4.6` | **1.4.7** | **1.4.7** | Parses HttpOnly `refreshToken` cookie for secure session refresh. |
| **cors** | CORS Middleware | `^2.8.5` | **2.8.6** | **2.8.6** | Restricts cross-origin requests to configured `CLIENT_URL`. |
| **helmet** | Security Headers | `^7.1.0` | **7.2.0** | **7.2.0** | Sets CSP, HSTS, and X-Content-Type-Options headers. |
| **express-rate-limit** | Rate Limiting | `^7.3.1` | **7.5.1** | **7.5.1** | Global API rate limiter (`server/src/middleware/rateLimit.middleware.ts`). |
| **zod** | Schema Validation | `^3.23.8` | **3.25.76** | **3.25.76** | Request payload validation schemas (`server/src/validators/`). |
| **pino** | Structured Logging | `^9.3.1` | **9.14.0** | **9.14.0** | High-performance logger (`server/src/config/logger.ts`). |
| **pino-pretty** | Log Formatting | `^11.2.2` | **11.3.0** | **11.3.0** | Development console log formatting. |
| **socket.io** | WebSocket Server | `^4.8.3` | **4.8.3** | **4.8.3** | Real-time interactive events & notifications. |
| **swagger-ui-express** | API Documentation | `^5.0.1` | **5.0.1** | **5.0.1** | Interactive OpenAPI docs mounted at `/api/docs`. |
| **yamljs** | YAML Parser | `^0.3.0` | **0.3.0** | **0.3.0** | Parses `swagger.yaml` for Swagger UI. |
| **dotenv** | Environment Config | `^16.4.5` | **16.6.1** | **16.6.1** | Loads `.env` file variables (`server/src/config/env.ts`). |
| **ts-node-dev** | Dev Runner | `^2.0.0` | **2.0.0** | **2.0.0** | Hot reload development runner (`npm run dev`). |

---

## 3. Frontend Architecture & Client Dependencies

| Library / Tool | Category | Version in `package.json` | Installed Version | Tested in Audit | Purpose & Verification Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **React** | UI Framework | `^18.3.1` | **18.3.1** | **18.3.1** | Core component rendering engine. |
| **React DOM** | DOM Renderer | `^18.3.1` | **18.3.1** | **18.3.1** | Browser DOM integration. |
| **Vite** | Frontend Bundler | `^5.3.5` | **5.4.21** | **5.4.21** | Fast development server & production builder (`vite.config.ts`). |
| **React Router DOM** | Client Routing | `^6.25.1` | **6.30.6** | **6.30.6** | Declarative SPA client-side routing (`client/src/App.tsx`). |
| **Zustand** | State Management | `^4.5.4` | **4.5.7** | **4.5.7** | Lightweight in-memory state stores (`useAuthStore`, `useUIStore`). |
| **TanStack React Query**| Server State Sync | `^5.51.16` | **5.102.0** | **5.102.0** | Async query cache, mutation handling, and refetching. |
| **Axios** | HTTP Client | `^1.7.2` | **1.19.0** | **1.19.0** | Interceptor-driven HTTP requests with token refresh (`axiosClient.ts`). |
| **Tailwind CSS** | Styling Engine | `^3.4.7` | **3.4.19** | **3.4.19** | Utility-first styling with dark theme tokens (`tailwind.config.js`). |
| **PostCSS** | CSS Preprocessor | `^8.4.40` | **8.5.26** | **8.5.26** | CSS processing pipeline (`postcss.config.js`). |
| **Autoprefixer** | CSS Vendor Prefixes| `^10.4.19` | **10.5.4** | **10.5.4** | CSS vendor prefix generation. |
| **Framer Motion** | UI Animations | `^11.3.19` | **11.18.2** | **11.18.2** | Smooth micro-animations, modals, and route transitions. |
| **Lucide React** | Icon System | `^0.417.0` | **0.417.0** | **0.417.0** | Vector iconography across application UI. |
| **Recharts** | Data Visualization | `^2.12.7` | **2.15.4** | **2.15.4** | Responsive analytics charts in Admin & Instructor dashboards. |
| **React Hook Form** | Form Management | `^7.52.1` | **7.86.0** | **7.86.0** | Uncontrolled form inputs with performant validation. |
| **@hookform/resolvers**| Form Validation Adapter| `^3.9.0` | **3.10.0** | **3.10.0** | Integrates Zod validation schemas into React Hook Form. |
| **Socket.IO Client** | WebSocket Client | `^4.8.3` | **4.8.3** | **4.8.3** | Real-time notification and live state sync. |
| **tailwind-merge / clsx**| CSS Utility | `^2.4.0` / `^2.1.1`| **2.6.1 / 2.1.1**| **2.6.1 / 2.1.1**| Conditional Tailwind class merging. |

---

## 4. Artificial Intelligence & Third-Party APIs

| Service / Provider | Integration Method | Model / Target Version | Fallback Mechanism | Status & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | Direct REST API via `fetch` | `gemini-1.5-flash` | Deterministic `SmartRuleEngine` + Catalog Scorer | Tested live in browser (`06-ai-career-mentor.png`) and verified in code (`server/src/services/ai.service.ts`). |
| **Cloudinary** | HMAC-SHA1 Signed Direct Upload | Cloudinary V1 REST API | YouTube Embed & Local Stream | Verified signature generation in `server/src/services/video.service.ts`. |
| **YouTube IFrame API** | Client-Side Embedded Script | `https://www.youtube.com/iframe_api` | HTML5 `<video>` tag | Verified in `client/src/components/video/VideoLessonPlayer.tsx`. |

---

## 5. Automated Testing Frameworks

| Suite | Testing Framework | Version Specified | Version Installed | Tests Executed | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Integration & Unit** | **Vitest** + **Supertest** | `vitest ^4.1.11`, `supertest ^7.0.0` | Vitest **4.1.11**, Supertest **7.2.2** | **77 tests** (8 test files) | **100% Passed (77/77)** |
| **Frontend Component & Unit** | **Vitest** + **Testing Library**| `vitest ^2.0.4`, `@testing-library/react ^16.0.0` | Vitest **2.1.9**, RTL **16.3.2** | **16 tests** (3 test files) | **100% Passed (16/16)** |
| **Total Test Coverage** | **Vitest Ecosystem** | Cross-platform | Cross-platform | **93 total tests** | **100% Passed (93/93)** |

---

## 6. Deployment & Infrastructure

| Environment | Platform | Configuration File | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Production** | **Vercel** | `vercel.json` | **Live & Verified** | Hosted at `https://skillforge-fullstack-lms.vercel.app/`. Uses SPA URL rewrites `/(.*) -> /`. |
| **Backend Container** | **Docker** | `Dockerfile`, `docker-compose.yml` | **Configured** | Multi-service Compose with MongoDB 7.0 healthchecks and Node production container. |
| **CI / CD Automation** | **GitHub Actions** | `.github/workflows/ci.yml` | **Configured** | Automated CI pipeline: Node 20 setup, Mongo 7.0 service, backend typecheck & test, client test & bundle build. |
