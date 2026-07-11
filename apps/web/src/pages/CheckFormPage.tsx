import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChipGroup } from '../components/ChipGroup';
import { StarDialog } from '../components/StarDialog';
import { useLogSubmit } from '../hooks/useLogSubmit';
import { logService } from '../services/logService';
import { CONSCIOUSNESS_STATES } from '@arob/shared';

export function CheckFormPage() {
  const { t } = useTranslation();
  const [temp, setTemp] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [skin, setSkin] = useState('');
  const [consciousness, setConsciousness] = useState<string | null>(null);
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');

  const { save, showStar, closeStar } = useLogSubmit('check', () =>
    logService.logCheck({
      temp: temp ? Number(temp) : undefined,
      bp: bp || undefined,
      pulse: pulse ? Number(pulse) : undefined,
      spo2: spo2 ? Number(spo2) : undefined,
      skin: skin || undefined,
      consciousness: consciousness ?? undefined,
      position: position || undefined,
      notes: notes || undefined,
    }),
  );

  const onSave = () => {
    const ok = save(() => (!temp && !bp && !pulse && !spo2 ? t('forms.validationOneMeasure') : null));
    if (ok) {
      setTemp('');
      setBp('');
      setPulse('');
      setSpo2('');
      setSkin('');
      setConsciousness(null);
      setPosition('');
      setNotes('');
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>🩺 {t('forms.checkTitle')}</h2>
        <div className="field">
          <label>{t('forms.temp')}</label>
          <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.bp')}</label>
          <input placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.pulse')}</label>
          <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.spo2')}</label>
          <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('forms.consciousness')}</label>
          <ChipGroup options={CONSCIOUSNESS_STATES} value={consciousness} onChange={setConsciousness} />
        </div>
        <div className="field">
          <label>
            {t('forms.skin')} {t('common.optional')}
          </label>
          <input value={skin} onChange={(e) => setSkin(e.target.value)} />
        </div>
        <div className="field">
          <label>
            {t('forms.position')} {t('common.optional')}
          </label>
          <input value={position} onChange={(e) => setPosition(e.target.value)} />
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
      {showStar && <StarDialog type="check" onClose={closeStar} />}
    </div>
  );
}
