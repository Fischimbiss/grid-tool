import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiSchema, AiFormData } from './schema';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';

interface Props {
  lastSnapshot?: Partial<AiFormData>;
  onCreateCR?: (tasks: string[]) => void;
}

const corpRank = { low: 0, medium: 1, high: 2 } as const;
const autoRank = { advice: 0, partial: 1, autonomous: 2 } as const;

export const AITab: React.FC<Props> = ({ lastSnapshot, onCreateCR }) => {
  const form = useForm<AiFormData>({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      ai_present: true,
      purpose: '',
      process_impact: '',
      employee_interaction: false,
      personal_data_used: false,
      personal_data_categories: [],
      retention: '',
      interfaces: [{ source: '', target: '', via_middleware: false }],
      model: { type: '', version: '', provider: '', deployment: 'onprem', region: '', adaptation: 'prompting' },
      autonomy: 'advice',
      hitl: { required: false, thresholds: '' },
      permission_dimensions: '',
      transparency_notice: { required: false, artifact_link: '' },
      risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: '' },
      dea: { uploaded: false, date: '', link: '' },
      monitoring: { metrics: [], eval_cadence: '' },
      kbv_checks: {
        no_perf_control: false,
        no_exports: false,
        need_to_know: false,
        test_data_anonymized: false,
        public_data_no_perf_insights: false,
      },
      foreign_external_processing: { present: false, notes: '' },
    },
  });

  const aiPresent = form.watch('ai_present');
  const corpClass = form.watch('risk.corp_class');
  const employeeInteraction = form.watch('employee_interaction');
  const personalData = form.watch('personal_data_used');

  const onSubmit = (data: AiFormData) => {
    if (onCreateCR && lastSnapshot) {
      const tasks: string[] = [];
      if (JSON.stringify(data.model) !== JSON.stringify(lastSnapshot.model)) tasks.push('model change');
      const dataObj = {
        personal_data_used: data.personal_data_used,
        personal_data_categories: data.personal_data_categories,
        interfaces: data.interfaces,
        retention: data.retention,
      };
      const lastDataObj = {
        personal_data_used: lastSnapshot.personal_data_used,
        personal_data_categories: lastSnapshot.personal_data_categories,
        interfaces: lastSnapshot.interfaces,
        retention: lastSnapshot.retention,
      };
      if (JSON.stringify(dataObj) !== JSON.stringify(lastDataObj)) tasks.push('data change');
      if (lastSnapshot.autonomy && autoRank[data.autonomy] > autoRank[lastSnapshot.autonomy]) tasks.push('autonomy upgrade');
      if (lastSnapshot.risk?.corp_class && corpRank[data.risk.corp_class] > corpRank[lastSnapshot.risk.corp_class]) tasks.push('risk jump');
      if (!lastSnapshot.employee_interaction && data.employee_interaction) tasks.push('new employee_interaction');
      if (!lastSnapshot.foreign_external_processing?.present && data.foreign_external_processing.present) tasks.push('foreign/external added');
      onCreateCR(tasks);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="flex items-center gap-2">
          <Checkbox {...form.register('ai_present')} /> aiTab.aiPresent.label
        </label>
      </div>
      {!aiPresent && (
        <div>
          <label>aiTab.processImpact.label</label>
          <Textarea maxLength={600} {...form.register('process_impact')} />
        </div>
      )}
      {aiPresent && (
        <>
          <section>
            <h2>B: aiTab.purpose.label</h2>
            <Textarea maxLength={600} {...form.register('purpose')} />
          </section>

          <section>
            <h2>C: aiTab.data.label</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('personal_data_used')} /> aiTab.personalDataUsed.label
            </label>
            {personalData && (
              <div className="space-y-2 pl-4">
                <label>aiTab.personalDataCategories.label</label>
                <Input {...form.register('personal_data_categories')} placeholder="cat1, cat2" />
                <label>aiTab.retention.label</label>
                <Input {...form.register('retention')} />
                <div>
                  <label>Interface 1 source</label>
                  <Input {...form.register('interfaces.0.source')} />
                  <label>Interface 1 target</label>
                  <Input {...form.register('interfaces.0.target')} />
                  <label className="flex items-center gap-2">
                    <Checkbox {...form.register('interfaces.0.via_middleware')} /> via middleware
                  </label>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2>D: aiTab.model.label</h2>
            <Input placeholder="Type" {...form.register('model.type')} />
            <Input placeholder="Version" {...form.register('model.version')} />
            <Input placeholder="Provider" {...form.register('model.provider')} />
            <select {...form.register('model.deployment')}>
              <option value="onprem">onprem</option>
              <option value="saas">saas</option>
              <option value="cloud">cloud</option>
            </select>
            <Input placeholder="Region" {...form.register('model.region')} />
            <select {...form.register('model.adaptation')}>
              <option value="prompting">prompting</option>
              <option value="finetune">finetune</option>
              <option value="rag">rag</option>
              <option value="other">other</option>
            </select>
          </section>

          <section>
            <h2>E: aiTab.autonomy.label</h2>
            <div>
              <label className="flex items-center gap-1">
                <input type="radio" value="advice" {...form.register('autonomy')} /> advice
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" value="partial" {...form.register('autonomy')} /> partial
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" value="autonomous" {...form.register('autonomy')} /> autonomous
              </label>
            </div>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('hitl.required')} /> aiTab.hitlRequired.label
            </label>
            <Input placeholder="Thresholds" {...form.register('hitl.thresholds')} />
            <Input placeholder="Permission dimensions" {...form.register('permission_dimensions')} />
          </section>

          <section>
            <h2>F: aiTab.transparency.label</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('transparency_notice.required')} disabled={!employeeInteraction} /> aiTab.transparencyNotice.label
            </label>
            <Input placeholder="Link" {...form.register('transparency_notice.artifact_link')} />
          </section>

          <section>
            <h2>G: aiTab.risk.label</h2>
            <select {...form.register('risk.eu_ai_act')}>
              <option value="minimal">minimal</option>
              <option value="limited">limited</option>
              <option value="high">high</option>
              <option value="prohibited">prohibited</option>
            </select>
            <select {...form.register('risk.corp_class')}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <Input placeholder="Justification" {...form.register('risk.justification')} />
          </section>

          <section>
            <h2>H: aiTab.kbv.label</h2>
            {(['no_perf_control','no_exports','need_to_know','test_data_anonymized','public_data_no_perf_insights'] as const).map(k => (
              <label key={k} className="flex items-center gap-2">
                <Checkbox {...form.register(`kbv_checks.${k}` as const)} /> {k}
              </label>
            ))}
          </section>

          <section>
            <h2>aiTab.dea.label</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('dea.uploaded')} /> aiTab.deaUploaded.label
            </label>
            <Input placeholder="Date" {...form.register('dea.date')} />
            <Input placeholder="Link" {...form.register('dea.link')} />
          </section>

          <section>
            <h2>aiTab.foreign.label</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('foreign_external_processing.present')} /> aiTab.foreignPresent.label
            </label>
            <Textarea {...form.register('foreign_external_processing.notes')} />
          </section>

          <aside className="p-2 border">
            {corpClass === 'low' && <p>KBV-Standards anwenden</p>}
            {corpClass === 'medium' && <p>KBV-Standards anwenden – Transparenzpflicht ggü. Beschäftigten</p>}
            {corpClass === 'high' && (
              <ul>
                <li>KI-Expert:innenkreis</li>
                <li>Fairnessmetriken</li>
                <li>QA-Plan</li>
                <li>Regelmäßige Evaluation</li>
                <li>Human-in-the-Loop</li>
              </ul>
            )}
          </aside>
        </>
      )}
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default AITab;
