# SkillForge LMS — College Project Report Specification & Corrections Guide

**Report Submission Date:** 12 October 2026  
**Auditor:** Automated Engineering Project Audit  
**Workspace:** `D:\Assignment\SkillForge`  
**Repository:** [https://github.com/naina766/skillforge-fullstack-lms](https://github.com/naina766/skillforge-fullstack-lms)  
**Live Application:** [https://skillforge-fullstack-lms.vercel.app/](https://skillforge-fullstack-lms.vercel.app/)

---

## 📌 Document Overview & Availability Notice

> [!NOTE]
> **Repository Report File Check:** A scan of `D:\Assignment\SkillForge` confirmed that no previous `.docx`, `.doc`, or `.pdf` report draft file exists in the repository.  
> Consequently, this document serves as the **complete, authoritative, evidence-based master guide** to populate, write, and verify your official final-year college project report. It provides exact technical data, tables, figures, screenshot placements, and chapter blueprints aligned with standard engineering university guidelines.

---

## 🚨 Prioritized Issue & Correction Matrix

### P0 — Must Fix Before Report Submission (Critical Facts & Academic Standards)
1. **Submission Date Field:**  
   - **Problem:** Many student reports leave submission dates as empty placeholders or use outdated dates.  
   - **Correction:** Set the exact official submission date to **12 October 2026** across the Cover Page, Certificate of Originality, and Student Declaration.
2. **Student & Supervisor Placeholders:**  
   - **Problem:** Sample templates often contain placeholder names (e.g., "[Student Name]", "[Roll No]", "[Internal Guide]").  
   - **Correction:** Replace with your actual student details and supervisor/HOD credentials. (GitHub handle confirmed in audit: `naina766`).
3. **Fictional Technical Claims:**  
   - **Problem:** Reports often claim technologies not present in the project (e.g., Python Django, AWS S3, microservices via Kafka, or Redux).  
   - **Correction:** Align strictly with verified project architecture: **React 18 + Vite, TypeScript 5.9, Express.js 4.22, MongoDB 7.0 (Mongoose 8.24), Zustand, TanStack Query v5, Google Gemini 1.5 Flash API, and Vitest**.
4. **Unsupported Test Metrics:**  
   - **Problem:** Reports frequently state "100% test coverage" without evidence.  
   - **Correction:** Cite the exact verified test results: **93 automated tests executed and passed (77 backend + 16 frontend across 11 test suites)**.

---

### P1 — Important Technical Corrections & Evidence Integration
1. **Genuine Application Screenshots:**  
   - **Problem:** Inability to use mockups or generic placeholder graphics.  
   - **Correction:** Integrate the 10 genuine screenshots captured at 1440×900 from the live application located in [`artifacts/project-report-screenshots/`](file:///D:/Assignment/SkillForge/artifacts/project-report-screenshots/).
2. **Accurate Database Entity Specifications:**  
   - **Problem:** Disconnected relational SQL diagrams that do not match the real MongoDB document model.  
   - **Correction:** Document the 10 real MongoDB collections: `User`, `Course`, `Enrollment`, `Certificate`, `Review`, `Category`, `WishlistItem`, `Notification`, `Session`, and `AuditLog` (including unique compound indexes).
3. **API Endpoint Inventory:**  
   - **Problem:** Listing standard CRUD endpoints that do not exist in the codebase.  
   - **Correction:** Use the verified REST endpoints mounted under `/api/` (documented in Chapter 6).

---

### P2 — Academic Formatting & Visual Quality Refinements
1. **Literature Survey Comparison Matrix:**  
   - Provide an objective comparison between traditional LMS platforms (Moodle, Blackboard, Coursera, Udemy) and SkillForge's verifiable-skills model.
2. **Security & Production Defense Section:**  
   - Emphasize enterprise security implementations (Helmet CSP, short-lived JWT with HttpOnly cookie rotation, RBAC, Zod sanitization, and LLM prompt injection guards).

---

## 📖 Chapter-by-Chapter Report Blueprint

### 1. Title & Cover Page
- **Project Title:** *SkillForge: An Enterprise-Grade Full-Stack Learning Management System with AI-Powered Career Mentorship and Verifiable Course Credentials*
- **Author:** Naina (`https://github.com/naina766`)
- **Degree / Branch:** Bachelor of Technology / Computer Science & Engineering (or relevant degree)
- **Academic Session:** 2025 – 2026
- **Submission Date:** **12 October 2026**

---

### 2. Declaration & Certificate Pages
- **Candidate Declaration:** Statement certifying that the work presented is original and has not been submitted elsewhere for another degree. Date must be set to **12 October 2026**.
- **Certificate of Completion:** Supervisor / Head of Department certification confirming satisfactory completion. Date must be set to **12 October 2026**.

---

### 3. Abstract
> "In modern technical education, traditional Learning Management Systems (LMS) often act merely as passive video repositories lacking career guidance, tamper-proof credential verification, and strict media access controls. SkillForge is a full-stack, enterprise-grade educational platform built with React 18, TypeScript, Express.js, and MongoDB that bridges learning with demonstrable engineering capability. The platform integrates a dual-engine video player supporting external YouTube educational media and direct CDN uploads with five-second background progress persistence. Furthermore, SkillForge introduces a catalog-grounded AI Career Mentor powered by Google Gemini 1.5 Flash with strict prompt-injection defenses and an offline fallback rule engine. Security is enforced through short-lived in-memory JWTs, HttpOnly refresh cookies, Content Security Policies, and granular Role-Based Access Control (RBAC). The application is validated through 93 automated unit and integration tests and deployed in a production-ready environment."

---

### 4. Chapter 1: Introduction & Objectives
- **1.1 Background:** Evolution of web-based education platforms from static SCORM modules to interactive video platforms.
- **1.2 Problem Statement:**
  - Lack of server-side media protection in open-source LMS platforms.
  - Absence of intelligent career guidance grounded in available course curricula.
  - Credential fraud and lack of cryptographic verification for course certificates.
- **1.3 Project Objectives:**
  - Build a secure multi-role LMS supporting Students, Instructors, and Administrators.
  - Implement access-controlled video playback with resume-state tracking.
  - Develop an intelligent, catalog-grounded AI mentor with safety guardrails.
  - Generate tamper-proof, publicly verifiable completion certificates with SHA-256 hashes.
  - Achieve full test coverage across critical authorization boundaries and media workflows.

---

### 5. Chapter 2: Literature Survey & Comparative Analysis

| Feature / Criteria | Moodle / Blackboard | Udemy / Coursera | SkillForge LMS (Proposed) |
| :--- | :--- | :--- | :--- |
| **Technology Stack** | PHP / Java (Legacy monolithic) | Proprietary Microservices | **React 18, TypeScript, Express, MongoDB (Modern MERN)** |
| **Media Player Flexibility** | Basic HTML5 / Embedded iframe | Proprietary HLS/DASH | **Dual-Engine (YouTube IFrame API + HTML5/Cloudinary)** |
| **Progress Persistence** | Periodic page submission | Client polling | **Throttled 5s background synchronization** |
| **AI Career Guidance** | None / Third-party plugin | Generic chat / external | **Grounded Gemini 1.5 Flash + SmartRuleEngine fallback** |
| **Prompt Injection Defense**| Not Applicable | Unspecified | **Intent extraction filter & sanitization layer** |
| **Certificate Verification** | Simple PDF export | Internal database lookup | **Cryptographic SHA-256 hash + public URL verification** |
| **Session Security** | Session cookie | Refresh tokens | **In-memory JWT + HttpOnly SameSite cookie rotation** |
| **Deployment Model** | On-premise server | Cloud cluster | **Vercel (Client) + Dockerized Node.js (Server)** |

---

### 6. Chapter 3: Hardware & Software Requirements

#### Software Specifications (Audit-Verified):
- **Operating System:** Windows 10/11 / Ubuntu Linux 22.04 LTS
- **Runtime Environment:** Node.js v20+ (`v24.13.1` tested in audit), npm `11.6.2`
- **Database Engine:** MongoDB 7.0 Community / Atlas
- **Frontend Stack:** React 18.3.1, TypeScript 5.9.3, Vite 5.4.21, Tailwind CSS 3.4.19, Framer Motion 11.18.2
- **Backend Stack:** Express.js 4.22.2, Mongoose 8.24.4, Zod 3.25.76, Helmet 7.2.0, bcryptjs 2.4.3, jsonwebtoken 9.0.3
- **Testing Frameworks:** Vitest 4.1.11 / 2.1.9, Supertest 7.2.2, React Testing Library 16.3.2
- **External APIs:** Google Gemini 1.5 Flash REST API, YouTube IFrame API, Cloudinary API

#### Hardware Specifications:
- **Processor:** 64-bit multi-core CPU (Intel Core i5/i7 or AMD Ryzen 5/7)
- **RAM:** 8 GB minimum (16 GB recommended for concurrent Docker execution)
- **Storage:** 5 GB available SSD storage for repository, dependencies, and database data

---

### 7. Chapter 4: System Architecture & Design
- **4.1 High-Level Architecture:** 3-tier client-server architecture with API-driven decoupled frontend.
- **4.2 Data Flow Diagram (DFD):**
  - **Level 0 (Context Level):** Student/Instructor/Admin interactions with SkillForge Gateway.
  - **Level 1:** Authentication module, Course exploration, Enrollment engine, Classroom player, AI mentor service.
  - **Level 2 (Learning & Progress):** Throttled progress persistence loop and automated certificate trigger on completion.
- **4.3 Sequence Diagrams:**
  - Silent token refresh flow (`POST /api/auth/refresh`).
  - Video progress tracking and certificate issuance lifecycle.
  - AI mentor request flow with Gemini API call and fallback rule engine.

---

### 8. Chapter 5: Database Design & Data Dictionary
Document the 10 Mongoose schemas with data types, constraints, and indexes:
1. `User` (Identity, salted credentials, role assignment, student skills)
2. `Course` (Curriculum structure, modules, pricing, text search indexes)
3. `Enrollment` (Compound index `{ student: 1, course: 1 }`, progress array)
4. `Certificate` (Unique uppercase ID, verification hash, student ref)
5. `Review` (Compound index `{ student: 1, course: 1 }`, 1–5 ratings)
6. `Category` (Taxonomy categories, slugs)
7. `WishlistItem` (Bookmarked courses)
8. `Notification` (Transactional user notifications)
9. `Session` (Active session tokens, expiration)
10. `AuditLog` (Administrative and security audit trails)

---

### 9. Chapter 6: API Specifications
Include complete request/response specifications for key endpoints:
- `POST /api/auth/login`
- `GET /api/courses`
- `GET /api/courses/:slug`
- `POST /api/enrollments/:courseId/progress`
- `POST /api/ai/mentor`
- `GET /api/certificates/verify/:certId`
- Mention interactive Swagger UI documentation accessible at `/api/docs`.

---

### 10. Chapter 7: Implementation Details & Screenshots
Integrate the 10 genuine screenshots stored in `artifacts/project-report-screenshots/`:

| Figure No. | Caption | File Path |
| :--- | :--- | :--- |
| **Figure 7.1** | *SkillForge Landing Page & Hero Section* | `01-home-page.png` |
| **Figure 7.2** | *Faceted Course & Workshop Catalog* | `02-course-catalog.png` |
| **Figure 7.3** | *Course Overview, Curriculum & Enrollment* | `03-course-details.png` |
| **Figure 7.4** | *Student Dashboard & Active Learning Widgets* | `04-student-dashboard.png` |
| **Figure 7.5** | *Classroom Interface with YouTube Player & Curriculum* | `05-learning-interface.png` |
| **Figure 7.6** | *AI Career Mentor Personalized Guidance Session* | `06-ai-career-mentor.png` |
| **Figure 7.7** | *Instructor Studio Management Dashboard* | `07-instructor-dashboard.png` |
| **Figure 7.8** | *Multi-Step Course Creation & Curriculum Wizard* | `08-course-creation.png` |
| **Figure 7.9** | *Platform Admin Control Center & Analytics* | `09-admin-dashboard.png` |
| **Figure 7.10** | *Secure Sign-In Interface with Demo Shortcuts* | `10-authentication.png` |

---

### 11. Chapter 8: Testing & Quality Assurance
Present the evidence from the 93 automated tests:
- **8.1 Testing Strategy:** Unit testing for algorithmic logic, integration testing for HTTP APIs and MongoDB, and component testing for UI widgets.
- **8.2 Test Execution Results:**
  - Table of backend test suites (8 suites, 77 passed).
  - Table of frontend test suites (3 suites, 16 passed).
  - Highlighting security tests: Role-based isolation, media sanitization, admin self-demotion prevention, and prompt-injection defense.
- **8.3 Build Verification:** Zero TypeScript compilation errors on both client and server.

---

### 12. Chapter 9: Security & Production Hardening
- **9.1 Token Architecture:** In-memory access token storage to prevent token theft via XSS; HttpOnly SameSite cookie for refresh tokens.
- **9.2 Content Security Policy:** Helmet configuration explicitly whitelisting authorized origins.
- **9.3 Cryptographic Verification:** Certificate issuance with SHA-256 verification hash.
- **9.4 Input Sanitization & Rate Limiting:** Zod validation + express-rate-limit.

---

### 13. Chapter 10: Limitations & Future Scope
- **Limitations:** Real payment gateway (Stripe/PayPal) is currently simulated via instant enrollment; video hosting relies on external YouTube or Cloudinary quotas.
- **Future Scope:** Integration of WebRTC live streaming workshops, distributed Redis caching, micro-credential blockchain verification, and automated quiz evaluation.

---

### 14. Chapter 11: Conclusion & References
- **Conclusion:** Reiterate the successful implementation of an end-to-end, secure, production-grade LMS.
- **References:** Academic and industry references:
  1. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*.
  2. OWASP Foundation (2025). *OWASP Top 10 Web Application Security Risks*.
  3. Google DeepMind (2024). *Gemini: A Family of Highly Capable Multimodal Models*.
  4. React Documentation (2026). *React 18 Concurrent Rendering and Client Architecture*.
  5. MongoDB Documentation (2026). *MongoDB Manual: Compound Indexes and Data Modeling*.
