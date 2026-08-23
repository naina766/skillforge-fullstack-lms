export interface RoleTaxonomy {
  role: string;
  category: string;
  coreSkills: string[];
  advancedSkills: string[];
  prerequisites: Record<string, string[]>; // e.g. "Express": ["Node.js", "JavaScript"]
  phases: Array<{
    phase: number;
    title: string;
    skills: string[];
  }>;
  projects: Array<{
    title: string;
    skills: string[];
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  }>;
  concreteNextAction: string;
}

export class SkillTaxonomyService {
  private static readonly TAXONOMY: Record<string, RoleTaxonomy> = {
    'Full-Stack Developer': {
      role: 'Full-Stack Developer',
      category: 'Web Development',
      coreSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'JWT Authentication'],
      advancedSkills: ['Next.js', 'PostgreSQL', 'Docker', 'CI/CD Pipelines', 'Redis Caching', 'System Design', 'Microservices'],
      prerequisites: {
        'React': ['JavaScript', 'HTML', 'CSS'],
        'TypeScript': ['JavaScript'],
        'Node.js': ['JavaScript'],
        'Express': ['Node.js', 'JavaScript'],
        'MongoDB': ['Node.js', 'Express'],
        'Next.js': ['React', 'TypeScript'],
        'Docker': ['Node.js', 'Express'],
      },
      phases: [
        { phase: 1, title: 'Frontend Fundamentals & React Architecture', skills: ['TypeScript', 'React', 'Tailwind CSS', 'State Management'] },
        { phase: 2, title: 'Backend REST APIs & Database Security', skills: ['Node.js', 'Express', 'MongoDB', 'JWT Auth', 'Zod Validation'] },
        { phase: 3, title: 'Full-Stack Integration & Production Deployment', skills: ['Docker', 'CI/CD Pipelines', 'Redis Caching', 'Cloud Deployment'] },
      ],
      projects: [
        { title: 'Full-Stack Learning Platform with Auth & RBAC', skills: ['React', 'Node.js', 'MongoDB', 'JWT'], level: 'INTERMEDIATE' },
        { title: 'Multi-Tenant SaaS Project Management Engine', skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Docker'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Build a full-stack REST API with TypeScript, Express, and MongoDB, and connect it to a React frontend.',
    },
    'Frontend Engineer': {
      role: 'Frontend Engineer',
      category: 'Web Development',
      coreSkills: ['HTML5', 'CSS3', 'JavaScript ES6+', 'TypeScript', 'React', 'State Management', 'Tailwind CSS', 'Responsive Design'],
      advancedSkills: ['Next.js App Router', 'TanStack Query', 'Zustand', 'Performance Optimization', 'Framer Motion', 'Web Accessibility (a11y)', 'Playwright Testing'],
      prerequisites: {
        'React': ['JavaScript', 'HTML5', 'CSS3'],
        'TypeScript': ['JavaScript'],
        'Next.js App Router': ['React', 'TypeScript'],
        'TanStack Query': ['React'],
      },
      phases: [
        { phase: 1, title: 'Advanced JavaScript & Modern React Foundations', skills: ['TypeScript', 'React 18', 'Component Patterns', 'Custom Hooks'] },
        { phase: 2, title: 'Server-State Management & UI Performance', skills: ['TanStack Query', 'Zustand', 'Optimistic UI', 'Code Splitting'] },
        { phase: 3, title: 'Design Systems & End-to-End Testing', skills: ['Tailwind CSS', 'Framer Motion', 'Playwright', 'Next.js 14'] },
      ],
      projects: [
        { title: 'Modern E-Commerce Catalog with Real-Time Filters', skills: ['React', 'TanStack Query', 'Tailwind CSS'], level: 'INTERMEDIATE' },
        { title: 'Enterprise Design System & Accessible Component Library', skills: ['TypeScript', 'Storybook', 'Framer Motion', 'Figma'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Implement a React 18 dashboard utilizing TanStack Query for optimistic updates and caching.',
    },
    'Backend Engineer': {
      role: 'Backend Engineer',
      category: 'Web Development',
      coreSkills: ['Node.js', 'Express', 'TypeScript', 'REST APIs', 'MongoDB', 'SQL', 'Authentication', 'Data Modeling'],
      advancedSkills: ['Microservices', 'System Design', 'Redis', 'Kafka', 'Docker', 'Rate Limiting', 'GraphQL', 'NestJS', 'PostgreSQL'],
      prerequisites: {
        'Node.js': ['JavaScript'],
        'Express': ['Node.js'],
        'MongoDB': ['Node.js', 'Express'],
        'Microservices': ['Node.js', 'Express', 'Docker'],
        'Redis': ['Node.js'],
      },
      phases: [
        { phase: 1, title: 'API Design & TypeScript Runtime Architecture', skills: ['Node.js', 'Express', 'TypeScript', 'Clean Architecture'] },
        { phase: 2, title: 'Database Optimization & Security Hardening', skills: ['MongoDB Indexes', 'JWT Token Rotation', 'Bcrypt', 'Rate Limiting'] },
        { phase: 3, title: 'Distributed Systems & Micro-Architecture', skills: ['Redis Caching', 'Docker Containers', 'System Design Patterns'] },
      ],
      projects: [
        { title: 'High-Throughput Authentication & User Session Service', skills: ['Node.js', 'JWT', 'MongoDB', 'Redis'], level: 'INTERMEDIATE' },
        { title: 'Distributed Microservices Event Pipeline', skills: ['NestJS', 'Docker', 'Kafka', 'System Design'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Build a production-grade Node.js + Express API with JWT refresh token rotation and MongoDB indexing.',
    },
    'Generative AI Engineer': {
      role: 'Generative AI Engineer',
      category: 'AI & Machine Learning',
      coreSkills: ['Python', 'Prompt Engineering', 'LLM Integration', 'Gemini API', 'OpenAI API', 'Vector Embeddings', 'RAG (Retrieval-Augmented Generation)'],
      advancedSkills: ['LangChain', 'LlamaIndex', 'AI Agents', 'Fine-Tuning', 'Vector Databases (Pinecone/Milvus)', 'Model Evaluation', 'FastAPI'],
      prerequisites: {
        'LLM Integration': ['Python', 'REST APIs'],
        'RAG': ['LLM Integration', 'Vector Embeddings'],
        'AI Agents': ['RAG', 'LangChain'],
      },
      phases: [
        { phase: 1, title: 'LLM Foundations & Prompt Engineering', skills: ['Python', 'Gemini API', 'Structured Prompts', 'Function Calling'] },
        { phase: 2, title: 'Embeddings & RAG Knowledge Retrieval', skills: ['Vector Databases', 'Chunking Strategies', 'Embeddings', 'Semantic Search'] },
        { phase: 3, title: 'Autonomous AI Agents & Production Integration', skills: ['LangChain', 'Agent Tooling', 'Evaluation Benchmarks', 'FastAPI'] },
      ],
      projects: [
        { title: 'Context-Aware Documentation RAG Assistant', skills: ['Gemini API', 'Vector DB', 'Python', 'FastAPI'], level: 'INTERMEDIATE' },
        { title: 'Autonomous Multi-Agent Engineering Researcher', skills: ['LangChain', 'AI Agents', 'Tool Calling', 'Node/Python'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Connect the Gemini API to a Node.js or Python backend and implement semantic vector search with embeddings.',
    },
    'AI Engineer': {
      role: 'AI Engineer',
      category: 'AI & Machine Learning',
      coreSkills: ['Python', 'Machine Learning Fundamentals', 'Deep Learning', 'PyTorch/TensorFlow', 'LLMs', 'Model Inference'],
      advancedSkills: ['Transformers', 'RAG Pipelines', 'MLOps', 'Vector Databases', 'Model Deployment', 'ONNX', 'Quantization'],
      prerequisites: {
        'Machine Learning Fundamentals': ['Python', 'Linear Algebra', 'Calculus'],
        'Deep Learning': ['Machine Learning Fundamentals'],
        'Transformers': ['Deep Learning', 'PyTorch/TensorFlow'],
      },
      phases: [
        { phase: 1, title: 'Mathematical & Python ML Foundations', skills: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Feature Engineering'] },
        { phase: 2, title: 'Neural Networks & Deep Learning', skills: ['PyTorch', 'Transformers', 'Hugging Face', 'Embeddings'] },
        { phase: 3, title: 'LLM Systems & Production Deployment', skills: ['RAG Architectures', 'Vector Search', 'Model Serving', 'Docker'] },
      ],
      projects: [
        { title: 'Predictive Machine Learning Classifier Pipeline', skills: ['Python', 'Scikit-Learn', 'Pandas'], level: 'BEGINNER' },
        { title: 'Production Transformer Model Serving Microservice', skills: ['PyTorch', 'FastAPI', 'Docker', 'Hugging Face'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Train a deep learning baseline model in PyTorch and export it to an inference API using FastAPI.',
    },
    'Machine Learning Engineer': {
      role: 'Machine Learning Engineer',
      category: 'AI & Machine Learning',
      coreSkills: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Model Validation', 'Supervised/Unsupervised Learning'],
      advancedSkills: ['Deep Learning', 'PyTorch', 'MLflow', 'Feature Stores', 'Hyperparameter Tuning', 'Distributed Training'],
      prerequisites: {
        'Scikit-Learn': ['Python', 'NumPy', 'Pandas'],
        'PyTorch': ['Scikit-Learn', 'Calculus'],
      },
      phases: [
        { phase: 1, title: 'Data Processing & Statistical Learning', skills: ['Python', 'Pandas', 'EDA', 'Regression', 'Classification'] },
        { phase: 2, title: 'Ensemble Models & Deep Learning', skills: ['XGBoost', 'PyTorch', 'CNNs', 'RNNs'] },
        { phase: 3, title: 'MLOps Pipeline & Continuous Training', skills: ['MLflow', 'Docker', 'Model Monitoring', 'CI/CD for ML'] },
      ],
      projects: [
        { title: 'Customer Churn & Anomaly Detection Pipeline', skills: ['Python', 'Scikit-Learn', 'XGBoost'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Build an end-to-end dataset preprocessing, model evaluation, and cross-validation pipeline in Python.',
    },
    'DevOps & Cloud Engineer': {
      role: 'DevOps & Cloud Engineer',
      category: 'Cloud & DevOps',
      coreSkills: ['Linux', 'Bash Scripting', 'Git', 'Docker', 'CI/CD Pipelines', 'GitHub Actions', 'AWS/GCP Basics'],
      advancedSkills: ['Kubernetes', 'Helm', 'Terraform', 'Infrastructure as Code (IaC)', 'Prometheus & Grafana', 'Zero-Trust Security', 'AWS ECS/EKS'],
      prerequisites: {
        'Docker': ['Linux', 'Git'],
        'CI/CD Pipelines': ['Docker', 'Git'],
        'Kubernetes': ['Docker', 'Linux', 'Networking'],
        'Terraform': ['AWS/GCP Basics'],
      },
      phases: [
        { phase: 1, title: 'Linux Administration & Containerization', skills: ['Linux', 'Multi-stage Dockerfiles', 'Container Networking', 'Compose'] },
        { phase: 2, title: 'CI/CD Automation & Cloud Infrastructure', skills: ['GitHub Actions', 'AWS EC2/S3', 'Automated Testing', 'Secrets Vault'] },
        { phase: 3, title: 'Kubernetes Orchestration & Observability', skills: ['Kubernetes Manifests', 'Helm Charts', 'Terraform', 'Prometheus'] },
      ],
      projects: [
        { title: 'Automated Multi-Stage CI/CD Pipeline with GitHub Actions', skills: ['Docker', 'GitHub Actions', 'AWS', 'Security Scanning'], level: 'INTERMEDIATE' },
        { title: 'High-Availability Resilient Kubernetes Cluster', skills: ['Kubernetes', 'Helm', 'Terraform', 'Grafana'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Containerize a Node.js web application with a multi-stage Dockerfile and deploy it via GitHub Actions.',
    },
    'Cloud Solutions Engineer': {
      role: 'Cloud Solutions Engineer',
      category: 'Cloud & DevOps',
      coreSkills: ['Cloud Architecture', 'AWS', 'Azure/GCP', 'IAM Security', 'VPC Networking', 'Compute & Storage Services'],
      advancedSkills: ['Serverless (Lambda)', 'Terraform', 'Kubernetes EKS/GKE', 'Disaster Recovery', 'Cost Optimization', 'System Reliability'],
      prerequisites: {
        'IAM Security': ['Networking Fundamentals'],
        'Terraform': ['Cloud Architecture'],
      },
      phases: [
        { phase: 1, title: 'Cloud Architecture & Virtual Private Clouds', skills: ['AWS VPC', 'Subnets', 'Security Groups', 'EC2 & S3'] },
        { phase: 2, title: 'Infrastructure as Code & Serverless', skills: ['Terraform', 'AWS Lambda', 'API Gateway', 'DynamoDB'] },
        { phase: 3, title: 'Enterprise Scaling & Disaster Recovery', skills: ['Multi-Region Failover', 'CloudWatch', 'Cost Optimization'] },
      ],
      projects: [
        { title: 'Automated Cloud Infrastructure Provisioning with Terraform', skills: ['Terraform', 'AWS VPC', 'IAM', 'EC2'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Write declarative Terraform scripts to provision an isolated VPC with public/private subnets and security groups.',
    },
    'Data Engineer': {
      role: 'Data Engineer',
      category: 'Data Engineering',
      coreSkills: ['Python', 'SQL', 'Data Modeling', 'ETL Pipelines', 'Relational Databases', 'Pandas'],
      advancedSkills: ['BigQuery', 'Apache Spark', 'Apache Airflow', 'Data Warehousing', 'Kafka Streaming', 'Snowflake', 'dbt'],
      prerequisites: {
        'ETL Pipelines': ['Python', 'SQL'],
        'Apache Spark': ['Python', 'SQL', 'Data Modeling'],
        'Apache Airflow': ['Python', 'ETL Pipelines'],
      },
      phases: [
        { phase: 1, title: 'Advanced SQL & Data Modeling', skills: ['SQL Window Functions', 'Star/Snowflake Schemas', 'PostgreSQL', 'Indexing'] },
        { phase: 2, title: 'Data Warehousing & Orchestration', skills: ['BigQuery', 'Apache Airflow', 'dbt', 'Data Cleaning'] },
        { phase: 3, title: 'Distributed Big Data Processing', skills: ['Apache Spark', 'PySpark', 'Kafka Stream Processing', 'Data Lakes'] },
      ],
      projects: [
        { title: 'Automated Financial Data Pipeline with Airflow & BigQuery', skills: ['Python', 'SQL', 'Airflow', 'BigQuery'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Build an automated ETL pipeline that extracts raw JSON data, transforms it with SQL/Pandas, and loads into BigQuery.',
    },
    'Data Scientist': {
      role: 'Data Scientist',
      category: 'Data Engineering',
      coreSkills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Exploratory Data Analysis', 'Statistical Inference', 'Data Visualization'],
      advancedSkills: ['Scikit-Learn', 'Machine Learning', 'Hypothesis Testing', 'Feature Engineering', 'Time-Series Forecasting', 'Deep Learning'],
      prerequisites: {
        'Pandas': ['Python'],
        'Scikit-Learn': ['Python', 'Pandas', 'Statistical Inference'],
      },
      phases: [
        { phase: 1, title: 'Statistical Analysis & Exploratory Data Analysis', skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib/Seaborn', 'SQL'] },
        { phase: 2, title: 'Machine Learning & Predictive Modeling', skills: ['Scikit-Learn', 'Regression', 'Classification', 'Cross-Validation'] },
        { phase: 3, title: 'Advanced Analytics & Model Interpretation', skills: ['Feature Engineering', 'Hyperparameter Optimization', 'SHAP/LIME'] },
      ],
      projects: [
        { title: 'End-to-End Predictive Analytics Dashboard', skills: ['Python', 'Pandas', 'Scikit-Learn', 'Streamlit'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Conduct exploratory analysis and train a predictive regression/classification model on real tabular data in Python.',
    },
    'Cybersecurity Engineer': {
      role: 'Cybersecurity Engineer',
      category: 'Cybersecurity',
      coreSkills: ['Networking Fundamentals', 'Linux Administration', 'Security Principles', 'OWASP Top 10', 'Authentication & JWT'],
      advancedSkills: ['Web Penetration Testing', 'Vulnerability Assessment', 'Burp Suite', 'Cryptography', 'Zero Trust Architecture', 'SIEM & SOC'],
      prerequisites: {
        'OWASP Top 10': ['Networking Fundamentals', 'Web Development Basics'],
        'Web Penetration Testing': ['OWASP Top 10', 'Linux Administration'],
      },
      phases: [
        { phase: 1, title: 'Networking & Defensive Security Fundamentals', skills: ['TCP/IP', 'Linux Hardening', 'Cryptography Basics', 'IAM Protocols'] },
        { phase: 2, title: 'Web Application Security & OWASP Top 10', skills: ['SQL Injection', 'XSS', 'CSRF', 'JWT Attacks', 'Burp Suite'] },
        { phase: 3, title: 'Penetration Testing & Security Automation', skills: ['Vulnerability Scanning', 'Zero Trust Architecture', 'Defensive Auditing'] },
      ],
      projects: [
        { title: 'Web Application Security Audit & Penetration Report', skills: ['OWASP Top 10', 'Burp Suite', 'Security Remediation'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Audit a web application against OWASP Top 10 vulnerabilities (SQLi, XSS, IDOR) and implement secure mitigations.',
    },
    'Mobile App Engineer': {
      role: 'Mobile App Engineer',
      category: 'Mobile Development',
      coreSkills: ['JavaScript/TypeScript', 'React Native', 'Expo', 'Mobile UI Components', 'State Management', 'REST API Integration'],
      advancedSkills: ['Native Device APIs', 'App Store Deployment', 'Offline Storage (SQLite/MMKV)', 'Push Notifications', 'Performance Tuning'],
      prerequisites: {
        'React Native': ['JavaScript/TypeScript', 'React Basics'],
        'Expo': ['React Native'],
      },
      phases: [
        { phase: 1, title: 'React Native & Mobile UI Fundamentals', skills: ['TypeScript', 'React Native Components', 'Flexbox Layouts', 'Expo'] },
        { phase: 2, title: 'Device Features & Local Data Persistence', skills: ['Camera & Location APIs', 'AsyncStorage/SQLite', 'Navigation'] },
        { phase: 3, title: 'Production Polishing & App Store Release', skills: ['Push Notifications', 'Animation Performance', 'App Store/Play Store Deploy'] },
      ],
      projects: [
        { title: 'Cross-Platform Mobile Portfolio App', skills: ['React Native', 'Expo', 'TypeScript', 'REST API'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Build an Expo React Native application with bottom tab navigation, dark mode, and REST API data fetching.',
    },
    'UI/UX & Product Designer': {
      role: 'UI/UX & Product Designer',
      category: 'Design Systems',
      coreSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Principles', 'Typography & Color Theory'],
      advancedSkills: ['Design Systems', 'Component Variants & Auto Layout', 'Usability Testing', 'Figma to React Handoff', 'Micro-interactions'],
      prerequisites: {
        'Design Systems': ['Figma', 'Design Principles'],
      },
      phases: [
        { phase: 1, title: 'User Research & Wireframing Fundamentals', skills: ['User Journey Maps', 'Information Architecture', 'Figma Wireframes'] },
        { phase: 2, title: 'High-Fidelity Prototyping & Design Systems', skills: ['Figma Components', 'Auto Layout', 'Color Palettes', 'Accessibility (WCAG)'] },
        { phase: 3, title: 'Developer Handoff & Interactive Prototypes', skills: ['Interactive Prototyping', 'Design Tokens', 'React Component Alignment'] },
      ],
      projects: [
        { title: 'Complete SaaS Web App Design System in Figma', skills: ['Figma', 'Auto Layout', 'Design Tokens', 'Design System'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Create a comprehensive Figma design system with tokens, reusable components, and auto-layout variants.',
    },
    'QA & Test Automation Engineer': {
      role: 'QA & Test Automation Engineer',
      category: 'Software Testing',
      coreSkills: ['Software Testing Fundamentals', 'JavaScript/TypeScript', 'Manual Testing', 'Test Case Design', 'API Testing (Postman)'],
      advancedSkills: ['Playwright', 'Cypress', 'End-to-End Testing', 'CI/CD Test Automation', 'Performance Testing (k6)', 'Mock Services'],
      prerequisites: {
        'Playwright': ['JavaScript/TypeScript', 'Software Testing Fundamentals'],
        'Cypress': ['JavaScript/TypeScript', 'Software Testing Fundamentals'],
      },
      phases: [
        { phase: 1, title: 'Test Strategy & API Verification', skills: ['Test Case Writing', 'Postman API Testing', 'Status Code Validation'] },
        { phase: 2, title: 'End-to-End Browser Automation', skills: ['Playwright', 'Cypress', 'Page Object Model', 'Assertions'] },
        { phase: 3, title: 'Continuous Automated Testing in CI/CD', skills: ['GitHub Actions Testing', 'Parallel Execution', 'Visual Regression'] },
      ],
      projects: [
        { title: 'Automated E2E Test Suite with Playwright & CI/CD', skills: ['Playwright', 'TypeScript', 'GitHub Actions'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Write automated Playwright end-to-end tests covering login, course navigation, and checkout flows.',
    },
    'Web3 & Blockchain Engineer': {
      role: 'Web3 & Blockchain Engineer',
      category: 'Blockchain',
      coreSkills: ['Solidity', 'Ethereum Fundamentals', 'Smart Contracts', 'Web3.js/Ethers.js', 'MetaMask Integration'],
      advancedSkills: ['Hardhat/Foundry', 'DeFi Protocols', 'Smart Contract Auditing', 'ERC-20 & ERC-721 Tokens', 'Gas Optimization'],
      prerequisites: {
        'Solidity': ['JavaScript/TypeScript', 'Programming Fundamentals'],
        'Hardhat/Foundry': ['Solidity'],
      },
      phases: [
        { phase: 1, title: 'Blockchain Fundamentals & Solidity Basics', skills: ['Ethereum', 'Solidity Syntax', 'State Variables', 'Functions'] },
        { phase: 2, title: 'Smart Contract Development & Testing', skills: ['Hardhat', 'ERC-20/721 Tokens', 'Security Modifiers', 'Unit Tests'] },
        { phase: 3, title: 'DApp Frontend & Web3 Integration', skills: ['Ethers.js', 'React DApp Frontend', 'Wallet Connection'] },
      ],
      projects: [
        { title: 'Decentralized Application (DApp) with Smart Contract & React', skills: ['Solidity', 'Hardhat', 'React', 'Ethers.js'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Develop, test, and deploy an ERC-20 smart contract using Solidity and Hardhat on a local testnet.',
    },
    'Solutions Architect': {
      role: 'Solutions Architect',
      category: 'System Design',
      coreSkills: ['System Design Fundamentals', 'Distributed Systems', 'Database Scaling', 'Caching Strategies', 'Microservices'],
      advancedSkills: ['High Availability', 'Event-Driven Architecture (Kafka)', 'CAP Theorem', 'Load Balancing', 'Disaster Recovery'],
      prerequisites: {
        'System Design Fundamentals': ['Backend Development Basics'],
      },
      phases: [
        { phase: 1, title: 'Core Architecture Patterns & Database Scaling', skills: ['Sharding', 'Replication', 'Load Balancing', 'Caching (Redis)'] },
        { phase: 2, title: 'Distributed Systems & Asynchronous Messaging', skills: ['Message Queues (Kafka/RabbitMQ)', 'Event-Driven Systems', 'Idempotency'] },
        { phase: 3, title: 'Enterprise Fault Tolerance & Cloud Architecture', skills: ['Multi-Region Deployments', 'Disaster Recovery', 'Rate Limiting', 'SLAs'] },
      ],
      projects: [
        { title: 'High-Scale Distributed URL Shortener & Analytics Architecture', skills: ['System Design', 'Redis', 'Kafka', 'PostgreSQL'], level: 'ADVANCED' },
      ],
      concreteNextAction: 'Design an end-to-end architecture diagram and technical spec for a high-concurrency rate-limited microservice.',
    },
    'Technical Product Manager': {
      role: 'Technical Product Manager',
      category: 'Product Management',
      coreSkills: ['Agile & Scrum', 'User Story Mapping', 'Product Discovery', 'Roadmap Planning', 'Feature Prioritization'],
      advancedSkills: ['Data-Driven Decision Making', 'A/B Testing', 'Technical Architecture Fluency', 'API Understanding', 'Metrics (KPIs/OKRs)'],
      prerequisites: {
        'Product Discovery': ['Agile & Scrum'],
      },
      phases: [
        { phase: 1, title: 'Product Discovery & Agile Execution', skills: ['Scrum Framework', 'Sprint Planning', 'User Stories', 'Backlog Refinement'] },
        { phase: 2, title: 'Technical Alignment & System Understanding', skills: ['API Basics', 'System Architecture Concepts', 'Data Analytics'] },
        { phase: 3, title: 'Product Strategy & Launch Metrics', skills: ['KPI Dashboards', 'A/B Testing', 'Release Management'] },
      ],
      projects: [
        { title: 'Product Requirement Document (PRD) & MVP Sprint Roadmap', skills: ['Agile', 'User Stories', 'PRD', 'Roadmapping'], level: 'INTERMEDIATE' },
      ],
      concreteNextAction: 'Draft a Product Requirement Document (PRD) with user stories, acceptance criteria, and success metrics.',
    },
  };

  /**
   * Retrieves taxonomy profile for a given role (with flexible matching)
   */
  static getRoleTaxonomy(targetRole: string): RoleTaxonomy {
    if (this.TAXONOMY[targetRole]) {
      return this.TAXONOMY[targetRole];
    }

    const lowerRole = targetRole.toLowerCase();
    for (const [key, value] of Object.entries(this.TAXONOMY)) {
      if (lowerRole.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerRole)) {
        return value;
      }
    }

    // Default to Full-Stack Developer if unspecified
    return this.TAXONOMY['Full-Stack Developer'];
  }

  /**
   * Analyzes skill gaps by comparing required skills against existing skills
   */
  static calculateSkillGaps(
    targetRole: string,
    existingSkills: string[],
    level: string = 'INTERMEDIATE'
  ): { skillGaps: string[]; coveredSkills: string[] } {
    const taxonomy = this.getRoleTaxonomy(targetRole);
    const existingLower = new Set(existingSkills.map((s) => s.toLowerCase()));

    const targetSkillSet = level === 'ADVANCED'
      ? [...taxonomy.coreSkills, ...taxonomy.advancedSkills]
      : taxonomy.coreSkills;

    const skillGaps: string[] = [];
    const coveredSkills: string[] = [];

    for (const skill of targetSkillSet) {
      if (existingLower.has(skill.toLowerCase())) {
        coveredSkills.push(skill);
      } else {
        skillGaps.push(skill);
      }
    }

    return {
      skillGaps: skillGaps.slice(0, 10),
      coveredSkills,
    };
  }

  /**
   * Generates level-appropriate projects matching the target role
   */
  static getProjectsForRole(targetRole: string, level: string = 'INTERMEDIATE') {
    const taxonomy = this.getRoleTaxonomy(targetRole);
    return taxonomy.projects.filter((p) => {
      if (level === 'BEGINNER') return p.level === 'BEGINNER' || p.level === 'INTERMEDIATE';
      if (level === 'ADVANCED') return p.level === 'ADVANCED' || p.level === 'INTERMEDIATE';
      return true;
    }).slice(0, 3);
  }

  /**
   * Generates personalized learning path phases
   */
  static getLearningPath(targetRole: string, existingSkills: string[]) {
    const taxonomy = this.getRoleTaxonomy(targetRole);
    const existingLower = new Set(existingSkills.map((s) => s.toLowerCase()));

    return taxonomy.phases.map((phase) => ({
      phase: phase.phase,
      title: phase.title,
      skills: phase.skills.filter((skill) => !existingLower.has(skill.toLowerCase())),
    })).filter((phase) => phase.skills.length > 0);
  }
}
