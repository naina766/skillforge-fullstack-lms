import { z } from 'zod';

export const mentorPromptSchema = z.object({
  body: z.object({
    prompt: z
      .string({ required_error: 'Prompt is required' })
      .min(1, 'Prompt cannot be empty')
      .max(1000, 'Prompt exceeds maximum length of 1,000 characters')
      .transform((val) => val.trim()),
    conversationId: z.string().optional(),
  }),
});

export const llmIdentityOutputSchema = z.object({
  message: z.string().default('Here is your personalized career guidance.'),
  careerAssessment: z
    .object({
      level: z.string().default('INTERMEDIATE'),
      targetRole: z.string().default('Software Engineer'),
    })
    .default({ level: 'INTERMEDIATE', targetRole: 'Software Engineer' }),
  skillGaps: z.array(z.string()).max(10).default([]),
  learningPath: z
    .array(
      z.object({
        phase: z.number(),
        title: z.string(),
        skills: z.array(z.string()),
      })
    )
    .max(6)
    .default([]),
  recommendations: z
    .array(
      z.object({
        courseId: z.string(),
        matchReason: z.string(),
        priority: z.enum(['HIGH', 'MEDIUM']).default('HIGH'),
      })
    )
    .max(5)
    .default([]),
  projects: z
    .array(
      z.object({
        title: z.string(),
        skills: z.array(z.string()),
      })
    )
    .max(4)
    .default([]),
  nextAction: z.string().default('Explore the recommended SkillForge courses to start learning.'),
});

export type LLMIdentityOutput = z.infer<typeof llmIdentityOutputSchema>;
export type MentorPromptInput = z.infer<typeof mentorPromptSchema>;
