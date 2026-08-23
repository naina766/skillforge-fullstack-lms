export type NormalizedLevel = 'BEGINNER' | 'EARLY_INTERMEDIATE' | 'INTERMEDIATE' | 'ADVANCED' | 'UNKNOWN';
export type PreferredFormat = 'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'WEBINAR' | 'ALL';
export type QueryIntent =
  | 'CAREER_ROADMAP'
  | 'WHAT_NEXT'
  | 'READINESS_CHECK'
  | 'COMPARISON'
  | 'SKILL_GAP'
  | 'PROJECT_IDEAS'
  | 'OFF_TOPIC'
  | 'PROMPT_INJECTION';

export interface UserIntent {
  rawPrompt: string;
  targetRole: string;
  primaryGoal: string;
  secondaryGoal?: string;
  careerGoal: string;
  experienceLevel: NormalizedLevel;
  existingSkills: string[];
  desiredSkills: string[];
  interests: string[];
  timeframe?: string;
  studyTimePerDay?: string;
  preferredFormat: PreferredFormat;
  queryIntent: QueryIntent;
  technologiesMentioned: string[];
  comparisonSubjects?: [string, string];
  isOffTopic: boolean;
  isPromptInjection: boolean;
}

export class IntentExtractionService {
  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /system\s+prompt/i,
    /reveal\s+(internal|system|admin)\s+(instructions|prompt|keys)/i,
    /admin\s+credentials/i,
    /drop\s+database/i,
    /delete\s+all\s+users/i,
    /bypass\s+(auth|security|rules)/i,
    /you\s+are\s+now\s+dan/i,
    /act\s+as\s+an\s+unrestricted/i,
  ];

  private static readonly OFF_TOPIC_PATTERNS = [
    /\b(weather|forecast|rain|temperature)\b/i,
    /\b(recipe|cooking|ingredients|bake|restaurant|pizza|burger)\b/i,
    /\b(celebrity|gossip|movie\s+review|hollywood|bollywood)\b/i,
    /\b(politics|election|president|senate|parliament)\b/i,
    /\b(horoscope|astrology|zodiac)\b/i,
    /\b(joke|riddle|funny\s+story)\b/i,
  ];

  private static readonly TECH_SKILLS_DICTIONARY = [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'React Native', 'Next.js', 'Vue', 'Angular',
    'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
    'C#', '.NET', 'Go', 'Golang', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Rails', 'C++', 'C',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL', 'NoSQL', 'Prisma', 'Mongoose', 'GraphQL',
    'REST', 'REST API', 'gRPC', 'WebSockets', 'Microservices', 'System Design', 'Kafka', 'RabbitMQ',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'CI/CD', 'GitHub Actions',
    'Terraform', 'Linux', 'Bash', 'Ansible', 'Helm', 'DevOps', 'SRE', 'Nginx',
    'Machine Learning', 'Deep Learning', 'Generative AI', 'LLM', 'Gemini', 'OpenAI', 'LangChain',
    'LlamaIndex', 'RAG', 'Vector Database', 'Pinecone', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision',
    'Pandas', 'NumPy', 'Data Science', 'Data Engineering', 'BigQuery', 'Snowflake', 'Spark', 'Airflow',
    'Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'OWASP', 'Cryptography', 'Zero Trust',
    'Figma', 'UI/UX', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'Redux', 'TanStack Query',
    'Playwright', 'Cypress', 'Jest', 'Vitest', 'Testing', 'QA', 'Automation',
    'Solidity', 'Web3', 'Blockchain', 'Smart Contracts', 'Ethereum', 'Agile', 'Scrum', 'Product Management'
  ];

  /**
   * Main entry point to extract structured intent from the user's prompt
   */
  static extractIntent(prompt: string): UserIntent {
    const cleanPrompt = prompt.trim();
    const lowerPrompt = cleanPrompt.toLowerCase();

    // 1. Detect Prompt Injections
    const isPromptInjection = this.INJECTION_PATTERNS.some((pattern) => pattern.test(cleanPrompt));

    // 2. Detect Off-Topic Queries
    const isOffTopic = !isPromptInjection && this.isQueryOffTopic(cleanPrompt, lowerPrompt);

    // 3. Extract Technologies & Existing Skills
    const technologiesMentioned = this.extractTechnologies(cleanPrompt);
    const existingSkills = this.extractExplicitExistingSkills(cleanPrompt, technologiesMentioned);

    // 4. Extract Query Intent
    let queryIntent: QueryIntent = 'CAREER_ROADMAP';
    let comparisonSubjects: [string, string] | undefined = undefined;

    if (isPromptInjection) {
      queryIntent = 'PROMPT_INJECTION';
    } else if (isOffTopic) {
      queryIntent = 'OFF_TOPIC';
    } else if (lowerPrompt.includes(' vs ') || lowerPrompt.includes(' or ') || lowerPrompt.includes('compare ') || lowerPrompt.includes('should i learn')) {
      queryIntent = 'COMPARISON';
      comparisonSubjects = this.extractComparisonSubjects(cleanPrompt);
    } else if (lowerPrompt.includes('what next') || lowerPrompt.includes('what should i learn next') || lowerPrompt.includes('after this') || lowerPrompt.includes('finished ')) {
      queryIntent = 'WHAT_NEXT';
    } else if (lowerPrompt.includes('am i ready') || lowerPrompt.includes('ready for') || lowerPrompt.includes('can i get a job')) {
      queryIntent = 'READINESS_CHECK';
    } else if (lowerPrompt.includes('skill gap') || lowerPrompt.includes('what am i missing') || lowerPrompt.includes('what do i need')) {
      queryIntent = 'SKILL_GAP';
    } else if (lowerPrompt.includes('project idea') || lowerPrompt.includes('what projects') || lowerPrompt.includes('portfolio')) {
      queryIntent = 'PROJECT_IDEAS';
    }

    // 5. Extract Target Role & Goals
    const { targetRole, primaryGoal, secondaryGoal, careerGoal } = this.extractRolesAndGoals(cleanPrompt, lowerPrompt, existingSkills);

    // 6. Assess Experience Level
    const experienceLevel = this.assessExperienceLevel(cleanPrompt, lowerPrompt, existingSkills);

    // 7. Extract Timeframe & Availability
    const timeframe = this.extractTimeframe(lowerPrompt);
    const studyTimePerDay = this.extractStudyTime(lowerPrompt);

    // 8. Extract Format Preference
    const preferredFormat = this.extractPreferredFormat(lowerPrompt);

    // 9. Extract Desired Skills
    const desiredSkills = technologiesMentioned.filter((t) => !existingSkills.includes(t));

    return {
      rawPrompt: cleanPrompt,
      targetRole,
      primaryGoal,
      secondaryGoal,
      careerGoal,
      experienceLevel,
      existingSkills,
      desiredSkills,
      interests: [],
      timeframe,
      studyTimePerDay,
      preferredFormat,
      queryIntent,
      technologiesMentioned,
      comparisonSubjects,
      isOffTopic,
      isPromptInjection,
    };
  }

  private static isQueryOffTopic(prompt: string, lowerPrompt: string): boolean {
    const techWords = this.extractTechnologies(prompt);
    const hasTechMention = techWords.length > 0;
    const hasCareerKeywords = /\b(career|job|engineer|developer|programming|code|learn|roadmap|skills|salary|interview|hire|tech|software|internship|placement|project)\b/i.test(prompt);

    if (hasTechMention || hasCareerKeywords) {
      return false;
    }

    return this.OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(prompt));
  }

  private static extractTechnologies(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const found: string[] = [];

    for (const tech of this.TECH_SKILLS_DICTIONARY) {
      const techLower = tech.toLowerCase();
      if (techLower === 'c++') {
        if (/\bc\+\+/i.test(prompt)) found.push('C++');
      } else if (techLower === 'c#') {
        if (/\bc#/i.test(prompt)) found.push('C#');
      } else if (techLower === 'c') {
        if (/\bc\b/i.test(prompt)) found.push('C');
      } else if (techLower === 'go') {
        if (/\bgo\b/i.test(prompt)) found.push('Go');
      } else if (techLower === '.net') {
        if (/\.net/i.test(prompt)) found.push('.NET');
      } else if (tech.length <= 4) {
        const regex = new RegExp(`\\b${techLower}\\b`, 'i');
        if (regex.test(prompt)) found.push(tech);
      } else {
        if (lowerPrompt.includes(techLower)) found.push(tech);
      }
    }

    return Array.from(new Set(found));
  }

  private static extractExplicitExistingSkills(prompt: string, technologies: string[]): string[] {
    const lower = prompt.toLowerCase();
    const existing: string[] = [];

    // Patterns indicating already acquired skills
    const knownPatterns = [
      /(?:i know|i have learned|i've learned|i learned|i understand|familiar with|experienced with|experience in|working with|i use|i built with|proficient in)\s+([^.]+)/gi,
      /(?:my skills are|skills:)\s+([^.]+)/gi,
    ];

    let matchesText = '';
    for (const pattern of knownPatterns) {
      const match = pattern.exec(lower);
      if (match && match[1]) {
        matchesText += ' ' + match[1];
      }
    }

    for (const tech of technologies) {
      const techLower = tech.toLowerCase();
      if (matchesText.includes(techLower)) {
        existing.push(tech);
      }
    }

    // Direct phrases e.g. "I know React and JavaScript"
    if (existing.length === 0 && (lower.includes('i know ') || lower.includes('i have '))) {
      for (const tech of technologies) {
        if (lower.indexOf(tech.toLowerCase()) > -1 && lower.indexOf(tech.toLowerCase()) < (lower.indexOf('want') > -1 ? lower.indexOf('want') : lower.length)) {
          existing.push(tech);
        }
      }
    }

    return Array.from(new Set(existing));
  }

  private static extractRolesAndGoals(
    prompt: string,
    lowerPrompt: string,
    existingSkills: string[]
  ): { targetRole: string; primaryGoal: string; secondaryGoal?: string; careerGoal: string } {
    let targetRole = 'Software Engineer';
    let primaryGoal = 'Software Development';
    let secondaryGoal: string | undefined = undefined;
    let careerGoal = 'Career Growth & Skill Development';

    // Comprehensive Flexible Role Patterns
    const roleMappings: Array<{ regex: RegExp; role: string; primary: string }> = [
      { regex: /\b(generative ai|genai|llm|llms|prompt engineer|gemini api|openai|langchain|rag)\b/i, role: 'Generative AI Engineer', primary: 'Generative AI & LLM Systems' },
      { regex: /\b(ai engineer|artificial intelligence|ai systems|ai model|ai apps)\b/i, role: 'AI Engineer', primary: 'Artificial Intelligence & Machine Learning' },
      { regex: /\b(machine learning|ml engineer|deep learning|pytorch|tensorflow)\b/i, role: 'Machine Learning Engineer', primary: 'Machine Learning Engineering' },
      { regex: /\b(data scientist|data science)\b/i, role: 'Data Scientist', primary: 'Data Science & Predictive Modeling' },
      { regex: /\b(data engineer|data engineering|bigquery|snowflake|etl|airflow)\b/i, role: 'Data Engineer', primary: 'Data Engineering & Analytics Infrastructure' },
      { regex: /\b(data analyst|business analytics)\b/i, role: 'Data Analyst', primary: 'Data Analytics & Visualization' },
      { regex: /\b(devops|devops engineer|sre|site reliability|kubernetes|k8s|ci\/cd|helm)\b/i, role: 'DevOps & Cloud Engineer', primary: 'DevOps, CI/CD & Cloud Infrastructure' },
      { regex: /\b(cloud engineer|aws|azure|gcp|cloud architect|terraform)\b/i, role: 'Cloud Solutions Engineer', primary: 'Cloud Infrastructure & Architecture' },
      { regex: /\b(cybersecurity|security engineer|penetration testing|ethical hack|ethical hacker|soc analyst|owasp)\b/i, role: 'Cybersecurity Engineer', primary: 'Cybersecurity & Application Defense' },
      { regex: /\b(full[\s-]?stack|fullstack|mern)\b/i, role: 'Full-Stack Developer', primary: 'Full-Stack Web Engineering' },
      { regex: /\b(frontend|front[\s-]?end|react developer|next\.js developer|ui developer)\b/i, role: 'Frontend Engineer', primary: 'Frontend Architecture & UI Engineering' },
      { regex: /\b(backend|back[\s-]?end|node developer|api engineer|node\.js developer|python developer|java developer|microservices)\b/i, role: 'Backend Engineer', primary: 'Backend Architecture & Distributed APIs' },
      { regex: /\b(mobile|mobile developer|mobile app|mobile apps|ios|android|react native|expo)\b/i, role: 'Mobile App Engineer', primary: 'Cross-Platform Mobile Development' },
      { regex: /\b(ui[\s/]?ux|product designer|design system|figma)\b/i, role: 'UI/UX & Product Designer', primary: 'UI/UX & Product Design Systems' },
      { regex: /\b(qa engineer|test automation|automation engineer|playwright|cypress|testing)\b/i, role: 'QA & Test Automation Engineer', primary: 'Quality Assurance & Automated Testing' },
      { regex: /\b(blockchain|web3|solidity|smart contract|smart contracts|dapp)\b/i, role: 'Web3 & Blockchain Engineer', primary: 'Smart Contract & DApp Development' },
      { regex: /\b(solutions architect|system architect|system design)\b/i, role: 'Solutions Architect', primary: 'System Design & High-Scale Architecture' },
      { regex: /\b(product manager|product discovery|agile product|scrum)\b/i, role: 'Technical Product Manager', primary: 'Product Discovery & Agile Execution' },
    ];

    for (const mapping of roleMappings) {
      if (mapping.regex.test(prompt)) {
        targetRole = mapping.role;
        primaryGoal = mapping.primary;
        break;
      }
    }

    // Secondary Goal Detection (e.g. "want to become a backend engineer but eventually move into DevOps")
    if (lowerPrompt.includes('eventually') || lowerPrompt.includes('then') || lowerPrompt.includes('also')) {
      for (const mapping of roleMappings) {
        if (mapping.regex.test(prompt) && mapping.role !== targetRole) {
          secondaryGoal = mapping.role;
          break;
        }
      }
    }

    // Explicit Career Transition / Goal Intent
    if (lowerPrompt.includes('transition') || (existingSkills.length > 0 && !targetRole.toLowerCase().includes(existingSkills[0].toLowerCase()))) {
      careerGoal = `Career transition to ${targetRole}`;
    } else if (lowerPrompt.includes('interview') || lowerPrompt.includes('prepare for interview')) {
      careerGoal = `Interview & Placement Preparation for ${targetRole}`;
    } else if (lowerPrompt.includes('internship') || lowerPrompt.includes('placement')) {
      careerGoal = `Internship & Campus Placement Readiness for ${targetRole}`;
    } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('projects')) {
      careerGoal = `Portfolio & Real-World Projects for ${targetRole}`;
    } else {
      careerGoal = `Mastering ${primaryGoal}`;
    }

    return { targetRole, primaryGoal, secondaryGoal, careerGoal };
  }

  private static assessExperienceLevel(
    prompt: string,
    lowerPrompt: string,
    existingSkills: string[]
  ): NormalizedLevel {
    // Beginner Signals
    if (
      /\b(beginner|complete beginner|new to|just started|starting out|zero experience|never coded|no experience|from scratch|basics)\b/i.test(prompt)
    ) {
      return 'BEGINNER';
    }

    // Advanced Signals
    if (
      /\b(senior|lead|architect|advanced|production experience|scaling|distributed systems|5\+ years|10\+ years|staff|principal)\b/i.test(prompt)
    ) {
      return 'ADVANCED';
    }

    // Intermediate Signals
    if (
      /\b(intermediate|working professional|currently working|already built|have built|experience with|multiple projects|2\+ years|3\+ years)\b/i.test(prompt) ||
      existingSkills.length >= 3
    ) {
      return 'INTERMEDIATE';
    }

    if (existingSkills.length >= 1) {
      return 'EARLY_INTERMEDIATE';
    }

    return 'UNKNOWN';
  }

  private static extractTimeframe(lowerPrompt: string): string | undefined {
    if (lowerPrompt.includes('30 day') || lowerPrompt.includes('1 month') || lowerPrompt.includes('4 week')) {
      return '30-Day Intensive Plan';
    }
    if (lowerPrompt.includes('60 day') || lowerPrompt.includes('2 month') || lowerPrompt.includes('8 week')) {
      return '60-Day Accelerated Track';
    }
    if (lowerPrompt.includes('90 day') || lowerPrompt.includes('3 month') || lowerPrompt.includes('12 week')) {
      return '90-Day Comprehensive Roadmap';
    }
    if (lowerPrompt.includes('6 month') || lowerPrompt.includes('half year')) {
      return '6-Month In-Depth Career Blueprint';
    }
    return undefined;
  }

  private static extractStudyTime(lowerPrompt: string): string | undefined {
    const matchHours = /(\d+)\s*(?:hours?|hrs?)\s*(?:per\s*day|\/day|daily)/i.exec(lowerPrompt);
    if (matchHours && matchHours[1]) {
      return `${matchHours[1]} hours/day`;
    }
    if (lowerPrompt.includes('weekend') || lowerPrompt.includes('saturday') || lowerPrompt.includes('sunday')) {
      return 'Weekends Only (8-10 hours/week)';
    }
    return undefined;
  }

  private static extractPreferredFormat(lowerPrompt: string): PreferredFormat {
    if (lowerPrompt.includes('workshop') || lowerPrompt.includes('live session')) return 'WORKSHOP';
    if (lowerPrompt.includes('bootcamp') || lowerPrompt.includes('intensive')) return 'BOOTCAMP';
    if (lowerPrompt.includes('webinar') || lowerPrompt.includes('quick overview')) return 'WEBINAR';
    if (lowerPrompt.includes('course') || lowerPrompt.includes('curriculum')) return 'COURSE';
    return 'ALL';
  }

  private static extractComparisonSubjects(prompt: string): [string, string] | undefined {
    const vsMatch = /([a-zA-Z0-9\.\+#]+)\s+(?:vs\.?|or|compared to)\s+([a-zA-Z0-9\.\+#]+)/i.exec(prompt);
    if (vsMatch && vsMatch[1] && vsMatch[2]) {
      return [vsMatch[1].trim(), vsMatch[2].trim()];
    }
    return undefined;
  }
}
