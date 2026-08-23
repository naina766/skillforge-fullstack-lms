import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { CertificateService } from '../services/certificate.service';
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

    // Create 9 additional student accounts
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
    ];

    const additionalStudents = await User.insertMany(
      additionalStudentsData.map((s) => ({
        ...s,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        skills: ['JavaScript', 'React'],
      }))
    );

    const allStudents = [studentMain, ...additionalStudents];
    logger.info(`Created ${1 + 2 + 10} Demo User Accounts.`);

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
            ],
          },
          {
            title: 'Module 2: MongoDB Indexing & Mongoose Schemas',
            order: 2,
            lessons: [
              { title: '1. Designing Mongoose Models & Schemas', duration: 1500, order: 1, isPreview: false, type: 'VIDEO' },
              { title: '2. High Performance Database Index Strategies', duration: 1800, order: 2, isPreview: false, type: 'VIDEO' },
            ],
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
            ],
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
            ],
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
        skills: ['Generative AI', 'Gemini API', 'LLM', 'Node.js', 'React'],
        prerequisites: ['Basic JavaScript'],
        learningOutcomes: ['Build intelligent AI mentor assistants', 'Implement fallback mock AI providers', 'Handle rate limits and API failures'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        rating: 4.9,
        reviewCount: 31,
        enrollmentCount: 110,
        curriculum: [
          {
            title: 'Module 1: AI Service Abstraction',
            order: 1,
            lessons: [
              { title: '1. Designing AIService Interfaces', duration: 1200, order: 1, isPreview: true, type: 'VIDEO' },
            ],
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
            title: 'Module 1: Architecture & Data Models',
            order: 1,
            lessons: [
              { title: '1. SaaS System Design', duration: 1500, order: 1, isPreview: true, type: 'VIDEO' },
            ],
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
      'Generative AI & LLM Integration for Web Apps': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
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

    extraCourseTitles.forEach((title, idx) => {
      const catId = categories[idx % categories.length]._id;
      const type = idx % 4 === 0 ? 'WORKSHOP' : idx % 3 === 0 ? 'BOOTCAMP' : 'COURSE';
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
        curriculum: [
          {
            title: 'Module 1: Fundamentals & Getting Started',
            order: 1,
            lessons: [
              { title: '1. Introduction & Overview', duration: 900, order: 1, isPreview: true, type: 'VIDEO' },
              { title: '2. Core Principles & Setup', duration: 1200, order: 2, isPreview: false, type: 'VIDEO' },
            ],
          },
        ],
      });
    });

    const createdCourses = await Promise.all(
      coursesData.map((c) =>
        Course.create({
          ...c,
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

    // 5. Create Reviews
    await Review.create({
      student: studentMain._id,
      course: completedCourse._id,
      rating: 5,
      comment: 'Exceptional course! The modular architecture and JWT refresh session lessons were outstanding.',
      isModerated: true,
    });

    // Additional reviews from other students
    for (let i = 0; i < 5; i++) {
      await Review.create({
        student: additionalStudents[i]._id,
        course: primaryCourse._id,
        rating: 4 + (i % 2),
        comment: 'Great practical insights. Loved the clean TypeScript separation and Docker setup.',
        isModerated: true,
      });
    }

    logger.info('Created Course Reviews.');

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
