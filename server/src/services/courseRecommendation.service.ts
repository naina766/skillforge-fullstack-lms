import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { User } from '../models/User';
import { logger } from '../config/logger';
import { UserIntent } from './intentExtraction.service';
import { SkillTaxonomyService } from './skillTaxonomy.service';

export interface CandidateCourse {
  id: string;
  title: string;
  slug: string;
  type: string;
  level: string;
  categoryName: string;
  skills: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  shortDescription: string;
  price: number;
  rating: number;
  enrollmentCount: number;
  score: number;
  scoreBreakdown: {
    roleRelevance: number;
    skillCoverage: number;
    levelMatch: number;
    prerequisiteMatch: number;
    formatMatch: number;
    outcomeMatch: number;
    progressAdjustment: number;
  };
}

export interface UserLearningContext {
  userId?: string;
  userSkills: string[];
  userInterests: string[];
  enrolledCourseIds: string[];
  completedCourseIds: string[];
}

export class CourseRecommendationService {
  /**
   * Loads authenticated user context (skills, interests, enrolled & completed course IDs)
   */
  static async getUserContext(userId?: string): Promise<UserLearningContext> {
    if (!userId) {
      return {
        userSkills: [],
        userInterests: [],
        enrolledCourseIds: [],
        completedCourseIds: [],
      };
    }

    try {
      const user = await User.findById(userId).select('skills interests learningGoals').lean();
      const enrollments = await Enrollment.find({ student: userId }).select('course status').lean();

      const enrolledCourseIds = enrollments.map((e) => e.course.toString());
      const completedCourseIds = enrollments
        .filter((e) => e.status === 'COMPLETED')
        .map((e) => e.course.toString());

      return {
        userId,
        userSkills: user?.skills || [],
        userInterests: user?.interests || [],
        enrolledCourseIds,
        completedCourseIds,
      };
    } catch (err) {
      logger.error(err, 'Failed to fetch user context for recommendation scoring');
      return {
        userSkills: [],
        userInterests: [],
        enrolledCourseIds: [],
        completedCourseIds: [],
      };
    }
  }

