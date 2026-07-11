import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup } from '../components/ChipGroup';
import { StarDialog } from '../components/StarDialog';
import { useLogSubmit } from '../hooks/useLogSubmit';
import { logService } from '../services/logService';
import { CARE_RESPONSES } from '@arob/shared';

const CARE_TYPES = ['استحمام', 'تغيير ملابس', 'تنظيف', 'تمشيط شعر', 'قص أظافر'];

export function CareFormPage() {
  const { t } = useTranslation();
  const [care, setCare] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { save, showStar, closeStar } = useLogSubmit('care', () =>
    logService.logCare({ care: care ?? '', response: response ?? undefined, notes: notes || undefined }),
  );

  const onSave = () => {
    const ok = save(() => (!care ? t('forms.validationRequired') : null));
    if (ok) {
      setCare(null);
      setResponse(null);
      setNotes('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>🌸 {t('forms.careTitle')}</h2>
        <div className="field">
          <label>{t('forms.care')}</label>
          <ChipGroup options={CARE_TYPES} value={care} onChange={setCare} />
        </div>
        <div className="field">
          <label>{t('forms.response')}</label>
          <ChipGroup options={CARE_RESPONSES} value={response} onChange={setResponse} />
        </div>
        <div className="field">
          <label>
            {t('common.notes')} {t('common.optional')}
          </label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" onClick={onSave}>
          {t('common.save')}
        </button>
      </div>
      {showStar && <StarDialog type="care" onClose={closeStar} />}
    </div>
  );
}
