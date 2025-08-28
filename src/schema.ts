import { z } from 'zod';

const interfaceSchema = z.object({
  source: z.string(),
  target: z.string(),
  via_middleware: z.boolean(),
});

export const aiSchema = z.object({
  ai_present: z.boolean(),
  purpose: z.string().max(600),
  process_impact: z.string().optional(),
  employee_interaction: z.boolean(),
  personal_data_used: z.boolean(),
  personal_data_categories: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',').map((v) => v.trim()).filter(Boolean) : val),
    z.array(z.string()).optional()
  ),
  retention: z.string().optional(),
  interfaces: z.array(interfaceSchema).optional(),
  model: z.object({
    type: z.string(),
    version: z.string(),
    provider: z.string(),
    deployment: z.enum(['onprem', 'saas', 'cloud']),
    region: z.string(),
    adaptation: z.enum(['prompting', 'finetune', 'rag', 'other']),
  }),
  autonomy: z.enum(['advice', 'partial', 'autonomous']),
  hitl: z.object({
    required: z.boolean(),
    thresholds: z.string().optional(),
  }),
  permission_dimensions: z.string().optional(),
  transparency_notice: z.object({
    required: z.boolean(),
    artifact_link: z.string().url().optional(),
  }),
  risk: z.object({
    eu_ai_act: z.enum(['minimal', 'limited', 'high', 'prohibited']),
    corp_class: z.enum(['low', 'medium', 'high']),
    justification: z.string(),
  }),
  dea: z.object({
    completed: z.boolean(),
    date: z.string(),
    file: z.any().optional(),
  }),
  monitoring: z.object({
    metrics: z.array(z.enum(['accuracy', 'fairness', 'drift'])),
    eval_cadence: z.string().optional(),
  }),
}).superRefine((data, ctx) => {
  if (data.employee_interaction) {
    if (!data.transparency_notice.required) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transparency_notice', 'required'], message: 'required' });
    }
    if (!data.transparency_notice.artifact_link) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transparency_notice', 'artifact_link'], message: 'link required' });
    }
  }

  if (data.personal_data_used) {
    if (!data.personal_data_categories || data.personal_data_categories.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personal_data_categories'], message: 'categories required' });
    }
    if (!data.retention) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['retention'], message: 'retention required' });
    }
    if (!data.interfaces || data.interfaces.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['interfaces'], message: 'interface required' });
    }
  }

  if (data.risk.corp_class === 'high') {
    if (!data.monitoring.metrics.includes('fairness')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monitoring', 'metrics'], message: 'fairness metric required' });
    }
    if (!data.monitoring.eval_cadence) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monitoring', 'eval_cadence'], message: 'eval cadence required' });
    }
    if (!data.hitl.required) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hitl', 'required'], message: 'hitl required' });
    }
    if (!data.permission_dimensions) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['permission_dimensions'], message: 'permission dimensions required' });
    }
  }

  if (!data.dea.completed) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dea', 'completed'], message: 'dea must be completed' });
  }
});

export type AiFormData = z.infer<typeof aiSchema>;