  /**
   * Deterministically scores and retrieves Top Catalog Candidates from MongoDB
   */
  static async getTopCandidates(
    intent: UserIntent,
    userContext: UserLearningContext,
    candidateLimit: number = 10
  ): Promise<CandidateCourse[]> {
    const publishedCourses = await Course.find({ status: 'PUBLISHED' })
      .populate('category', 'name slug')
      .select('title slug type level category skills prerequisites learningOutcomes shortDescription price rating enrollmentCount')
      .lean();

    const { skillGaps } = SkillTaxonomyService.calculateSkillGaps(
      intent.targetRole,
      [...intent.existingSkills, ...userContext.userSkills],
      intent.experienceLevel
    );

    const targetRoleLower = intent.targetRole.toLowerCase();
    const primaryGoalLower = intent.primaryGoal.toLowerCase();
    const allUserKnownSkills = new Set(
      [...intent.existingSkills, ...userContext.userSkills].map((s) => s.toLowerCase())
    );
    const missingSkillsLower = new Set(
      [...skillGaps, ...intent.desiredSkills].map((s) => s.toLowerCase())
    );

    const scoredCourses: CandidateCourse[] = publishedCourses.map((course: any) => {
      const courseIdStr = course._id.toString();
      const courseTitleLower = (course.title || '').toLowerCase();
      const categoryName = course.category?.name || '';
      const categoryLower = categoryName.toLowerCase();
      const courseSkills: string[] = course.skills || [];
      const coursePrereqs: string[] = course.prerequisites || [];
      const courseOutcomes: string[] = course.learningOutcomes || [];

      // 1. Role Relevance (Max 30 points)
      let roleRelevance = 0;
      if (courseTitleLower.includes(targetRoleLower) || targetRoleLower.includes(courseTitleLower)) {
        roleRelevance += 25;
      }
      if (primaryGoalLower.includes(categoryLower) || categoryLower.includes(primaryGoalLower)) {
        roleRelevance += 15;
      }
      if (courseTitleLower.includes('full-stack') && targetRoleLower.includes('full-stack')) {
        roleRelevance += 20;
      }
      if (courseTitleLower.includes('backend') && targetRoleLower.includes('backend')) {
        roleRelevance += 20;
      }
      if (courseTitleLower.includes('frontend') && targetRoleLower.includes('frontend')) {
        roleRelevance += 20;
      }
      if ((courseTitleLower.includes('ai') || courseTitleLower.includes('llm')) && targetRoleLower.includes('ai')) {
        roleRelevance += 20;
      }
      if (courseTitleLower.includes('devops') && targetRoleLower.includes('devops')) {
        roleRelevance += 20;
      }
      if (courseTitleLower.includes('data') && targetRoleLower.includes('data')) {
        roleRelevance += 20;
      }
      if (courseTitleLower.includes('security') && targetRoleLower.includes('security')) {
        roleRelevance += 20;
      }
      roleRelevance = Math.min(30, roleRelevance);

      // 2. Skill Gap Coverage (Max 30 points)
      let skillCoverage = 0;
      let coveredGapCount = 0;
      courseSkills.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        if (missingSkillsLower.has(skillLower) || missingSkillsLower.has(skillLower.replace(/\.js/i, ''))) {
          coveredGapCount += 1;
        }
      });
      skillCoverage = Math.min(30, coveredGapCount * 10);

      // 3. Level Matching (Max 15 points)
      let levelMatch = 10;
      const courseLevel = course.level || 'ALL_LEVELS';
      if (intent.experienceLevel === 'BEGINNER') {
        if (courseLevel === 'BEGINNER') levelMatch = 15;
        else if (courseLevel === 'ALL_LEVELS') levelMatch = 12;
        else if (courseLevel === 'INTERMEDIATE') levelMatch = 8;
        else if (courseLevel === 'ADVANCED') levelMatch = 0; // Penalize advanced for beginners
      } else if (intent.experienceLevel === 'ADVANCED') {
        if (courseLevel === 'ADVANCED') levelMatch = 15;
        else if (courseLevel === 'INTERMEDIATE') levelMatch = 12;
        else if (courseLevel === 'ALL_LEVELS') levelMatch = 10;
        else if (courseLevel === 'BEGINNER') levelMatch = 4;
      } else {
        // Intermediate / Unknown
        if (courseLevel === 'INTERMEDIATE' || courseLevel === 'ALL_LEVELS') levelMatch = 15;
        else if (courseLevel === 'BEGINNER') levelMatch = 10;
        else if (courseLevel === 'ADVANCED') levelMatch = 10;
      }

      // 4. Prerequisite Match (Max 10 points)
      let prerequisiteMatch = 8;
      if (coursePrereqs.length > 0) {
        let satisfiedPrereqs = 0;
        coursePrereqs.forEach((prereq) => {
          const prereqLower = prereq.toLowerCase();
          if (Array.from(allUserKnownSkills).some((us) => prereqLower.includes(us))) {
            satisfiedPrereqs += 1;
          }
        });
        prerequisiteMatch = Math.min(10, 4 + satisfiedPrereqs * 3);
      }

      // 5. Format Match (Max 5 points)
      let formatMatch = 3;
      if (intent.preferredFormat !== 'ALL') {
        if (course.type === intent.preferredFormat) formatMatch = 5;
        else formatMatch = 1;
      }

      // 6. Learning Outcome Match (Max 5 points)
      let outcomeMatch = 2;
      courseOutcomes.forEach((outcome) => {
        const outLower = outcome.toLowerCase();
        if (outLower.includes(targetRoleLower) || outLower.includes(primaryGoalLower)) {
          outcomeMatch = 5;
        }
      });

      // 7. User Progress Penalty / Bonus
      let progressAdjustment = 0;
      if (userContext.completedCourseIds.includes(courseIdStr)) {
        progressAdjustment = -60; // Never re-recommend completed courses
      } else if (userContext.enrolledCourseIds.includes(courseIdStr)) {
        progressAdjustment = -20; // Lower priority if already enrolled
      }

      // Final deterministic total score
      const totalScore = Math.max(
        0,
        roleRelevance + skillCoverage + levelMatch + prerequisiteMatch + formatMatch + outcomeMatch + progressAdjustment
      );

      return {
        id: courseIdStr,
        title: course.title,
        slug: course.slug,
        type: course.type,
        level: course.level,
        categoryName,
        skills: courseSkills,
        prerequisites: coursePrereqs,
        learningOutcomes: courseOutcomes,
        shortDescription: course.shortDescription || '',
        price: course.price || 0,
        rating: course.rating || 0,
        enrollmentCount: course.enrollmentCount || 0,
        score: totalScore,
        scoreBreakdown: {
          roleRelevance,
          skillCoverage,
          levelMatch,
          prerequisiteMatch,
          formatMatch,
          outcomeMatch,
          progressAdjustment,
        },
      };
    });

    // Sort descending by score
    scoredCourses.sort((a, b) => b.score - a.score);

    return scoredCourses.slice(0, candidateLimit);
  }
}
