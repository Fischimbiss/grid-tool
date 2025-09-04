import { UseFormReturn } from 'react-hook-form';
import { AiFormData } from '../schema';
import CollapsibleCard from '../components/ui/collapsible-card';
import { Textarea } from '../components/ui/textarea';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<AiFormData>;
}

export default function PurposeSection({ form }: Props) {
  const { t } = useTranslation();
  return (
    <CollapsibleCard title={`B: ${t('aiTab.purpose.label')}`}>
      <p>{t('aiTab.purpose.description')}</p>
      <Textarea maxLength={600} {...form.register('purpose')} />
    </CollapsibleCard>
  );
}
