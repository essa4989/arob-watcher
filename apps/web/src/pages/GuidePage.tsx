import { useTranslation } from 'react-i18next';
import { GUIDE_CONTENT } from '../data/guideContent';
import type { Lang } from '../i18n';

export function GuidePage() {
  const { t, i18n } = useTranslation();
  const sections = GUIDE_CONTENT[(i18n.language as Lang) ?? 'ar'] ?? GUIDE_CONTENT.ar;

  return (
    <div className="page">
      <div className="card">
        <h2>📖 {t('guide.title')}</h2>
      </div>
      {sections.map((s, i) => (
        <div className="card" key={i}>
          <h3>
            {s.icon} {s.title}
          </h3>
          <ul style={{ margin: 0, paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.points.map((p, j) => (
              <li key={j} style={{ fontSize: '0.88rem', color: 'var(--ink-700)' }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
