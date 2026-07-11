import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup } from '../components/ChipGroup';
import { StarDialog } from '../components/StarDialog';
import { useLogSubmit } from '../hooks/useLogSubmit';
import { logService } from '../services/logService';
import { CATHETER_COLORS, CATHETER_SMELLS } from '@arob/shared';

export function CatheterFormPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState<string | null>(null);
  const [smell, setSmell] = useState<string | null>(null);
  const [pain, setPain] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { save, showStar, closeStar } = useLogSubmit('catheter', () =>
    logService.logCatheter({
      amount: Number(amount),
      color: color ?? undefined,
      smell: smell ?? undefined,
      pain: pain ?? undefined,
      notes: notes || undefined,
    }),
  );

  const onSave = () => {
    const ok = save(() => (!amount || Number(amount) <= 0 ? t('forms.validationRequired') : null));
    if (ok) {
      setAmount('');
      setColor(null);
      setSmell(null);
      setPain(null);
      setNotes('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>💗 {t('forms.catheterTitle')}</h2>
        <div className="field">
          <label>{t('forms.amount')}</label>
          <input type="number" inputMode="numeric" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>{t('forms.color')}</label>
          <ChipGroup options={CATHETER_COLORS} value={color} onChange={setColor} />
        </div>
        <div className="field">
          <label>{t('forms.smell')}</label>
          <ChipGroup options={CATHETER_SMELLS} value={smell} onChange={setSmell} />
        </div>
        <div className="field">
          <label>{t('forms.pain')}</label>
          <ChipGroup options={['لا', 'نعم']} value={pain} onChange={setPain} />
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
      {showStar && <StarDialog type="catheter" onClose={closeStar} />}
    </div>
  );
}
