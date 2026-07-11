import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup } from '../components/ChipGroup';
import { StarDialog } from '../components/StarDialog';
import { useLogSubmit } from '../hooks/useLogSubmit';
import { logService } from '../services/logService';
import { FLUID_TYPES, FLUID_RESPONSES } from '@arob/shared';

export function FluidFormPage() {
  const { t } = useTranslation();
  const [fluidType, setFluidType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { save, showStar, closeStar } = useLogSubmit('fluid', () =>
    logService.logFluid({
      fluidType: fluidType ?? '',
      amount: Number(amount),
      response: response ?? undefined,
      notes: notes || undefined,
    }),
  );

  const onSave = () => {
    const ok = save(() => (!fluidType || !amount || Number(amount) <= 0 ? t('forms.validationRequired') : null));
    if (ok) {
      setFluidType(null);
      setAmount('');
      setResponse(null);
      setNotes('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>💧 {t('forms.fluidTitle')}</h2>
        <div className="field">
          <label>{t('forms.fluidType')}</label>
          <ChipGroup options={FLUID_TYPES} value={fluidType} onChange={setFluidType} />
        </div>
        <div className="field">
          <label>{t('forms.amount')}</label>
          <input type="number" inputMode="numeric" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.response')}</label>
          <ChipGroup options={FLUID_RESPONSES} value={response} onChange={setResponse} />
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
      {showStar && <StarDialog type="fluid" onClose={closeStar} />}
    </div>
  );
}
