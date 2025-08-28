import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiSchema, AiFormData } from './schema';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';
import { t } from "./i18n";

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
          <Checkbox {...form.register('ai_present')} /> {t("aiTab.aiPresent.label")}
        </label>
      </div>
      {!aiPresent && (
        <div>
          <label>{t("aiTab.processImpact.label")}</label>
          <Textarea maxLength={600} {...form.register('process_impact')} />
        </div>
      )}
      {aiPresent && (
        <>
          <section>
            <h2>B: {t("aiTab.purpose.label")}</h2>
            <Textarea maxLength={600} {...form.register('purpose')} />
          </section>

          <section>
            <h2>C: {t("aiTab.data.label")}</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('personal_data_used')} /> {t("aiTab.personalDataUsed.label")}
            </label>
            {personalData && (
              <div className="space-y-2 pl-4">
                <label>{t("aiTab.personalDataCategories.label")}</label>
                <Input {...form.register('personal_data_categories')} placeholder={t("aiTab.personalDataCategories.placeholder")} />
                <label>{t("aiTab.retention.label")}</label>
                <Input {...form.register('retention')} />
                <div>
                  <label>{t("aiTab.interface.source.label")}</label>
                  <Input {...form.register('interfaces.0.source')} />
                  <label>{t("aiTab.interface.target.label")}</label>
                  <Input {...form.register('interfaces.0.target')} />
                  <label className="flex items-center gap-2">
                    <Checkbox {...form.register('interfaces.0.via_middleware')} /> {t("aiTab.interface.viaMiddleware.label")}
                  </label>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2>D: {t("aiTab.model.label")}</h2>
            <label>{t("aiTab.model.type.label")}</label>
            <Input {...form.register('model.type')} />
            <label>{t("aiTab.model.version.label")}</label>
            <Input {...form.register('model.version')} />
            <label>{t("aiTab.model.provider.label")}</label>
            <Input {...form.register('model.provider')} />
            <label>{t("aiTab.model.deployment.label")}</label>
            <select {...form.register('model.deployment')}>
              {(['onprem','saas','cloud'] as const).map(opt => (
                <option key={opt} value={opt}>{t(`aiTab.model.deployment.options.${opt}`)}</option>
              ))}
            </select>
            <label>{t("aiTab.model.region.label")}</label>
            <Input {...form.register('model.region')} />
            <label>{t("aiTab.model.adaptation.label")}</label>
            <select {...form.register('model.adaptation')}>
              {(['prompting','finetune','rag','other'] as const).map(opt => (
                <option key={opt} value={opt}>{t(`aiTab.model.adaptation.options.${opt}`)}</option>
              ))}
            </select>
          </section>

          <section>
            <h2>E: {t("aiTab.autonomy.label")}</h2>
            <div>
              {(['advice','partial','autonomous'] as const).map(opt => (
                <label key={opt} className="flex items-center gap-1">
                  <input type="radio" value={opt} {...form.register('autonomy')} /> {t(`aiTab.autonomy.options.${opt}`)}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('hitl.required')} /> {t("aiTab.hitlRequired.label")}
            </label>
            <label>{t("aiTab.hitlThresholds.label")}</label>
            <Input {...form.register('hitl.thresholds')} />
            <label>{t("aiTab.permissionDimensions.label")}</label>
            <Input {...form.register('permission_dimensions')} />
          </section>

          <section>
            <h2>F: {t("aiTab.transparency.label")}</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('transparency_notice.required')} disabled={!employeeInteraction} /> {t("aiTab.transparencyNotice.label")}
            </label>
            <label>{t("aiTab.transparencyNotice.link.label")}</label>
            <Input {...form.register('transparency_notice.artifact_link')} />
          </section>

          <section>
            <h2>G: {t("aiTab.risk.label")}</h2>
            <label>{t("aiTab.risk.euAiAct.label")}</label>
            <select {...form.register('risk.eu_ai_act')}>
              {(['minimal','limited','high','prohibited'] as const).map(opt => (
                <option key={opt} value={opt}>{t(`aiTab.risk.euAiAct.options.${opt}`)}</option>
              ))}
            </select>
            <label>{t("aiTab.risk.corpClass.label")}</label>
            <select {...form.register('risk.corp_class')}>
              {(['low','medium','high'] as const).map(opt => (
                <option key={opt} value={opt}>{t(`aiTab.risk.corpClass.options.${opt}`)}</option>
              ))}
            </select>
            <label>{t("aiTab.risk.justification.label")}</label>
            <Input {...form.register('risk.justification')} />
          </section>

          <section>
            <h2>H: {t("aiTab.kbv.label")}</h2>
            {(['no_perf_control','no_exports','need_to_know','test_data_anonymized','public_data_no_perf_insights'] as const).map(k => (
              <label key={k} className="flex items-center gap-2">
                <Checkbox {...form.register(`kbv_checks.${k}` as const)} /> {t(`aiTab.kbv.${k}.label`)}
              </label>
            ))}
          </section>

          <section>
            <h2>{t("aiTab.dea.label")}</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('dea.uploaded')} /> {t("aiTab.dea.uploaded.label")}
            </label>
            <label>{t("aiTab.dea.date.label")}</label>
            <Input {...form.register('dea.date')} />
            <label>{t("aiTab.dea.link.label")}</label>
            <Input {...form.register('dea.link')} />
          </section>

          <section>
            <h2>{t("aiTab.foreign.label")}</h2>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('foreign_external_processing.present')} /> {t("aiTab.foreign.present.label")}
            </label>
            <label>{t("aiTab.foreign.notes.label")}</label>
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
      <Button type="submit">{t("aiTab.submit.label")}</Button>
    </form>
  );
};

export default AITab;
