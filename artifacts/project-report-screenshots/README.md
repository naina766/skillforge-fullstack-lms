# SkillForge LMS — Project Report Screenshots Documentation

**Live Application URL:** [https://skillforge-fullstack-lms.vercel.app/](https://skillforge-fullstack-lms.vercel.app/)  
**Target Viewport:** 1440 × 900 pixels  
**Date Captured:** October 12, 2026  
**Capture Method:** Automated browser testing against the live production deployment (Playwright / Chromium).

---

## 📸 Captured Screenshots Summary

| Filename | Page / Feature Represented | Access Level | Status | Details & Observations |
| :--- | :--- | :--- | :--- | :--- |
| `01-home-page.png` | **Home Page (Landing Page)** | Public | ✅ Captured | Hero banner, value proposition ("Learn Skills That Actually Move Your Career"), top navigation bar, global search input, and CTA buttons (*Explore All Courses*, *Join Free Live Workshop*). |
| `02-course-catalog.png` | **Course & Workshop Catalog** | Public | ✅ Captured | Course catalog with faceted filter sidebar (Learning format, skill levels), keyword search bar, sorting dropdown (*Most Popular*), and active program cards with pricing, ratings, and student counts. |
| `03-course-details.png` | **Course Details & Overview** | Public | ✅ Captured | Detailed view for *Full-Stack TypeScript SaaS Portfolio Accelerator*: syllabus modules, instructor profile (*Dr. Elena Rostova*), pricing breakdown ($149 / 25% off), key learning objectives, and enrollment CTA. |
| `04-student-dashboard.png` | **Student Dashboard** | Authenticated (`STUDENT`) | ✅ Captured | Personalized learner portal (*David Miller*): key metrics (4 Enrolled Courses, 1 Completed, 44 hrs Learning Hours, 1 Verified Certificate), and *Continue Learning* quick-resume card with 53% progress bar. |
| `05-learning-interface.png` | **Learning Interface & Video Player** | Authenticated (`STUDENT`) | ✅ Captured | In-depth lesson player for *Generative AI & LLM Integration for Web Apps*: integrated YouTube educational player (Andrej Karpathy LLM lecture), curriculum drawer with 27 modular lessons, and real-time progress indicator. |
| `06-ai-career-mentor.png` | **AI Career Mentor Interface** | Authenticated (`STUDENT`) | ✅ Captured | Genuine interactive AI session: generative career roadmap, customized portfolio project blueprints (*Full-Stack Learning Platform with Auth & RBAC*, *Multi-Tenant SaaS*), immediate next best action, and tailored course recommendations. |
| `07-instructor-dashboard.png` | **Instructor Studio Overview** | Authenticated (`INSTRUCTOR`) | ✅ Captured | Creator command center (*Dr. Elena Rostova*): metrics (12 Authored Programs, 37 Active Learners, $3,533 Total Gross Earnings), Quick Action cards, and complete management table of authored courses with edit/unpublish controls. |
| `08-course-creation.png` | **Course Creation Wizard** | Authenticated (`INSTRUCTOR`) | ✅ Captured | Multi-step curriculum authoring wizard (Step 1 of 5: Course Basic Information): Title, live URL slug generator, short description tagline, full curriculum description, type format, category, and skill level selectors. |
| `09-admin-dashboard.png` | **Platform Admin Control Center** | Authenticated (`ADMIN`) | ✅ Captured | High-level administrative analytics (*Alexander Vance*): platform student count (37), instructors (2), active enrollments (37), gross platform revenue ($3,533), monthly signup growth chart, category distribution histogram, and Swagger API docs shortcut. |
| `10-authentication.png` | **Authentication (Sign-In) Page** | Public | ✅ Captured | Clean authentication gateway: email/password fields, quick-fill demo buttons for development testing, validation state, and secure sign-in CTA without exposing pre-filled credentials. |

---

## 🔒 Verification & Authenticity Confirmation

1. **Genuine Application Source:** Every screenshot in this directory was captured directly from the running production instance hosted at `https://skillforge-fullstack-lms.vercel.app/`. No placeholder graphics, mockup tools, or UI fabrication was used.
2. **Real Database Data:** The dashboard metrics, enrolled courses, student records, and instructor listings reflect real seeded and live records hosted in the production database cluster.
3. **Authentication Compliance:** Authenticated views were accessed using official platform demo credentials (`student@skillforge.dev`, `instructor@skillforge.dev`, `admin@skillforge.dev`) without bypassing role-based access control (RBAC). No credentials or sensitive tokens are exposed in any captured image.
4. **Resolution Standards:** All captures were taken at desktop dimensions (1440 × 900 px) with fully rendered DOM states, loaded stylesheets, and complete dynamic elements.

---

## ⚠️ Notes & Limitations Encountered

- **Single-Page App Session Hydration:** In-memory client authentication tokens are refreshed via HTTP cookies; navigation between protected role routes was executed using React Router in-app navigation to ensure seamless authentication continuity.
- **AI Career Mentor Generative Response:** Responses from the AI Career Mentor are dynamically generated via Gemini API integration; the captured screenshot documents a live career query response with real catalog-grounded course suggestions and project roadmaps.
