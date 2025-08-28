import { aiSchema } from './schema';

describe('aiSchema validation', () => {
  it('requires transparency when employee interaction', () => {
    const res = aiSchema.safeParse({
      ai_present: true,
      purpose: 'x',
      process_impact: '',
      employee_interaction: true,
      personal_data_used: false,
      model: { type: 't', version: '1', provider: 'p', deployment: 'onprem', region: 'r', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: false },
      transparency_notice: { required: false },
      risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'j' },
      dea: { completed: true, date: '2024-01-01' },
      monitoring: { metrics: ['accuracy'] },
    });
    expect(res.success).toBe(false);
  });

  it('requires categories when personal data used', () => {
    const res = aiSchema.safeParse({
      ai_present: true,
      purpose: 'x',
      process_impact: '',
      employee_interaction: false,
      personal_data_used: true,
      retention: '',
      interfaces: [],
      model: { type: 't', version: '1', provider: 'p', deployment: 'onprem', region: 'r', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: false },
      transparency_notice: { required: false },
      risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'j' },
      dea: { completed: true, date: '2024-01-01' },
      monitoring: { metrics: ['accuracy'] },
    });
    expect(res.success).toBe(false);
  });

  it('high risk requires fairness metric and hitl', () => {
    const res = aiSchema.safeParse({
      ai_present: true,
      purpose: 'x',
      process_impact: '',
      employee_interaction: false,
      personal_data_used: false,
      model: { type: 't', version: '1', provider: 'p', deployment: 'onprem', region: 'r', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: false },
      transparency_notice: { required: false },
      risk: { eu_ai_act: 'high', corp_class: 'high', justification: 'j' },
      dea: { completed: true, date: '2024-01-01' },
      monitoring: { metrics: ['accuracy'] },
    });
    expect(res.success).toBe(false);
  });

  it('requires dea completed', () => {
    const res = aiSchema.safeParse({
      ai_present: true,
      purpose: 'x',
      process_impact: '',
      employee_interaction: false,
      personal_data_used: false,
      model: { type: 't', version: '1', provider: 'p', deployment: 'onprem', region: 'r', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: false },
      transparency_notice: { required: false },
      risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'j' },
      dea: { completed: false, date: '2024-01-01' },
      monitoring: { metrics: ['accuracy'] },
    });
    expect(res.success).toBe(false);
  });

  it('passes with high risk and requirements met', () => {
    const res = aiSchema.safeParse({
      ai_present: true,
      purpose: 'x',
      process_impact: '',
      employee_interaction: false,
      personal_data_used: false,
      model: { type: 't', version: '1', provider: 'p', deployment: 'onprem', region: 'r', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: true },
      transparency_notice: { required: false },
      risk: { eu_ai_act: 'high', corp_class: 'high', justification: 'j' },
      dea: { completed: true, date: '2024-01-01' },
      monitoring: { metrics: ['accuracy', 'fairness'], eval_cadence: 'm' },
      permission_dimensions: 'role',
    });
    expect(res.success).toBe(true);
  });
});
