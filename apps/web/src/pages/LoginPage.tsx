import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PinPad } from '../components/PinPad';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pin.length >= 4) {
      setSubmitting(true);
      login(pin).then((res) => {
        setSubmitting(false);
        if (res.ok) {
          toast(`✅ ${t('auth.loggedInAs')}: ${res.role}`, 'success');
          navigate('/settings');
        } else {
          toast(t('auth.wrongPin'), 'error');
          setPin('');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>🔐 {t('auth.enterPin')}</h2>
        <PinPad value={pin} onChange={setPin} maxLength={4} />
        {submitting && <p className="empty-state">{t('common.loading')}</p>}
      </div>
    </div>
  );
}
