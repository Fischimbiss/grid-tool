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
      dea: { completed: false, date: '', file: undefined },
      monitoring: { metrics: [], eval_cadence: '' },
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
      onCreateCR(tasks);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <section>
        <h2>A: {t("aiTab.aiPresent.label")}</h2>
        <p>{t("aiTab.aiPresent.description")}</p>
        <label className="flex items-center gap-2">
          <Checkbox {...form.register('ai_present')} /> {t("aiTab.aiPresent.checkbox")}
        </label>
      </section>
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
            <p>{t("aiTab.purpose.description")}</p>

            <Textarea maxLength={600} {...form.register('purpose')} />
          </section>

          <section>
            <h2>C: {t("aiTab.data.label")}</h2>
            <p>{t("aiTab.data.description")}</p>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('personal_data_used')} /> {t("aiTab.personalDataUsed.label")}
            </label>
            {personalData && (
              <div className="space-y-2 pl-4">
                <label>{t("aiTab.personalDataCategories.label")}</label>
                <Input
                  {...form.register('personal_data_categories')}
                  placeholder={t("aiTab.personalDataCategories.placeholder")}
                />
                <label>{t("aiTab.retention.label")}</label>
                <Input {...form.register('retention')} />
                <div>
                  <label>{t("aiTab.interfaces.source")}</label>
                  <Input {...form.register('interfaces.0.source')} />
                  <label>{t("aiTab.interfaces.target")}</label>
                  <Input {...form.register('interfaces.0.target')} />
                  <label className="flex items-center gap-2">
                    <Checkbox {...form.register('interfaces.0.via_middleware')} /> {t("aiTab.interfaces.viaMiddleware")}
                  </label>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2>D: {t("aiTab.model.label")}</h2>
            <p>{t("aiTab.model.description")}</p>
            <label>{t("aiTab.model.type.label")}</label>
            <Input
              placeholder={t("aiTab.model.type.placeholder")}
              {...form.register('model.type')}
            />
            <label>{t("aiTab.model.version.label")}</label>
            <Input
              placeholder={t("aiTab.model.version.placeholder")}
              {...form.register('model.version')}
            />
            <label>{t("aiTab.model.provider.label")}</label>
            <Input
              placeholder={t("aiTab.model.provider.placeholder")}
              {...form.register('model.provider')}
            />
            <label>{t("aiTab.model.deployment.label")}</label>
            <select {...form.register('model.deployment')}>
              <option value="onprem">{t("aiTab.model.deployment.onprem")}</option>
              <option value="saas">{t("aiTab.model.deployment.saas")}</option>
              <option value="cloud">{t("aiTab.model.deployment.cloud")}</option>
            </select>
            <label>{t("aiTab.model.region.label")}</label>
            <Input
              placeholder={t("aiTab.model.region.placeholder")}
              {...form.register('model.region')}
            />
            <label>{t("aiTab.model.adaptation.label")}</label>
            <select {...form.register('model.adaptation')}>
              <option value="prompting">{t("aiTab.model.adaptation.prompting")}</option>
              <option value="finetune">{t("aiTab.model.adaptation.finetune")}</option>
              <option value="rag">{t("aiTab.model.adaptation.rag")}</option>
              <option value="other">{t("aiTab.model.adaptation.other")}</option>
            </select>
          </section>

          <section>
            <h2>E: {t("aiTab.autonomy.label")}</h2>
            <p>{t("aiTab.autonomy.description")}</p>
            <div>
              <label className="flex items-center gap-1">
                <input type="radio" value="advice" {...form.register('autonomy')} /> {t("aiTab.autonomy.options.advice")}
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" value="partial" {...form.register('autonomy')} /> {t("aiTab.autonomy.options.partial")}
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" value="autonomous" {...form.register('autonomy')} /> {t("aiTab.autonomy.options.autonomous")}
              </label>
            </div>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('hitl.required')} /> {t("aiTab.hitlRequired.label")}
            </label>
            <label>{t("aiTab.hitl.thresholds.label")}</label>
            <Input
              placeholder={t("aiTab.hitl.thresholds.placeholder")}
              {...form.register('hitl.thresholds')}
            />
            <label>{t("aiTab.permissionDimensions.label")}</label>
            <Input
              placeholder={t("aiTab.permissionDimensions.placeholder")}
              {...form.register('permission_dimensions')}
            />
          </section>

          <section>
            <h2>F: {t("aiTab.transparency.label")}</h2>
            <p>{t("aiTab.transparency.description")}</p>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('transparency_notice.required')} disabled={!employeeInteraction} /> {t("aiTab.transparencyNotice.label")}
            </label>
            <label>{t("aiTab.transparencyNotice.artifactLink.label")}</label>
            <Input
              placeholder={t("aiTab.transparencyNotice.artifactLink.placeholder")}
              {...form.register('transparency_notice.artifact_link')}
            />
          </section>

          <section>
            <h2>G: {t("aiTab.risk.label")}</h2>
            <p>{t("aiTab.risk.description")}</p>
            <label>{t("aiTab.risk.eu_ai_act.label")}</label>
            <select {...form.register('risk.eu_ai_act')}>
              <option value="minimal">{t("aiTab.risk.eu_ai_act.minimal")}</option>
              <option value="limited">{t("aiTab.risk.eu_ai_act.limited")}</option>
              <option value="high">{t("aiTab.risk.eu_ai_act.high")}</option>
              <option value="prohibited">{t("aiTab.risk.eu_ai_act.prohibited")}</option>
            </select>
            <label>{t("aiTab.risk.corp_class.label")}</label>
            <select {...form.register('risk.corp_class')}>
              <option value="low">{t("aiTab.risk.corp_class.low")}</option>
              <option value="medium">{t("aiTab.risk.corp_class.medium")}</option>
              <option value="high">{t("aiTab.risk.corp_class.high")}</option>
            </select>
            <label>{t("aiTab.risk.justification.label")}</label>
            <Input
              placeholder={t("aiTab.risk.justification.placeholder")}
              {...form.register('risk.justification')}
            />
          </section>

          <section>
            <h2>H: {t("aiTab.dea.label")}</h2>
            <p>{t("aiTab.dea.description")}</p>
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('dea.completed')} /> {t("aiTab.deaCompleted.label")}
            </label>
            <label>{t("aiTab.dea.date.label")}</label>
            <Input
              placeholder={t("aiTab.dea.date.placeholder")}
              {...form.register('dea.date')}
            />
            <label>{t("aiTab.dea.file.label")}</label>
            <Input type="file" {...form.register('dea.file')} />
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
      <Button type="submit">{t("aiTab.submit")}</Button>
    </form>
  );
};

export default AITab;
