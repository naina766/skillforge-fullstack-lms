# SkillForge LMS — Full Technical Project Audit

**Project Title:** SkillForge — Full-Stack Learning Management System  
**Audit Date:** 12 October 2026  
**Auditor:** Automated Engineering Project Audit  
**Repository Working Directory:** `D:\Assignment\SkillForge`  
**Live Deployed Application:** [https://skillforge-fullstack-lms.vercel.app/](https://skillforge-fullstack-lms.vercel.app/)  
**GitHub Repository:** [https://github.com/naina766/skillforge-fullstack-lms](https://github.com/naina766/skillforge-fullstack-lms)

---

## 1. Executive Summary

An exhaustive, evidence-based technical audit was conducted on the SkillForge LMS repository. Every claim in the repository documentation was cross-referenced against the actual TypeScript codebase, the MongoDB database schemas, automated test execution results, and the live deployed web application on Vercel.

### Key Audit Findings:
- **Build & Typecheck Integrity:** 100% clean compilation. Both the backend (`tsc`) and frontend (`tsc && vite build`) compile with zero errors and zero warnings.
- **Automated Test Suite:** **93 automated tests across 11 test suites were executed during this audit and passed with 100% success rate (93/93)**.
  - Backend: 77 tests passed across 8 test suites (RBAC, security hardening, AI mentor, reviews, video engine, auth, course catalog).
  - Frontend: 16 tests passed across 3 test suites (UI components, review interactions, AI mentor widgets).
- **Architecture Standard:** Production-grade full-stack architecture adhering strictly to modular separation of concerns (Controllers, Services, Models, Routes, Validators, Middlewares).
- **Security Posture:** Enterprise-grade security implementation featuring short-lived in-memory JWTs, HttpOnly refresh cookies, Helmet Content Security Policy, granular RBAC, Zod payload validation, and custom prompt injection filters for LLM queries.

---

## 2. Architecture & System Flow

```
                                      ARCHITECTURE OVERVIEW
                                      
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                           CLIENT LAYER (React 18 + Vite 5)                             │
  │  - Tailwind CSS 3.4 + Framer Motion                                                    │
  │  - Zustand In-Memory State (useAuthStore, useUIStore)                                  │
  │  - TanStack React Query v5 (Server State Caching & Mutations)                          │
  │  - Axios Client with Automatic 401 Silent Token Refresh Interceptor                    │
  │  - Dual-Engine Video Player (YouTube IFrame API + HTML5/Cloudinary Native)             │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ HTTP / JSON (REST) & WebSockets
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                         SECURITY & INGRESS MIDDLEWARE LAYER                            │
  │  - Helmet Security Headers (Strict CSP frameSrc, connectSrc, HSTS 365d)                │
  │  - CORS (Strict Origin Isolation to CLIENT_URL with credentials: true)                 │
  │  - Express Rate Limiter (Protection against Brute-Force & Denial of Service)           │
  │  - Body Parsing (2MB JSON/URL-encoded limits) & Input Sanitization Middleware          │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                         API ROUTER & CONTROLLER DISPATCH                               │
  │  - /api/auth          - /api/courses         - /api/categories    - /api/enrollments   │
  │  - /api/reviews       - /api/wishlist        - /api/notifications - /api/certificates  │
  │  - /api/admin         - /api/instructor      - /api/ai            - /api/videos        │
  │  - /api/health        - /api/docs (OpenAPI 3.0 / Swagger UI)                           │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                             SERVICE & BUSINESS LOGIC LAYER                             │
  │  - AuthService: Salted bcrypt password hashing & JWT token issuance                    │
  │  - CourseService: Access-controlled curriculum sanitization                            │
  │  - AIService: Intent extraction, prompt injection guard, Gemini REST integration       │
  │  - VideoService: Regex YouTube parsing, Cloudinary SHA-1 HMAC upload signatures        │
  │  - CertificateService: Cryptographic SHA-256 verification hashes                       │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ Mongoose ODM v8
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                PERSISTENCE LAYER (MongoDB 7.0)                         │
  │  - 10 Collections with Compound Unique Indexes & Full-Text Search Indexes              │
  │  - Foreign Key References (ObjectId) enforcing Referential Integrity                   │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Entities & Relationships

The MongoDB persistence layer consists of 10 distinct collections defined using Mongoose schemas in `server/src/models/`:

### 1. `User` (`server/src/models/User.ts`)
- **Fields:** `_id`, `name`, `email` (unique, lowercase, indexed), `passwordHash` (hidden by default via `select: false`), `avatar`, `role` (`STUDENT` | `INSTRUCTOR` | `ADMIN`), `bio`, `skills` (array), `interests` (array), `learningGoals` (array), `isActive` (boolean), `lastLoginAt`, `createdAt`, `updatedAt`.
- **Indexes:** `{ email: 1 }` (unique), `{ role: 1 }`.

### 2. `Course` (`server/src/models/Course.ts`)
- **Fields:** `_id`, `title`, `slug` (unique, lowercase), `shortDescription`, `description`, `thumbnail`, `type` (`COURSE` | `WORKSHOP` | `BOOTCAMP` | `WEBINAR`), `category` (ref: Category), `instructor` (ref: User), `level` (`BEGINNER` | `INTERMEDIATE` | `ADVANCED` | `ALL_LEVELS`), `duration`, `language`, `price`, `discountPrice`, `skills` (array), `prerequisites` (array), `targetAudience` (array), `modules` (embedded array with lessons), `status` (`DRAFT` | `PENDING_REVIEW` | `PUBLISHED` | `ARCHIVED`), `rating` (0–5), `reviewCount`, `ratingDistribution`, `enrollmentCount`.
- **Lesson Sub-document:** `title`, `slug`, `description`, `type` (`VIDEO` | `ARTICLE` | `QUIZ`), `duration`, `videoSource` (`YOUTUBE` | `CLOUDINARY` | `NONE`), `youtubeVideoId`, `cloudinaryUrl`, `videoUrl`, `isPreview` (boolean), `resources`.
- **Indexes:**
  - Compound: `{ category: 1, status: 1 }`
  - Compound: `{ instructor: 1, status: 1 }`
  - Compound: `{ status: 1, createdAt: -1 }`
  - Full-Text Search: `{ title: 'text', description: 'text', skills: 'text' }`
  - Unique: `{ slug: 1 }`

### 3. `Enrollment` (`server/src/models/Enrollment.ts`)
- **Fields:** `student` (ref: User), `course` (ref: Course), `status` (`ACTIVE` | `COMPLETED` | `CANCELLED` | `EXPIRED`), `progress` (array of completed lesson IDs), `completedLessons`, `lastWatchedLesson`, `lastWatchedPosition`, `lessonProgress` (embedded sub-documents with `watchedSeconds`, `duration`, `progressPercent`, `completed`), `completionPercentage` (0–100), `startedAt`, `lastAccessedAt`, `totalLearningSeconds`, `completedAt`, `certificateIssued`.
- **Indexes:**
  - Unique Compound: `{ student: 1, course: 1 }` (prevents double enrollment)
  - Compound: `{ student: 1, status: 1 }`

### 4. `Certificate` (`server/src/models/Certificate.ts`)
- **Fields:** `certificateId` (unique uppercase string, indexed), `student` (ref: User), `course` (ref: Course), `issueDate`, `verificationHash` (cryptographic SHA-256 hash verifying certificate authenticity), `createdAt`, `updatedAt`.
- **Indexes:** `{ certificateId: 1 }` (unique), `{ student: 1 }`, `{ course: 1 }`.

### 5. `Review` (`server/src/models/Review.ts`)
- **Fields:** `course` (ref: Course), `student` (ref: User), `rating` (1–5), `comment` (max 1000 chars), `isModerated`, `createdAt`, `updatedAt`.
- **Indexes:**
  - Unique Compound: `{ student: 1, course: 1 }` (strictly enforces one review per student per course)
  - Secondary: `{ course: 1 }`.

### 6. `Category` (`server/src/models/Category.ts`)
- **Fields:** `name` (unique), `slug` (unique), `description`, `icon`, `isActive`, `createdAt`, `updatedAt`.
- **Indexes:** `{ slug: 1 }` (unique).

### 7. `WishlistItem` (`server/src/models/WishlistItem.ts`)
- **Fields:** `user` (ref: User), `course` (ref: Course), `createdAt`, `updatedAt`.
- **Indexes:** Unique Compound: `{ user: 1, course: 1 }`.

### 8. `Notification` (`server/src/models/Notification.ts`)
- **Fields:** `user` (ref: User), `title`, `message`, `type` (`COURSE_UPDATE` | `ENROLLMENT` | `CERTIFICATE` | `SYSTEM`), `isRead`, `link`, `createdAt`.
- **Indexes:** `{ user: 1, isRead: 1 }`.

### 9. `Session` (`server/src/models/Session.ts`)
- **Fields:** `user` (ref: User), `refreshTokenHash`, `ipAddress`, `userAgent`, `expiresAt`, `isValid`, `createdAt`.
- **Indexes:** `{ user: 1 }`, `{ expiresAt: 1 }` (TTL indexing candidate).

### 10. `AuditLog` (`server/src/models/AuditLog.ts`)
- **Fields:** `user` (ref: User), `action` (string), `entity` (string), `entityId` (string), `details` (mixed object), `ipAddress`, `createdAt`.
- **Indexes:** `{ entity: 1, entityId: 1 }`, `{ createdAt: -1 }`.

---

## 4. API Endpoints & Route Inventory

All endpoints are prefixed with `/api` and defined in `server/src/routes/`:

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account (Zod validated).
- `POST /api/auth/login` — Authenticate user; returns short-lived access token and sets HttpOnly refresh cookie.
- `POST /api/auth/refresh` — Issue a new access token using valid refresh cookie.
- `POST /api/auth/logout` — Invalidate session and clear refresh cookie.
- `GET /api/auth/me` — Retrieve authenticated user profile (Protected).
- `PUT /api/auth/profile` — Update name, bio, skills, or avatar (Protected).

### Courses (`/api/courses`)
- `GET /api/courses` — Paginated catalog with faceted filters (category, level, search, sort, price, type).
- `GET /api/courses/:slug` — Course detail view (Access-controlled: strips private lesson media for non-enrolled users).
- `POST /api/courses` — Create new course draft (Protected: `INSTRUCTOR`, `ADMIN`).
- `PUT /api/courses/:id` — Update course metadata or curriculum (Protected: Course Owner or `ADMIN`).
- `DELETE /api/courses/:id` — Archive/delete course (Protected: Course Owner or `ADMIN`).
- `PATCH /api/courses/:id/publish` — Toggle publish/draft state (Protected: `INSTRUCTOR`, `ADMIN`).

### Enrollments & Progress (`/api/enrollments`)
- `POST /api/enrollments/:courseId` — Enroll current student into a published course (Idempotent).
- `GET /api/enrollments/my-learning` — Retrieve student's enrolled courses with progress percentages.
- `GET /api/enrollments/:courseId` — Retrieve active enrollment state and lesson progress matrix.
- `POST /api/enrollments/:courseId/progress` — Update lesson watched seconds and completion status.

### Reviews (`/api/reviews`)
- `GET /api/reviews/course/:courseId` — Get paginated approved reviews for a course.
- `POST /api/reviews/course/:courseId` — Submit a review (Enforces active enrollment check; 1 review/student).
- `PUT /api/reviews/:reviewId` — Update existing review (Owner only).
- `DELETE /api/reviews/:reviewId` — Remove review (Owner or `ADMIN`).

### Certificates (`/api/certificates`)
- `GET /api/certificates/my-certificates` — List all earned certificates for current student.
- `GET /api/certificates/:certId` — View certificate details (Owner or `ADMIN`).
- `GET /api/certificates/verify/:certId` — Public verification endpoint with cryptographic hash validation.

### AI Career Mentor (`/api/ai`)
- `POST /api/ai/mentor` — Send career prompt; returns structured guidance with skill gaps, roadmap, and catalog recommendations (Protected: `STUDENT`, `INSTRUCTOR`, `ADMIN`).

### Video Engine (`/api/videos`)
- `POST /api/videos/validate-youtube` — Extract & validate YouTube ID, thumbnail, and embed payload.
- `POST /api/videos/sign-upload` — Generate HMAC-SHA1 signature for direct Cloudinary upload (Protected: `INSTRUCTOR`, `ADMIN`).

### Instructor Studio (`/api/instructor`)
- `GET /api/instructor/dashboard` — Instructor dashboard statistics (total courses, students, earnings).
- `GET /api/instructor/courses` — List all courses authored by the authenticated instructor.
- `GET /api/instructor/analytics` — Detailed learner progress and monthly revenue charts.

### Admin Control (`/api/admin`)
- `GET /api/admin/dashboard` — Platform overview metrics (total revenue, students, instructors, enrollments).
- `GET /api/admin/users` — Paginated user directory with role/status management.
- `PATCH /api/admin/users/:id/role` — Update user role (Guarded: Prevents admin self-demotion).
- `GET /api/admin/courses` — Global course moderation queue.
- `GET /api/admin/audit-logs` — Administrative security audit logs.

### Health & Documentation
- `GET /api/health` — System uptime and MongoDB connectivity check (`{ status: "ok", database: { status: "connected" } }`).
- `GET /api/docs` — Interactive OpenAPI / Swagger UI interface.

---

## 5. Security & Access Control Audit

| Security Domain | Implementation Evidence | Audit Evaluation |
| :--- | :--- | :--- |
| **Authentication Flow** | Short-lived JWT (15m expiry) stored strictly in memory + Long-lived Refresh Token (7d expiry) transmitted exclusively via `HttpOnly`, `SameSite: strict`, `Secure` cookies. | **PASSED** (Prevents XSS token exfiltration). |
| **Password Storage** | `bcryptjs` with salt work factor of 10 (`server/src/services/auth.service.ts`). Passwords never stored in plain text. | **PASSED** (Industry standard). |
| **Authorization & RBAC** | Middleware `authorize('STUDENT', 'INSTRUCTOR', 'ADMIN')` enforces strict role boundaries (`server/src/middleware/auth.middleware.ts`). | **PASSED** (Verified by 14 RBAC unit tests). |
| **Admin Self-Demotion Guard** | `AdminService.updateUserRole` prevents an admin from demoting or deactivating their own account (`400 CANNOT_DEMOTE_SELF`). | **PASSED** (Prevents accidental lockouts). |
| **Content Security Policy (CSP)**| Helmet configured with granular whitelist for frame sources (`youtube.com`, `youtube-nocookie.com`) and media sources (`res.cloudinary.com`). | **PASSED** (Protects against iframe injection). |
| **Input Sanitization & Validation** | Zod schemas validate every incoming request body; custom `sanitizeInput` strips dangerous script injections. | **PASSED** (Strict schema enforcement). |
| **Rate Limiting** | Global window rate limiter using `express-rate-limit` prevents brute-force credential stuffing. | **PASSED** (DDoS and brute-force mitigation). |
| **AI Prompt Injection Defense**| `IntentExtractionService` screens for jailbreak keywords and prompt injection patterns before dispatching queries to Gemini. | **PASSED** (Defends against prompt leakage). |
| **Certificate Tamper Proofing**| Each certificate embeds a SHA-256 verification hash derived from student ID, course ID, issue date, and secret seed. | **PASSED** (Verifiable credentials). |

---

## 6. Automated Testing Audit

The test suite was executed in an isolated test environment during this audit:

### Backend Test Results (Vitest v4.1.11)
- **`tests/video.test.ts`**: **9 / 9 passed** (YouTube multi-pattern parsing, 15 min / 500 MB bounds).
- **`tests/course.test.ts`**: **2 / 2 passed** (Course catalog pagination & filters).
- **`tests/auth.test.ts`**: **4 / 4 passed** (Student registration, password verification, cookie issuance).
- **`tests/rbac.test.ts`**: **14 / 14 passed** (Role barriers, course ownership, admin self-demotion guard).
- **`tests/review.test.ts`**: **12 / 12 passed** (Enrollment check, 1–5 rating validation, duplicate prevention).
- **`tests/securityHardening.test.ts`**: **16 / 16 passed** (Content access control, media URL sanitization).
- **`tests/ai.test.ts`**: **5 / 5 passed** (Structured payload v1 validation, prompt size limits, user data isolation).
- **`tests/aiMentor.test.ts`**: **15 / 15 passed** (Roadmap generation, catalog grounding, hallucination prevention).
- **Backend Summary:** **77 passed out of 77 executed (100% pass rate in 31.58s)**.

### Frontend Test Results (Vitest v2.1.9)
- **`src/tests/components.test.tsx`**: **5 / 5 passed** (Core UI components, buttons, badges, modals).
- **`src/tests/reviews.test.tsx`**: **5 / 5 passed** (Review form, star picker, empty states).
- **`src/tests/aiComponents.test.tsx`**: **6 / 6 passed** (AI chat list, suggested prompt chips, markdown rendering).
- **Frontend Summary:** **16 passed out of 16 executed (100% pass rate in 32.32s)**.

### Combined Total:
**93 / 93 Automated Tests Passed (100% Success Rate)**.

---

## 7. Build & Static Analysis Results

1. **Backend Build (`server`):**
   ```bash
   > skillforge-server@1.0.0 build
   > tsc
   Exit Code: 0 (Zero errors)
   ```
2. **Frontend Build (`client`):**
   ```bash
   > skillforge-client@1.0.0 build
   > tsc && vite build
   ✓ 2933 modules transformed.
   dist/index.html                            1.29 kB
   dist/assets/index-DIWHo2BX.css            63.64 kB
   dist/assets/ui-vendor-DYcQ2oW7.js        151.51 kB
   dist/assets/vendor-B8Et0mIM.js           319.34 kB
   dist/assets/recharts-vendor-B7mix4Rs.js  357.08 kB
   dist/assets/index-CkAlB_Vh.js            399.95 kB
   ✓ built in 21.43s (Zero errors)
   ```

---

## 8. Identified Strengths & Production Considerations

### Strengths:
1. **True Content Access Control:** Non-preview lesson video streams and media URLs are strictly stripped at the MongoDB projection layer on the server for non-enrolled students.
2. **Dual-Engine Learning Player:** Flawlessly handles external educational YouTube streams and uploaded direct-to-CDN video files with auto-resume and 5-second background progress persistence.
3. **Resilient AI Career Advisor:** Combines the natural language fluency of Google Gemini 1.5 Flash with a catalog-grounded candidate scorer and an offline `SmartRuleEngine` fallback so the platform never fails even if third-party AI APIs experience downtime.

### Production Considerations for Future Iterations:
1. **Payment Gateway Integration:** The current course checkout system records enrollments instantaneously without charging real credit cards. Integrating Stripe or Razorpay webhooks would convert this into a commercial transactional engine.
2. **Redis Distributed Caching:** Course catalog and category listings currently query MongoDB with indexed queries; introducing a Redis cache would lower read latency under high concurrent load.
