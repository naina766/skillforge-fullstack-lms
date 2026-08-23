import { Course } from '../models/Course';
import { env } from '../config/env';
import { logger } from '../config/logger';
import {
  CourseRecommendationService,
  CandidateCourse,
  UserLearningContext,
} from './courseRecommendation.service';
import { IntentExtractionService, UserIntent } from './intentExtraction.service';
import { SkillTaxonomyService } from './skillTaxonomy.service';
import { llmIdentityOutputSchema, LLMIdentityOutput } from '../validators/ai.validator';

export interface HydratedRecommendation {
  course: any;
  matchReason: string;
  priority: 'HIGH' | 'MEDIUM';
}

export interface AIMentorStructuredResponse {
  version: '1';
  message: string;
  careerAssessment: {
    level: string;
    targetRole: string;
  };
  skillGaps: string[];
  learningPath: Array<{
    phase: number;
    title: string;
    skills: string[];
  }>;
  recommendations: HydratedRecommendation[];
  projects: Array<{
    title: string;
    skills: string[];
  }>;
  nextAction: string;
}

export class AIService {
  static async chatMentor(rawPrompt: string, userId?: string): Promise<AIMentorStructuredResponse> {
    try {
      const prompt = rawPrompt.trim();

      // 1. Extract Structured Intent from User Prompt
      const intent = IntentExtractionService.extractIntent(prompt);

      // 2. Handle Prompt Injection Attacks Safely
      if (intent.isPromptInjection) {
        return {
          version: '1',
          message: 'I am the SkillForge AI Career Mentor, focused strictly on tech career roadmaps, engineering skill development, and course recommendations.',
          careerAssessment: {
            level: 'INTERMEDIATE',
            targetRole: 'Software Engineer',
          },
          skillGaps: ['Engineering Best Practices', 'Secure Coding'],
          learningPath: [
            { phase: 1, title: 'Foundational Systems', skills: ['TypeScript', 'Architecture'] },
          ],
          recommendations: [],
          projects: [],
          nextAction: 'Ask me about specific engineering roles, technologies, or learning paths.',
        };
      }

      // 3. Handle Off-Topic Queries Politely
      if (intent.isOffTopic) {
        return {
          version: '1',
          message: "I'm focused on helping you with technology careers, engineering skills, learning paths, and SkillForge programs. Tell me what technical role or engineering skill you're working toward and I will craft a personalized roadmap for you.",
          careerAssessment: {
            level: 'UNKNOWN',
            targetRole: 'Technology Career Explorer',
          },
          skillGaps: [],
          learningPath: [],
          recommendations: [],
          projects: [],
          nextAction: 'Tell me your target tech role (e.g. Backend Engineer, AI Engineer, Full-Stack Developer) to get started.',
        };
      }

      // 4. Fetch User Learning Context (skills, completed courses, enrollments)
      const userContext = await CourseRecommendationService.getUserContext(userId);

      // 5. Retrieve Top Scored Catalog Candidates from MongoDB
      const candidates = await CourseRecommendationService.getTopCandidates(intent, userContext, 8);

      let llmOutput: LLMIdentityOutput;

      // 6. Invoke Gemini LLM Provider or Deterministic Rule Engine
      if (env.AI_API_KEY && env.AI_API_KEY.trim() !== '') {
        try {
          llmOutput = await this.callGeminiProvider(prompt, intent, candidates, userContext);
        } catch (apiErr) {
          logger.warn(apiErr, 'Gemini API provider call failed or timed out, invoking deterministic rule engine');
          llmOutput = this.smartRuleEngine(intent, candidates, userContext);
        }
      } else {
        llmOutput = this.smartRuleEngine(intent, candidates, userContext);
      }

      // 7. Hydrate & Strictly Ground Recommendations against MongoDB
      const hydratedRecommendations = await this.hydrateAndValidateCourses(
        llmOutput.recommendations,
        candidates,
        userContext,
        intent
      );

      // 8. Construct Final Response Payload
      return {
        version: '1',
        message: llmOutput.message,
        careerAssessment: {
          level: llmOutput.careerAssessment.level || intent.experienceLevel || 'INTERMEDIATE',
          targetRole: intent.targetRole || llmOutput.careerAssessment.targetRole || 'Software Engineer',
        },
        skillGaps: (llmOutput.skillGaps.length > 0 ? llmOutput.skillGaps : SkillTaxonomyService.calculateSkillGaps(intent.targetRole, intent.existingSkills, intent.experienceLevel).skillGaps).slice(0, 10),
        learningPath: (llmOutput.learningPath.length > 0 ? llmOutput.learningPath : SkillTaxonomyService.getLearningPath(intent.targetRole, intent.existingSkills)).slice(0, 6),
        recommendations: hydratedRecommendations.slice(0, 5),
        projects: (llmOutput.projects.length > 0 ? llmOutput.projects : SkillTaxonomyService.getProjectsForRole(intent.targetRole, intent.experienceLevel)).slice(0, 4),
        nextAction: llmOutput.nextAction || SkillTaxonomyService.getRoleTaxonomy(intent.targetRole).concreteNextAction,
      };
    } catch (error) {
      logger.error(error, 'AIService.chatMentor error');
      throw error;
    }
  }

