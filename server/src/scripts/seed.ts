import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { CertificateService } from '../services/certificate.service';
import { ReviewService } from '../services/review.service';
import { createSlug } from '../utils/slugify';
import { env } from '../config/env';
import { logger } from '../config/logger';

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    logger.info('Cleaned existing database collections.');

    // 1. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, salt);
    const instructorPasswordHash = await bcrypt.hash(env.SEED_INSTRUCTOR_PASSWORD, salt);
    const studentPasswordHash = await bcrypt.hash(env.SEED_STUDENT_PASSWORD, salt);

    const admin = await User.create({
      name: 'Alexander Vance (Admin)',
      email: 'admin@skillforge.dev',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      bio: 'Platform Lead Architect & SkillForge Administrator',
      skills: ['DevOps', 'Security', 'Cloud Architecture'],
    });

    const instructor1 = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'instructor@skillforge.dev',
      passwordHash: instructorPasswordHash,
      role: 'INSTRUCTOR',
      bio: 'Ex-Principal Engineer & Staff Software Architect. 12+ years building distributed scale systems.',
      skills: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'System Design'],
    });

    const instructor2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.instructor@skillforge.dev',
      passwordHash: instructorPasswordHash,
      role: 'INSTRUCTOR',
      bio: 'Senior Cloud Solutions Architect & DevOps Specialist.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    });

    const studentMain = await User.create({
      name: 'David Miller',
      email: 'student@skillforge.dev',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      bio: 'Aspiring Full-Stack Software Engineer looking to land top-tier tech roles.',
      skills: ['JavaScript', 'HTML/CSS'],
      interests: ['Web Development', 'AI & Machine Learning'],
    });

    // Create 35 diverse student accounts for realistic reviews & enrollments
    const additionalStudentsData = [
      { name: 'Emily Chen', email: 'emily@skillforge.dev' },
      { name: 'Marcus Johnson', email: 'marcus@skillforge.dev' },
      { name: 'Sophia Patel', email: 'sophia@skillforge.dev' },
      { name: 'Liam Wilson', email: 'liam@skillforge.dev' },
      { name: 'Olivia Taylor', email: 'olivia@skillforge.dev' },
      { name: 'Noah Anderson', email: 'noah@skillforge.dev' },
      { name: 'Ava Thomas', email: 'ava@skillforge.dev' },
      { name: 'Ethan Jackson', email: 'ethan@skillforge.dev' },
      { name: 'Isabella White', email: 'isabella@skillforge.dev' },
      { name: 'Lucas Martin', email: 'lucas@skillforge.dev' },
      { name: 'Mia Thompson', email: 'mia@skillforge.dev' },
      { name: 'Benjamin Garcia', email: 'benjamin@skillforge.dev' },
      { name: 'Charlotte Martinez', email: 'charlotte@skillforge.dev' },
      { name: 'Alexander Robinson', email: 'alexander@skillforge.dev' },
      { name: 'Amelia Clark', email: 'amelia@skillforge.dev' },
      { name: 'Daniel Rodriguez', email: 'daniel@skillforge.dev' },
      { name: 'Harper Lewis', email: 'harper@skillforge.dev' },
      { name: 'Matthew Lee', email: 'matthew@skillforge.dev' },
      { name: 'Evelyn Walker', email: 'evelyn@skillforge.dev' },
      { name: 'Henry Hall', email: 'henry@skillforge.dev' },
      { name: 'Abigail Allen', email: 'abigail@skillforge.dev' },
      { name: 'Sebastian Young', email: 'sebastian@skillforge.dev' },
      { name: 'Emily Hernandez', email: 'emily.h@skillforge.dev' },
      { name: 'Jack King', email: 'jack@skillforge.dev' },
      { name: 'Ella Wright', email: 'ella@skillforge.dev' },
      { name: 'Samuel Lopez', email: 'samuel@skillforge.dev' },
      { name: 'Scarlett Hill', email: 'scarlett@skillforge.dev' },
      { name: 'David Scott', email: 'david@skillforge.dev' },
      { name: 'Grace Green', email: 'grace@skillforge.dev' },
      { name: 'Joseph Adams', email: 'joseph@skillforge.dev' },
      { name: 'Chloe Baker', email: 'chloe@skillforge.dev' },
      { name: 'Carter Gonzalez', email: 'carter@skillforge.dev' },
      { name: 'Zoey Nelson', email: 'zoey@skillforge.dev' },
      { name: 'Owen Carter', email: 'owen@skillforge.dev' },
      { name: 'Penelope Mitchell', email: 'penelope@skillforge.dev' },
    ];

    const additionalStudents = await User.insertMany(
      additionalStudentsData.map((s) => ({
        ...s,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        skills: ['JavaScript', 'React', 'Node.js'],
      }))
    );

    const allStudents = [studentMain, ...additionalStudents];
    logger.info(`Created ${1 + 2 + additionalStudents.length} Demo User Accounts.`);

    // 2. Create Categories
    const categoriesData = [
      { name: 'Web Development', description: 'Modern frontend, backend, and full-stack frameworks.', icon: 'Code' },
      { name: 'Cloud & DevOps', description: 'Docker, Kubernetes, AWS, and production deployment pipelines.', icon: 'Cloud' },
      { name: 'AI & Machine Learning', description: 'Generative AI, LLMs, Prompt Engineering, and Python Data Science.', icon: 'Cpu' },
      { name: 'Data Engineering', description: 'BigQuery, SQL analytics, data pipelines, and warehousing.', icon: 'Database' },
      { name: 'Cyber Security', description: 'Ethical hacking, application security, and penetration testing.', icon: 'Shield' },
      { name: 'UI/UX Design', description: 'Figma, user research, wireframing, and modern design systems.', icon: 'Figma' },
      { name: 'Mobile Development', description: 'React Native, Flutter, and cross-platform mobile apps.', icon: 'Smartphone' },
      { name: 'Product Management', description: 'Agile development, roadmap design, and product analytics.', icon: 'Layers' },
      { name: 'Blockchain & Web3', description: 'Solidity, smart contracts, and decentralized applications.', icon: 'Globe' },
      { name: 'Career Bootcamps', description: 'Resume building, portfolio creation, and tech interview prep.', icon: 'Briefcase' },
    ];

    const categories = await Category.insertMany(
      categoriesData.map((c) => ({
        ...c,
        slug: createSlug(c.name),
      }))
    );

    const categoryMap = new Map(categories.map((c) => [c.name, c._id]));
    logger.info(`Created ${categories.length} Categories.`);

    // 3. Create 20+ Realistic Courses & Workshops
    const webDevId = categoryMap.get('Web Development');
    const cloudDevOpsId = categoryMap.get('Cloud & DevOps');
    const aiId = categoryMap.get('AI & Machine Learning');
    const dataId = categoryMap.get('Data Engineering');

    // Mapped verified educational YouTube videos (Short 5-15 minute focused lessons in English / Hindi)
    const educationalVideos: Record<string, string[]> = {
      'Production-Grade Node.js & Microservices Masterclass': ['ENrzD9HAZK4', 'L72fhGm1tfE', 'lsMQRae_g14', 'WDrU305J1yw'],
      'Live Workshop: React 18 & TanStack Query v5 Patterns': ['r8Dg0KVF36Y', '_ngCLZ5Iz-E', 'bpVRWrrfM1M'],
      'Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp': ['gAkwW2tuIqE', 'X48VuDVv0do', 'R8_veQiYtZA'],
      'Generative AI & LLM Integration for Web Apps': ['zjkBMFhNj_g', 'sPjcmsY86tM', 'g1b6k7f6p34'],
      'Full-Stack TypeScript SaaS Portfolio Accelerator': ['m8Icp_Cid5o', 'd56mG7DezGs', 'mbsmsi7l3r4', 'gAkwW2tuIqE'],
      'Advanced MongoDB Aggregation Pipelines': ['vx1C8eyiqkc', 'B0ZpP_gC31g'],
      'Cyber Security Essentials & Web Penetration Testing': ['4X0pH_2D1b8', 'ciNHn38EyRc'],
      'Figma to Production React Components Design System': ['NrKX46DzkGQ', 'pfaSUYaSgRo'],
      'React Native & Expo Cross-Platform Masterclass': ['gvkqT_Uoahw', 'mOIdb3eT63w'],
      'Python Data Science & Automated Analytics': ['dcqPhpY7tWk', 'QUT1VHiLmmI'],
      'Solidity Smart Contracts & Web3 DApps': ['ZE2HxTmxfrI', 'ipwxYa-F1uY'],
      'System Design & Micro-Architecture for Tech Interviews': ['i53Gi_K3o7I', '1xo-0gCVhTU'],
      'Tailwind CSS & Framer Motion UI Animation Techniques': ['mr15Xzb1Ook', 'znbCa4urrWk'],
      'GraphQL & Apollo Server Full-Stack Development': ['eIQh02xuVGs', 'ZQLxZ_rTz58'],
      'BigQuery & Data Warehouse Infrastructure': ['d3525281Pfg', '0oE4vBwR2b4'],
      'NestJS & Enterprise TypeScript Microservices': ['0M8AYU_hPas', 'GHTA143_b-s'],
      'Rust Programming for High Performance Web Backends': ['5C_HPTJg5ek', '8M0QfLUDaaA'],
      'Agile Product Management & Product Discovery': ['2Vt7Ik8Ublw', 'gD_fEaFjC4I'],
      'Automated End-to-End Testing with Playwright & Cypress': ['dTR72Z_QY6Y', 'r38_1Wz699c'],
      'Next.js 14 App Router & Server Actions Architecture': ['gSSsZReIFRk', 'dDpZfVdISvU'],
    };

    const defaultFallbackVideos = ['m8Icp_Cid5o', 'ENrzD9HAZK4', 'r8Dg0KVF36Y', 'gAkwW2tuIqE', 'zjkBMFhNj_g'];

    const attachVideoMetadata = (courseTitle: string, lesson: any, lessonIdx: number) => {
      if (lesson.type === 'VIDEO') {
        const pool = educationalVideos[courseTitle] || defaultFallbackVideos;
        const videoId = pool[lessonIdx % pool.length] || 'm8Icp_Cid5o';
        return {
          ...lesson,
          videoSource: 'YOUTUBE',
          videoStatus: 'READY',
          youtubeVideoId: videoId,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
      return {
        ...lesson,
        videoSource: 'NONE',
        videoStatus: 'READY',
      };
    };

    const coursesData: any[] = [
      {
        title: 'Production-Grade Node.js & Microservices Masterclass',
        shortDescription: 'Build scalable REST APIs, micro-architectures, JWT authentication, and MongoDB index patterns.',
        description: 'Comprehensive deep-dive into building production-ready Node.js applications with Express, TypeScript, Mongoose, and Docker. Master clean architecture and performance tuning.',
        type: 'COURSE',
        category: webDevId,
        instructor: instructor1._id,
        level: 'INTERMEDIATE',
        duration: 720,
        price: 99,
        discountedPrice: 79,
        skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'JWT', 'REST API'],
        prerequisites: ['Basic JavaScript ES6+'],
        learningOutcomes: ['Build enterprise REST APIs in TypeScript', 'Implement JWT Refresh Token rotation', 'Optimize MongoDB database queries'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: 4.9,
        reviewCount: 18,
        enrollmentCount: 42,
        curriculum: [
          {
            title: 'Module 1: Monolithic Architecture & TypeScript Setup',
            order: 1,
            lessons: [
              { title: '1. Course Orientation & Architecture Breakdown', duration: 600, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. Setting Up Express & TypeScript Monorepo', duration: 1200, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Clean Architecture & Layer Separation', duration: 900, order: 3, isPreview: false, type: 'ARTICLE' },
            ].map((l, i) => attachVideoMetadata('Production-Grade Node.js & Microservices Masterclass', l, i)),
          },
          {
            title: 'Module 2: MongoDB Indexing & Mongoose Schemas',
            order: 2,
            lessons: [
              { title: '1. Designing Mongoose Models & Schemas', duration: 1500, order: 1, isPreview: false, type: 'VIDEO' },
              { title: '2. High Performance Database Index Strategies', duration: 1800, order: 2, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Production-Grade Node.js & Microservices Masterclass', l, i + 3)),
          },
        ],
      },
      {
        title: 'Live Workshop: React 18 & TanStack Query v5 Patterns',
        shortDescription: 'Interactive live workshop covering custom hooks, server-state caching, and optimistic UI updates.',
        description: 'Join live to build zero-latency user interfaces using React 18, Zustand, and TanStack Query v5. Perfect for developers looking to replace bloated Redux architectures.',
        type: 'WORKSHOP',
        category: webDevId,
        instructor: instructor1._id,
        level: 'ADVANCED',
        duration: 240,
        price: 49,
        discountedPrice: 39,
        skills: ['React 18', 'TanStack Query', 'Zustand', 'Tailwind CSS'],
        prerequisites: ['React state management experience'],
        learningOutcomes: ['Eliminate redundant API calls with Query Caching', 'Implement optimistic mutations with rollback', 'Build dark-mode glassmorphic design systems'],
        status: 'PUBLISHED',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Live Zoom Interactive Session',
        meetingUrl: 'https://skillforge.dev/zoom/workshop-react-18',
        capacity: 100,
        publishedAt: new Date(),
        rating: 4.8,
        reviewCount: 12,
        enrollmentCount: 68,
        curriculum: [
          {
            title: 'Live Workshop Schedule',
            order: 1,
            lessons: [
              { title: 'Session 1: Query Invalidation & Cache Keys', duration: 3600, order: 1, isPreview: true, type: 'VIDEO' },
              { title: 'Session 2: Zustand Global Session Sync', duration: 3600, order: 2, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Live Workshop: React 18 & TanStack Query v5 Patterns', l, i)),
          },
        ],
      },
      {
        title: 'Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp',
        shortDescription: 'Master Containerization, Helm charts, GitHub Actions, and AWS Cloud deployments.',
        description: 'Hands-on bootcamp designed to convert manual deployments into fully automated production CI/CD pipelines using GitHub Actions, Docker multi-stage builds, and Kubernetes.',
        type: 'BOOTCAMP',
        category: cloudDevOpsId,
        instructor: instructor2._id,
        level: 'INTERMEDIATE',
        duration: 900,
        price: 149,
        discountedPrice: 119,
        skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'DevOps'],
        prerequisites: ['Basic Linux terminal command knowledge'],
        learningOutcomes: ['Write multi-stage Dockerfiles', 'Automate test & build CI pipelines', 'Deploy resilience containers on Kubernetes'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: 5.0,
        reviewCount: 25,
        enrollmentCount: 89,
        curriculum: [
          {
            title: 'Module 1: Docker Containers',
            order: 1,
            lessons: [
              { title: '1. Container Fundamentals', duration: 1200, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. Multi-stage Docker Builds', duration: 1800, order: 2, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp', l, i)),
          },
        ],
      },
      {
        title: 'Generative AI & LLM Integration for Web Apps',
        shortDescription: 'Incorporate Gemini API, OpenAI embeddings, and AI chat mentors into React & Node platforms.',
        description: 'Learn how to integrate AI capabilities into modern web applications using node services, fallback providers, and structured prompt engineering.',
        type: 'COURSE',
        category: aiId,
        instructor: instructor1._id,
        level: 'BEGINNER',
        duration: 480,
        price: 89,
        discountedPrice: 69,
        skills: ['Generative AI', 'Gemini API', 'LLM', 'Node.js', 'React', 'Embeddings', 'Vector Search'],
        prerequisites: ['Basic JavaScript and React fundamentals'],
        learningOutcomes: [
          'Build intelligent AI mentor assistants and streaming interfaces',
          'Implement fallback mock AI providers and error handling',
          'Master prompt engineering, context windows and structured output',
          'Deploy production-ready full-stack AI web applications',
        ],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: 4.9,
        reviewCount: 31,
        enrollmentCount: 110,
        curriculum: [
          {
            title: 'Module 1: Generative AI & LLM Fundamentals',
            order: 1,
            lessons: [
              { title: '1. Introduction to Generative AI and LLMs', duration: 720, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. How Large Language Models Work', duration: 900, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Tokens, Context Windows and Temperature', duration: 780, order: 3, isPreview: false, type: 'VIDEO' },
              { title: '4. Prompt Engineering Fundamentals', duration: 840, order: 4, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i)),
          },
          {
            title: 'Module 2: Working with Gemini and LLM APIs',
            order: 2,
            lessons: [
              { title: '1. Setting Up Gemini API', duration: 600, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. API Requests from Node.js', duration: 840, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. System Prompts and User Prompts', duration: 720, order: 3, isPreview: false, type: 'VIDEO' },
              { title: '4. Structured LLM Responses', duration: 900, order: 4, isPreview: false, type: 'VIDEO' },
              { title: '5. Error Handling and Rate Limits', duration: 780, order: 5, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i + 4)),
          },
          {
            title: 'Module 3: Embeddings and Semantic Search',
            order: 3,
            lessons: [
              { title: '1. What Are Embeddings?', duration: 660, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. Vector Similarity Search', duration: 840, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Building a Semantic Search Pipeline', duration: 960, order: 3, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i + 9)),
          },
          {
            title: 'Module 4: AI Features in React + Node.js',
            order: 4,
            lessons: [
              { title: '1. Building an AI Chat Interface', duration: 900, order: 1, isPreview: false, type: 'VIDEO' },
              { title: '2. Streaming AI Responses', duration: 840, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Conversation History & Context', duration: 780, order: 3, isPreview: false, type: 'VIDEO' },
              { title: '4. AI Assistant UX Patterns', duration: 720, order: 4, isPreview: false, type: 'VIDEO' },
              { title: '5. Connecting React with the Node.js AI Service', duration: 900, order: 5, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i + 12)),
          },
          {
            title: 'Module 5: Production AI Architecture',
            order: 5,
            lessons: [
              { title: '1. AI Service Architecture & Fallbacks', duration: 840, order: 1, isPreview: false, type: 'VIDEO' },
              { title: '2. Prompt Validation and Safety', duration: 720, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Handling Hallucinations', duration: 780, order: 3, isPreview: false, type: 'VIDEO' },
              { title: '4. Authentication and Authorization for AI APIs', duration: 840, order: 4, isPreview: false, type: 'VIDEO' },
              { title: '5. Caching, Token Optimization and Monitoring', duration: 900, order: 5, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i + 17)),
          },
          {
            title: 'Module 6: Build an AI-Powered Web Application',
            order: 6,
            lessons: [
              { title: '1. End-to-End Project Architecture', duration: 960, order: 1, isPreview: false, type: 'VIDEO' },
              { title: '2. Backend Service Implementation', duration: 1080, order: 2, isPreview: false, type: 'VIDEO' },
              { title: '3. Frontend Chat & Blueprint Implementation', duration: 1020, order: 3, isPreview: false, type: 'VIDEO' },
              { title: '4. AI Mentor Integration & Testing', duration: 840, order: 4, isPreview: false, type: 'VIDEO' },
              { title: '5. Production Deployment', duration: 900, order: 5, isPreview: false, type: 'VIDEO' },
            ].map((l, i) => attachVideoMetadata('Generative AI & LLM Integration for Web Apps', l, i + 22)),
          },
        ],
      },
      {
        title: 'Full-Stack TypeScript SaaS Portfolio Accelerator',
        shortDescription: 'Build and deploy a complete production-grade SaaS application from scratch.',
        description: 'Complete hands-on project building SkillForge-like applications with React, Vite, Tailwind CSS, Express, MongoDB, and Docker.',
        type: 'COURSE',
        category: webDevId,
        instructor: instructor1._id,
        level: 'ALL_LEVELS',
        duration: 1080,
        price: 199,
        discountedPrice: 149,
        skills: ['TypeScript', 'Full-Stack', 'React', 'Node.js', 'MongoDB', 'Docker'],
        prerequisites: ['HTML, CSS, JavaScript basics'],
        learningOutcomes: ['Build portfolio-ready full-stack projects', 'Master end-to-end type safety', 'Deploy client and server to cloud platforms'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: 5.0,
        reviewCount: 45,
        enrollmentCount: 154,
        curriculum: [
          {
            title: 'Module 1: Architecture & Monorepo Setup',
            order: 1,
            lessons: [
              { title: '1. SaaS System Architecture & Design', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Deep-dive into micro-modular SaaS system design, database indexing strategies, and monorepo code structure.' },
              { title: '2. TypeScript Strict Mode & End-to-End Types', duration: 480, order: 2, isPreview: false, type: 'VIDEO', description: 'Implementing universal type interfaces shared between Express backend controllers and React frontend components.' },
            ].map((l, i) => attachVideoMetadata('Full-Stack TypeScript SaaS Portfolio Accelerator', l, i)),
          },
          {
            title: 'Module 2: Full-Stack REST API & Authentication',
            order: 2,
            lessons: [
              { title: '3. JWT Token Authentication & Rotation', duration: 720, order: 1, isPreview: false, type: 'VIDEO', description: 'Setting up secure cookie-based refresh tokens and authorization middleware with role-based access control.' },
            ].map((l, i) => attachVideoMetadata('Full-Stack TypeScript SaaS Portfolio Accelerator', l, i + 2)),
          },
          {
            title: 'Module 3: Containerization & Cloud Deployment',
            order: 3,
            lessons: [
              { title: '4. Dockerizing Full-Stack SaaS Applications', duration: 600, order: 1, isPreview: false, type: 'VIDEO', description: 'Writing multi-stage Dockerfiles and configuring production reverse proxies and CI/CD pipelines.' },
            ].map((l, i) => attachVideoMetadata('Full-Stack TypeScript SaaS Portfolio Accelerator', l, i + 3)),
          },
        ],
      },
    ];

    // Generate 15 additional courses to reach 20+ total courses
    const extraCourseTitles = [
      'Advanced MongoDB Aggregation Pipelines',
      'Cyber Security Essentials & Web Penetration Testing',
      'Figma to Production React Components Design System',
      'React Native & Expo Cross-Platform Masterclass',
      'Python Data Science & Automated Analytics',
      'Solidity Smart Contracts & Web3 DApps',
      'System Design & Micro-Architecture for Tech Interviews',
      'Tailwind CSS & Framer Motion UI Animation Techniques',
      'GraphQL & Apollo Server Full-Stack Development',
      'BigQuery & Data Warehouse Infrastructure',
      'NestJS & Enterprise TypeScript Microservices',
      'Rust Programming for High Performance Web Backends',
      'Agile Product Management & Product Discovery',
      'Automated End-to-End Testing with Playwright & Cypress',
      'Next.js 14 App Router & Server Actions Architecture',
    ];

    const uniqueThumbnailsMap: Record<string, string> = {
      'Production-Grade Node.js & Microservices Masterclass': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'Live Workshop: React 18 & TanStack Query v5 Patterns': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      'Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      'Generative AI & LLM Integration for Web Apps': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
      'Full-Stack TypeScript SaaS Portfolio Accelerator': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      'Advanced MongoDB Aggregation Pipelines': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      'Cyber Security Essentials & Web Penetration Testing': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      'Figma to Production React Components Design System': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      'React Native & Expo Cross-Platform Masterclass': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      'Python Data Science & Automated Analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      'Solidity Smart Contracts & Web3 DApps': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
      'System Design & Micro-Architecture for Tech Interviews': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      'Tailwind CSS & Framer Motion UI Animation Techniques': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      'GraphQL & Apollo Server Full-Stack Development': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'BigQuery & Data Warehouse Infrastructure': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      'NestJS & Enterprise TypeScript Microservices': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      'Rust Programming for High Performance Web Backends': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'Agile Product Management & Product Discovery': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
      'Automated End-to-End Testing with Playwright & Cypress': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      'Next.js 14 App Router & Server Actions Architecture': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    };

    // Attach unique thumbnails to initial 5 courses
    coursesData.forEach((course) => {
      course.thumbnail = uniqueThumbnailsMap[course.title] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80';
    });

    const courseCurriculumMap: Record<string, any[]> = {
      'Advanced MongoDB Aggregation Pipelines': [
        {
          title: 'Module 1: Aggregation Pipelines & Pipeline Stages',
          order: 1,
          lessons: [
            { title: '1. MongoDB Aggregation Framework Architecture', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Deep dive into pipeline stages: $match, $group, $project, and $lookup.' },
            { title: '2. Compound Index Optimization & Explain Plans', duration: 540, order: 2, isPreview: false, type: 'VIDEO', description: 'Analyze query performance with .explain("executionStats") and index coverage.' },
          ],
        },
      ],
      'Cyber Security Essentials & Web Penetration Testing': [
        {
          title: 'Module 1: Web Vulnerabilities & OWASP Standards',
          order: 1,
          lessons: [
            { title: '1. OWASP Top 10 Vulnerabilities & Prevention', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Understand critical vulnerabilities including broken access control and injection flaws.' },
            { title: '2. SQL Injection & XSS Attack Defenses', duration: 600, order: 2, isPreview: false, type: 'VIDEO', description: 'Sanitize inputs and implement Content Security Policy (CSP) headers.' },
          ],
        },
      ],
      'Figma to Production React Components Design System': [
        {
          title: 'Module 1: Design Tokens & Component Systems',
          order: 1,
          lessons: [
            { title: '1. Figma Auto-Layout & Design Tokens', duration: 660, order: 1, isPreview: true, type: 'VIDEO', description: 'Translate Figma UI frames and variables into structured CSS design tokens.' },
            { title: '2. Building Reusable Tailwind React Components', duration: 720, order: 2, isPreview: false, type: 'VIDEO', description: 'Construct atomic button, badge, modal, and form components in React.' },
          ],
        },
      ],
      'React Native & Expo Cross-Platform Masterclass': [
        {
          title: 'Module 1: Mobile Architecture & Navigation',
          order: 1,
          lessons: [
            { title: '1. React Native Core Components & Styling', duration: 480, order: 1, isPreview: true, type: 'VIDEO', description: 'Build native iOS and Android layouts using Flexbox and StyleSheet.' },
            { title: '2. File-Based Routing with Expo Router', duration: 600, order: 2, isPreview: false, type: 'VIDEO', description: 'Structure tabs, stacks, and modal navigation with Expo Router v3.' },
          ],
        },
      ],
      'Python Data Science & Automated Analytics': [
        {
          title: 'Module 1: Data Wrangling & Analytics',
          order: 1,
          lessons: [
            { title: '1. Pandas DataFrames & Filtering Essentials', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Clean, filter, and transform complex CSV and JSON datasets with Pandas.' },
            { title: '2. NumPy Array Vectorization & Math Operations', duration: 540, order: 2, isPreview: false, type: 'VIDEO', description: 'Perform high-speed vectorized operations across multi-dimensional arrays.' },
          ],
        },
      ],
      'Solidity Smart Contracts & Web3 DApps': [
        {
          title: 'Module 1: Smart Contracts Development',
          order: 1,
          lessons: [
            { title: '1. Smart Contracts & Ethereum EVM Architecture', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'How smart contracts execute on the Ethereum Virtual Machine and manage gas fees.' },
            { title: '2. Solidity Syntax & State Variable Security', duration: 720, order: 2, isPreview: false, type: 'VIDEO', description: 'Write secure ERC-20 and ERC-721 contracts with OpenZeppelin libraries.' },
          ],
        },
      ],
      'System Design & Micro-Architecture for Tech Interviews': [
        {
          title: 'Module 1: High-Scale Distributed Architecture',
          order: 1,
          lessons: [
            { title: '1. System Design: Load Balancing & Caching Layers', duration: 720, order: 1, isPreview: true, type: 'VIDEO', description: 'Design resilient distributed systems using Redis caches and NGINX load balancers.' },
            { title: '2. Monolith to Microservices Decomposition', duration: 600, order: 2, isPreview: false, type: 'VIDEO', description: 'Decompose monolithic apps using domain-driven design and event brokers.' },
          ],
        },
      ],
      'Tailwind CSS & Framer Motion UI Animation Techniques': [
        {
          title: 'Module 1: Modern Web UI & Micro-Animations',
          order: 1,
          lessons: [
            { title: '1. Tailwind CSS Utility Architecture', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Master responsive layouts, arbitrary values, and dark mode configuration.' },
            { title: '2. Framer Motion Keyframes & Gestures', duration: 600, order: 2, isPreview: false, type: 'VIDEO', description: 'Animate page transitions, exit presence, and hover physics effortlessly.' },
          ],
        },
      ],
      'GraphQL & Apollo Server Full-Stack Development': [
        {
          title: 'Module 1: GraphQL Schemas & Resolvers',
          order: 1,
          lessons: [
            { title: '1. GraphQL Architecture vs RESTful APIs', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Compare schema definition language, over-fetching elimination, and graph queries.' },
            { title: '2. Apollo Server Schemas & Resolver Chains', duration: 720, order: 2, isPreview: false, type: 'VIDEO', description: 'Write strongly typed query and mutation resolvers with Apollo Server.' },
          ],
        },
      ],
      'BigQuery & Data Warehouse Infrastructure': [
        {
          title: 'Module 1: Cloud Data Warehousing',
          order: 1,
          lessons: [
            { title: '1. Google BigQuery Architecture & SQL Execution', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Understand Dremel execution trees, slots, and columnar storage mechanics.' },
            { title: '2. Table Partitioning & Clustering Strategies', duration: 660, order: 2, isPreview: false, type: 'VIDEO', description: 'Optimize query costs and scan speeds with date partitioning and cluster keys.' },
          ],
        },
      ],
      'NestJS & Enterprise TypeScript Microservices': [
        {
          title: 'Module 1: Enterprise Microservices Architecture',
          order: 1,
          lessons: [
            { title: '1. NestJS Architecture & Dependency Injection', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Structure enterprise backends using controllers, providers, and modules.' },
            { title: '2. Controllers, Services & Custom Decorators', duration: 660, order: 2, isPreview: false, type: 'VIDEO', description: 'Implement validation pipes, guards, and interceptors across endpoints.' },
          ],
        },
      ],
      'Rust Programming for High Performance Web Backends': [
        {
          title: 'Module 1: Memory Safety & Systems Programming',
          order: 1,
          lessons: [
            { title: '1. Rust Memory Safety & Borrowing Model', duration: 480, order: 1, isPreview: true, type: 'VIDEO', description: 'Master zero-cost abstractions, references, and borrow checker guarantees.' },
            { title: '2. Ownership, Lifetimes & Thread Safety', duration: 600, order: 2, isPreview: false, type: 'VIDEO', description: 'Write fearless concurrent code with Rust Arc, Mutex, and Tokio async runtimes.' },
          ],
        },
      ],
      'Agile Product Management & Product Discovery': [
        {
          title: 'Module 1: Agile Product Strategy & Execution',
          order: 1,
          lessons: [
            { title: '1. Scrum Framework & Sprint Planning Cycles', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Master sprint ceremonies, definition of done, and velocity estimation.' },
            { title: '2. User Story Mapping & Backlog Prioritization', duration: 540, order: 2, isPreview: false, type: 'VIDEO', description: 'Organize release slices and customer journey mapping with RICE scoring.' },
          ],
        },
      ],
      'Automated End-to-End Testing with Playwright & Cypress': [
        {
          title: 'Module 1: Test Automation Engineering',
          order: 1,
          lessons: [
            { title: '1. Playwright Test Automation from Scratch', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Write end-to-end user journey tests with auto-waiting locators and fixtures.' },
            { title: '2. Cross-Browser CI/CD Testing Strategies', duration: 660, order: 2, isPreview: false, type: 'VIDEO', description: 'Execute parallel test matrices in GitHub Actions with artifact trace viewers.' },
          ],
        },
      ],
      'Next.js 14 App Router & Server Actions Architecture': [
        {
          title: 'Module 1: Server Components & Actions',
          order: 1,
          lessons: [
            { title: '1. Next.js 14 App Router & Server Components', duration: 600, order: 1, isPreview: true, type: 'VIDEO', description: 'Leverage React Server Components, streaming SSR, and suspense boundaries.' },
            { title: '2. Server Actions & Zero-API Data Mutations', duration: 720, order: 2, isPreview: false, type: 'VIDEO', description: 'Mutate database records directly from form actions without manual API routes.' },
          ],
        },
      ],
    };

    extraCourseTitles.forEach((title, idx) => {
      const catId = categories[idx % categories.length]._id;
      const type = idx % 4 === 0 ? 'WORKSHOP' : idx % 3 === 0 ? 'BOOTCAMP' : 'COURSE';
      const defaultCurriculum = [
        {
          title: 'Module 1: Core Architecture & Setup',
          order: 1,
          lessons: [
            { title: '1. Core Foundations & System Setup', duration: 600, order: 1, isPreview: true, type: 'VIDEO' },
            { title: '2. Production Implementation & Patterns', duration: 600, order: 2, isPreview: false, type: 'VIDEO' },
          ],
        },
      ];

      const customCurriculum = courseCurriculumMap[title] || defaultCurriculum;
      const curriculumWithMetadata = customCurriculum.map((mod: any) => ({
        ...mod,
        lessons: mod.lessons.map((l: any, i: number) => attachVideoMetadata(title, l, i)),
      }));

      coursesData.push({
        title,
        thumbnail: uniqueThumbnailsMap[title] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        shortDescription: `Master ${title} with practical real-world exercises and hands-on portfolio projects.`,
        description: `Comprehensive course covering ${title} best practices, production architecture patterns, and industry workflows.`,
        type,
        category: catId,
        instructor: idx % 2 === 0 ? instructor1._id : instructor2._id,
        level: idx % 3 === 0 ? 'BEGINNER' : idx % 2 === 0 ? 'INTERMEDIATE' : 'ADVANCED',
        duration: 300 + idx * 30,
        price: 49 + (idx % 5) * 20,
        discountedPrice: 39 + (idx % 5) * 15,
        skills: ['TypeScript', 'Software Engineering', 'System Design'],
        prerequisites: ['General software engineering foundation'],
        learningOutcomes: [`Master core principles of ${title}`, 'Build real portfolio assets', 'Pass technical interview assessments'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: Math.round((4.2 + (idx % 8) * 0.1) * 10) / 10,
        reviewCount: 8 + idx * 2,
        enrollmentCount: 15 + idx * 5,
        curriculum: curriculumWithMetadata,
      });
    });

    const defaultCourseThumbnails: Record<string, string> = {
      'Generative AI & LLM Integration for Web Apps': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
      'Production-Grade Node.js & Microservices Masterclass': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'Live Workshop: React 18 & TanStack Query v5 Patterns': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      'Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      'Full-Stack TypeScript SaaS Portfolio Accelerator': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      'Advanced MongoDB Aggregation Pipelines': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      'Cyber Security Essentials & Web Penetration Testing': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      'Figma to Production React Components Design System': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      'React Native & Expo Cross-Platform Masterclass': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      'Python Data Science & Automated Analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      'Solidity Smart Contracts & Web3 DApps': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
      'System Design & Micro-Architecture for Tech Interviews': 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
      'Tailwind CSS & Framer Motion UI Animation Techniques': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      'GraphQL & Apollo Server Full-Stack Development': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'BigQuery & Data Warehouse Infrastructure': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      'NestJS & Enterprise TypeScript Microservices': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      'Rust Programming for High Performance Web Backends': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
      'Agile Product Management & Product Discovery': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
      'Automated End-to-End Testing with Playwright & Cypress': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      'Next.js 14 App Router & Server Actions Architecture': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    };

    const createdCourses = await Promise.all(
      coursesData.map((c) =>
        Course.create({
          ...c,
          thumbnail: c.thumbnail || defaultCourseThumbnails[c.title] || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
          slug: createSlug(c.title),
        })
      )
    );

    logger.info(`Created ${createdCourses.length} Courses & Workshops.`);

    // 4. Create Seed Enrollments & Certificates for Demo Student
    const primaryCourse = createdCourses[0];
    const completedCourse = createdCourses[4] || createdCourses[1];

    // Active Enrollment
    await Enrollment.create({
      student: studentMain._id,
      course: primaryCourse._id,
      status: 'ACTIVE',
      progress: primaryCourse.curriculum[0]?.lessons[0]?._id ? [primaryCourse.curriculum[0].lessons[0]._id.toString()] : [],
      completedLessons: 1,
      completionPercentage: 33,
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
    });

    // Completed Enrollment with Certificate
    const completedEnrollment = await Enrollment.create({
      student: studentMain._id,
      course: completedCourse._id,
      status: 'COMPLETED',
      progress: completedCourse.curriculum[0].lessons.map((l: any) => l._id.toString()),
      completedLessons: completedCourse.curriculum[0].lessons.length,
      completionPercentage: 100,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      certificateIssued: true,
    });

    // Issue Certificate
    const cert = await CertificateService.issueCertificate(
      (studentMain._id as any).toString(),
      (completedCourse._id as any).toString()
    );

    logger.info(`Created Enrollments and Certificate (${cert.certificateId}) for student@skillforge.dev.`);

    // 5. Create Reviews & Verified Enrollments
    const aiCourse = createdCourses.find((c) => c.title === 'Generative AI & LLM Integration for Web Apps') || primaryCourse;

    const aiReviewsData = [
      { rating: 5, comment: 'Very useful course. The Gemini API and backend integration sections helped me build my first AI feature.' },
      { rating: 5, comment: 'Super practical guide on prompt engineering and structured JSON output. Solved our production formatting bugs!' },
      { rating: 5, comment: 'The vector embeddings and semantic search module was pure gold. Simple, actionable, and straight to the point.' },
      { rating: 5, comment: 'Loved how error handling and rate limit fallback mechanisms were thoroughly explained.' },
      { rating: 5, comment: 'Clean architectural approach. Integrating the streaming chat into our React app took less than an afternoon.' },
      { rating: 5, comment: 'Best Generative AI full-stack tutorial on the market right now. Hands-on coding with zero fluff.' },
      { rating: 5, comment: 'The context window and temperature tuning breakdown made everything click for our team.' },
      { rating: 5, comment: 'Clear explanations, great code structure, and realistic project blueprint. Highly recommend to web developers!' },
      { rating: 5, comment: 'The module on handling hallucinations and prompt validation gave us immense confidence for client deployments.' },
      { rating: 5, comment: 'Excellent instructor pace. The streaming responses with SSE in Node.js was exactly what I needed.' },
      { rating: 5, comment: 'Built an intelligent AI mentor into our platform following this exact architecture. 5 stars without hesitation!' },
      { rating: 5, comment: 'Comprehensive curriculum. Covers everything from fundamentals to production token caching and monitoring.' },
      { rating: 5, comment: 'Very high production quality. The code is modular, type-safe, and ready for real-world enterprise use.' },
      { rating: 5, comment: 'Helped me transition from classic CRUD apps into AI engineering. Phenomenal course!' },
      { rating: 5, comment: 'The vector similarity search pipeline alone is worth ten times the price.' },
      { rating: 5, comment: 'Superb pedagogical style. Every lesson is focused and accompanied by clear visual breakdowns.' },
      { rating: 5, comment: 'Clear, concise, and deeply practical. The Gemini API integration was effortless.' },
      { rating: 5, comment: 'Loved the conversational memory design. Solved token explosion issues for long chat sessions.' },
      { rating: 5, comment: 'Outstanding content. Replaced our outdated OpenAI wrappers with this clean multi-provider interface.' },
      { rating: 5, comment: 'Fantastic coverage of temperature, top_p, and safety settings. Essential for anyone building AI SaaS.' },
      { rating: 5, comment: 'Great depth on system prompts vs user prompts. Our response quality increased noticeably.' },
      { rating: 5, comment: 'The project blueprint is portfolio-ready. Landed my first AI engineer interview thanks to this!' },
      { rating: 5, comment: 'Engaging delivery, zero wasted time. Every 10-minute video taught a standalone production pattern.' },
      { rating: 5, comment: 'Remarkable clarity on embeddings. The semantic search queries run lightning fast.' },
      { rating: 5, comment: 'One of the best technical courses I have taken this year. The AI mentor architecture is brilliant.' },
      { rating: 5, comment: 'Top-tier instruction. The fallback mechanisms mean our app never crashes during provider outages.' },
      { rating: 5, comment: 'Loved the React hooks pattern for consuming streaming tokens smoothly.' },
      { rating: 5, comment: 'Clear, modern, and practical. Everything you need to know about LLMs in web development.' },
      { rating: 4, comment: 'Great curriculum and clear examples. Would love an extra lesson on multi-modal image inputs.' },
      { rating: 4, comment: 'Very solid foundation in Gemini API and prompt design. Highly recommended for junior and mid engineers.' },
      { rating: 4, comment: 'Awesome course! Clear code samples and easy to follow. A few extra deployment examples would make it perfect.' },
    ];

    // Seed 31 enrollments & reviews for Generative AI course
    for (let i = 0; i < aiReviewsData.length && i < allStudents.length; i++) {
      const student = allStudents[i];
      const revData = aiReviewsData[i];

      // Ensure student is enrolled
      await Enrollment.findOneAndUpdate(
        { student: student._id, course: aiCourse._id },
        {
          student: student._id,
          course: aiCourse._id,
          status: 'ACTIVE',
          progress: [],
          completedLessons: Math.floor(Math.random() * 8) + 1,
          completionPercentage: Math.floor(Math.random() * 50) + 20,
          startedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          lastAccessedAt: new Date(),
        },
        { upsert: true }
      );

      // Create Review
      await Review.findOneAndUpdate(
        { student: student._id, course: aiCourse._id },
        {
          student: student._id,
          course: aiCourse._id,
          rating: revData.rating,
          comment: revData.comment,
          isModerated: true,
        },
        { upsert: true }
      );
    }

    // Seed reviews for other key courses
    for (let i = 0; i < 5; i++) {
      await Review.findOneAndUpdate(
        { student: additionalStudents[i]._id, course: primaryCourse._id },
        {
          student: additionalStudents[i]._id,
          course: primaryCourse._id,
          rating: 4 + (i % 2),
          comment: 'Great practical insights. Loved the clean TypeScript separation and Docker setup.',
          isModerated: true,
        },
        { upsert: true }
      );
    }

    // Recalculate ratings for all courses to synchronize MongoDB source of truth
    for (const c of createdCourses) {
      await ReviewService.recalculateCourseRating((c._id as any).toString());
    }

    logger.info(`Created 31 Verified Reviews for ${aiCourse.title} and synchronized course rating aggregates.`);

    // 6. Create Notifications
    await Notification.create({
      user: studentMain._id,
      title: 'Welcome to SkillForge! 🚀',
      message: 'Explore 20+ courses, enroll in live workshops, and accelerate your software engineering career.',
      type: 'SYSTEM',
      isRead: true,
    });

    await Notification.create({
      user: studentMain._id,
      title: 'Certificate Issued! 🎓',
      message: `Congratulations! Your certificate for "${completedCourse.title}" is ready to view and share.`,
      type: 'CERTIFICATE',
      isRead: false,
      link: '/dashboard/certificates',
    });

    logger.info('Created Initial Notifications.');
    logger.info('=====================================================');
    logger.info('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('-----------------------------------------------------');
    logger.info('DEMO ACCOUNTS:');
    logger.info(`ADMIN:      admin@skillforge.dev      / ${env.SEED_ADMIN_PASSWORD}`);
    logger.info(`INSTRUCTOR: instructor@skillforge.dev / ${env.SEED_INSTRUCTOR_PASSWORD}`);
    logger.info(`STUDENT:    student@skillforge.dev    / ${env.SEED_STUDENT_PASSWORD}`);
    logger.info('=====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(error, 'Database Seeding Failed');
    process.exit(1);
  }
};

seedDatabase();
