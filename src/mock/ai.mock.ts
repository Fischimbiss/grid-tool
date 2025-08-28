import { AiFormData } from '../schema';

export const lowRisk: AiFormData = {
  ai_present: true,
  purpose: 'Test low risk',
  process_impact: '',
  employee_interaction: false,
  personal_data_used: false,
  personal_data_categories: [],
  retention: '',
  interfaces: [],
  model: { type: 'gpt', version: '1', provider: 'openai', deployment: 'cloud', region: 'eu', adaptation: 'prompting' },
  autonomy: 'advice',
  hitl: { required: false, thresholds: '' },
  permission_dimensions: '',
  transparency_notice: { required: false, notice_text: '', other_marking: '' },
  risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'minimal risk' },
  dea: { uploaded: true, date: '2024-01-01', link: '' },
  monitoring: { metrics: ['accuracy'], eval_cadence: '' },
  kbv_checks: {
    no_perf_control: true,
    no_exports: true,
    need_to_know: true,
    test_data_anonymized: true,
    public_data_no_perf_insights: true,
  },
  foreign_external_processing: { present: false, notes: '' },
};

export const mediumRisk: AiFormData = {
  ...lowRisk,
  risk: { eu_ai_act: 'limited', corp_class: 'medium', justification: 'medium risk' },
};

export const highRisk: AiFormData = {
  ...lowRisk,
  risk: { eu_ai_act: 'high', corp_class: 'high', justification: 'high risk' },
  monitoring: { metrics: ['accuracy', 'fairness', 'drift'], eval_cadence: 'monthly' },
  hitl: { required: true, thresholds: '' },
  permission_dimensions: 'role-based',
};
