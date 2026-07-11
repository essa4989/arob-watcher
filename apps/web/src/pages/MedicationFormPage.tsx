import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup } from '../components/ChipGroup';
import { StarDialog } from '../components/StarDialog';
import { useLogSubmit } from '../hooks/useLogSubmit';
import { logService } from '../services/logService';
import { MED_METHODS, RESPONSES_GENERIC } from '@arob/shared';

export function MedicationFormPage() {
  const { t } = useTranslation();
  const [med, setMed] = useState('');
  const [dose, setDose] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { save, showStar, closeStar } = useLogSubmit('medication', () =>
    logService.logMedication({
      med,
      dose: dose || undefined,
      method: method ?? undefined,
      response: response ?? undefined,
      notes: notes || undefined,
    }),
  );

  const onSave = () => {
    const ok = save(() => (!med.trim() ? t('forms.validationRequired') : null));
    if (ok) {
      setMed('');
      setDose('');
      setMethod(null);
      setResponse(null);
      setNotes('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>💊 {t('forms.medicationTitle')}</h2>
        <div className="field">
          <label>{t('forms.med')}</label>
          <input value={med} onChange={(e) => setMed(e.target.value)} />
        </div>
        <div className="field">
          <label>
            {t('forms.dose')} {t('common.optional')}
          </label>
          <input value={dose} onChange={(e) => setDose(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.method')}</label>
          <ChipGroup options={MED_METHODS} value={method} onChange={setMethod} />
        </div>
        <div className="field">
          <label>{t('forms.response')}</label>
          <ChipGroup options={RESPONSES_GENERIC} value={response} onChange={setResponse} />
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
      {showStar && <StarDialog type="medication" onClose={closeStar} />}
    </div>
  );
}
