import { useTranslation } from 'react-i18next';

export function SleepBadge() {
  const { t } = useTranslation();
  return <span className="badge badge-sleep">🌙 {t('home.sleepBadge')}</span>;
}
