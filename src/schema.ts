import { z } from 'zod';

const richText = z.string().min(1).max(5000);

export const aiSchema = z
  .object({
    description: richText,
    processImpact: richText,
    employeeDataProcessed: z.boolean(),
    employeeDataDetails: richText.optional(),
    modelDescription: richText,
    autonomyAssessment: richText,
    corporateRisk: z.enum(['low', 'medium', 'high']),
    corporateRiskJustification: richText,
    aiActRisk: z.enum(['low', 'medium', 'high']),
    worksCouncilInformed: z.boolean(),
    worksCouncilFile: z.any().optional(),
    reminderDaysBeforeWba: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.employeeDataProcessed && !data.employeeDataDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employeeDataDetails'],
        message: 'Bitte Details zu den Beschäftigtendaten angeben.',
      });
    }

    if (!data.worksCouncilInformed && !data.reminderDaysBeforeWba) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reminderDaysBeforeWba'],
        message: 'Bitte eine Erinnerung vor dem geplanten WBA konfigurieren.',
      });
    }
  });

export type AiFormData = z.infer<typeof aiSchema>;
