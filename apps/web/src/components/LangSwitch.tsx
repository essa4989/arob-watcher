import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, setLang, type Lang } from '../i18n';

const LABELS: Record<Lang, string> = { ar: 'عربي', en: 'EN', tl: 'TL' };

export function LangSwitch() {
  const { i18n } = useTranslation();
  return (
    <div className="lang-switch">
      {SUPPORTED_LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          className={i18n.language === lang ? 'active' : ''}
          onClick={() => setLang(lang)}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