  static async getRecommendations(userId: string) {
    const userContext = await CourseRecommendationService.getUserContext(userId);
    const mockIntent = IntentExtractionService.extractIntent('recommended courses for career advancement');
    const candidates = await CourseRecommendationService.getTopCandidates(mockIntent, userContext, 6);

    const candidateIds = candidates.map((c) => c.id);
    return Course.find({ _id: { $in: candidateIds }, status: 'PUBLISHED' })
      .populate('category', 'name slug icon')
      .populate('instructor', 'name avatar')
      .lean();
  }

  private static async callGeminiProvider(
    prompt: string,
    intent: UserIntent,
    candidates: CandidateCourse[],
    userContext: UserLearningContext
  ): Promise<LLMIdentityOutput> {
    const candidateContext = candidates.map((c) => ({
      courseId: c.id,
      title: c.title,
      type: c.type,
      level: c.level,
      category: c.categoryName,
      skills: c.skills,
      learningOutcomes: c.learningOutcomes,
      description: c.shortDescription,
    }));

    const systemPrompt = `You are the SkillForge AI Career Mentor, an expert Senior Engineering Director and Career Advisor.
User Query: "${prompt}"

Extracted Intent:
- Target Role: ${intent.targetRole}
- Assessed Experience Level: ${intent.experienceLevel}
- Stated Existing Skills: ${intent.existingSkills.join(', ') || 'None stated'}
- Career Goal: ${intent.careerGoal}
- Timeframe: ${intent.timeframe || 'Not specified'}
- Preferred Format: ${intent.preferredFormat}

User Profile History:
- Profile Skills: ${userContext.userSkills.join(', ') || 'None'}
- Completed Courses: ${userContext.completedCourseIds.length} completed

Candidate SkillForge Catalog Programs (Use ONLY these courseId values when making recommendations):
${JSON.stringify(candidateContext, null, 2)}

CORE GUIDELINES:
1. Grounding: Do NOT invent courses or course IDs. Only recommend courseId values from the candidates above.
2. Skill Gaps: Accurately list the major skills the user is missing for their target role.
3. Recommendations: Provide specific reasons explaining why the course helps bridge their gaps.
4. Learning Path: Provide 2 to 4 sequenced learning phases with clear milestones.
5. Projects: Provide realistic, level-appropriate portfolio projects.
6. Format: Output ONLY raw valid JSON matching this schema with NO markdown code blocks.

SCHEMA:
{
  "message": "Clear, encouraging, insightful advice summarizing the career plan",
  "careerAssessment": { "level": "${intent.experienceLevel}", "targetRole": "${intent.targetRole}" },
  "skillGaps": ["Skill 1", "Skill 2"],
  "learningPath": [
    { "phase": 1, "title": "Phase Title", "skills": ["Skill 1", "Skill 2"] }
  ],
  "recommendations": [
    { "courseId": "EXACT_ID_FROM_CANDIDATES", "matchReason": "Personalized reason referencing user's gap", "priority": "HIGH" }
  ],
  "projects": [
    { "title": "Project Title", "skills": ["Skill 1", "Skill 2"] }
  ],
  "nextAction": "Concrete immediate next action"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error: ${response.status}`);
    }

    const data: any = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean markdown ticks
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedJSON = JSON.parse(rawText);
      return llmIdentityOutputSchema.parse(parsedJSON);
    } catch (parseErr) {
      logger.warn(parseErr, 'Failed to parse Gemini output as schema, invoking deterministic fallback');
      return this.smartRuleEngine(intent, candidates, userContext);
    }
  }

  /**
   * Deterministic Catalog Rule Engine Fallback when LLM is unavailable or fails
   */
  private static smartRuleEngine(
    intent: UserIntent,
    candidates: CandidateCourse[],
    userContext: UserLearningContext
  ): LLMIdentityOutput {
    const { skillGaps } = SkillTaxonomyService.calculateSkillGaps(
      intent.targetRole,
      [...intent.existingSkills, ...userContext.userSkills],
      intent.experienceLevel
    );

    const learningPath = SkillTaxonomyService.getLearningPath(
      intent.targetRole,
      [...intent.existingSkills, ...userContext.userSkills]
    );

    const projects = SkillTaxonomyService.getProjectsForRole(
      intent.targetRole,
      intent.experienceLevel
    );

    const roleTaxonomy = SkillTaxonomyService.getRoleTaxonomy(intent.targetRole);

    // Formulate recommendations from top candidates
    const recommendations = candidates.slice(0, 4).map((c, idx) => ({
      courseId: c.id,
      matchReason: `Directly targets ${intent.targetRole} skill gaps in ${c.skills.slice(0, 3).join(', ')}.`,
      priority: (idx === 0 ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM',
    }));

    let message = `Here is your structured career blueprint for ${intent.targetRole}.`;
    if (intent.timeframe) {
      message += ` Tailored for your ${intent.timeframe} timeline.`;
    }
    if (intent.existingSkills.length > 0) {
      message += ` Building upon your existing knowledge of ${intent.existingSkills.join(', ')}.`;
    }

    return {
      message,
      careerAssessment: {
        level: intent.experienceLevel,
        targetRole: intent.targetRole,
      },
      skillGaps,
      learningPath,
      recommendations,
      projects,
      nextAction: roleTaxonomy.concreteNextAction,
    };
  }

  /**
   * Strict MongoDB Grounding & Verification Pipeline:
   * 1. Validates each recommended courseId against MongoDB.
   * 2. Confirms course status is PUBLISHED.
   * 3. Excludes completed courses.
   * 4. Overwrites all metadata with canonical database values.
   * 5. Fallbacks to top candidates if LLM returned non-existent or invalid course IDs.
   */
  private static async hydrateAndValidateCourses(
    recommendations: Array<{ courseId: string; matchReason: string; priority: 'HIGH' | 'MEDIUM' }>,
    candidatePool: CandidateCourse[],
    userContext: UserLearningContext,
    intent: UserIntent
  ): Promise<HydratedRecommendation[]> {
    const validRecs: HydratedRecommendation[] = [];
    const processedIds = new Set<string>();
    const candidateIdMap = new Map(candidatePool.map((c) => [c.id, c]));

    for (const rec of recommendations) {
      if (!rec.courseId || processedIds.has(rec.courseId)) continue;

      // Exclude courses that user has already completed
      if (userContext.completedCourseIds.includes(rec.courseId)) continue;

      try {
        const courseDoc = await Course.findOne({ _id: rec.courseId, status: 'PUBLISHED' })
          .populate('category', 'name slug icon')
          .populate('instructor', 'name avatar')
          .lean();

        if (courseDoc) {
          const candidateData = candidateIdMap.get(rec.courseId);
          validRecs.push({
            course: courseDoc,
            matchReason: rec.matchReason || `Matches your ${intent.targetRole} learning requirements.`,
            priority: candidateData && candidateData.score >= 50 ? rec.priority || 'HIGH' : 'MEDIUM',
          });
          processedIds.add(rec.courseId);
        }
      } catch (e) {
        logger.warn(`Invalid recommended courseId discarded: ${rec.courseId}`);
      }
    }

    // If no valid recommendations were found, safely fallback to top candidates
    if (validRecs.length === 0 && candidatePool.length > 0) {
      const topCandidates = candidatePool
        .filter((c) => !userContext.completedCourseIds.includes(c.id) && c.score > 0)
        .slice(0, 3);

      const topIds = topCandidates.map((c) => c.id);
      const docs = await Course.find({ _id: { $in: topIds }, status: 'PUBLISHED' })
        .populate('category', 'name slug icon')
        .populate('instructor', 'name avatar')
        .lean();

      docs.forEach((doc: any, idx: number) => {
        validRecs.push({
          course: doc,
          matchReason: `High-relevance program for your ${intent.targetRole} roadmap.`,
          priority: idx === 0 ? 'HIGH' : 'MEDIUM',
        });
      });
    }

    return validRecs;
  }
}
