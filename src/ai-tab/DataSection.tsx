import { UseFormReturn } from 'react-hook-form';
import { AiFormData } from '../schema';
import CollapsibleCard from '../components/ui/collapsible-card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<AiFormData>;
  personalData: boolean;
}

export default function DataSection({ form, personalData }: Props) {
  const { t } = useTranslation();
  return (
    <CollapsibleCard title={`C: ${t('aiTab.data.label')}`}>
      <p>{t('aiTab.data.description')}</p>
      <label className="flex items-center gap-2">
        <Checkbox {...form.register('personal_data_used')} /> {t('aiTab.personalDataUsed.label')}
      </label>
      {personalData && (
        <div className="space-y-2 pl-4">
          <label>{t('aiTab.personalDataCategories.label')}</label>
          <Input
            {...form.register('personal_data_categories')}
            placeholder={t('aiTab.personalDataCategories.placeholder')}
          />
          <label>{t('aiTab.retention.label')}</label>
          <Input {...form.register('retention')} />
          <div>
            <label>{t('aiTab.interfaces.source')}</label>
            <Input {...form.register('interfaces.0.source')} />
            <label>{t('aiTab.interfaces.target')}</label>
            <Input {...form.register('interfaces.0.target')} />
            <label className="flex items-center gap-2">
              <Checkbox {...form.register('interfaces.0.via_middleware')} /> {t('aiTab.interfaces.viaMiddleware')}
            </label>
          </div>
        </div>
      )}
    </CollapsibleCard>
  );
}
