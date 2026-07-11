import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCatheterTimer } from '../hooks/useCatheterTimer';
import { logService } from '../services/logService';
import { reportService } from '../services/reportService';
import { SleepBadge } from '../components/SleepBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { EntryType } from '@arob/shared';

const QUICK_ACTIONS: Array<{ type: EntryType; icon: string; path: string }> = [
  { type: 'catheter', icon: '💗', path: '/log/catheter' },
  { type: 'medication', icon: '💊', path: '/log/medication' },
  { type: 'check', icon: '🩺', path: '/log/check' },
  { type: 'fluid', icon: '💧', path: '/log/fluid' },
  { type: 'care', icon: '🌸', path: '/log/care' },
];

const TYPE_EMOJI: Record<string, string> = { catheter: '💗', medication: '💊', check: '🩺', fluid: '💧', care: '🌸' };
const TYPE_LABEL_KEY: Record<string, string> = {
  catheter: 'home.catheter',
  medication: 'home.medication',
  check: 'home.check',
  fluid: 'home.fluid',
  care: 'home.care',
};

export function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const timer = useCatheterTimer();
  const { capabilities } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [undoing, setUndoing] = useState<EntryType | null>(null);

  const logsQuery = useQuery({ queryKey: ['logs', 'recent'], queryFn: () => logService.getRecent(8), refetchInterval: 30_000 });
  const summaryQuery = useQuery({
    queryKey: ['smart-summary', 'daily'],
    queryFn: () => reportService.smartSummary('daily'),
    staleTime: 5 * 60_000,
  });

  const levelPct = timer.diffMinutes !== null ? Math.min(100, Math.round((timer.diffMinutes / 90) * 100)) : 0;
  const remaining = timer.diffMinutes !== null ? Math.max(0, 90 - timer.diffMinutes) : null;

  const handleUndo = async (type: EntryType) => {
    setUndoing(type);
    const res = await logService.deleteLast(type);
    setUndoing(null);
    if (res.ok) {
      toast(`↩️ ${t('common.success')}`, 'success');
      qc.invalidateQueries({ queryKey: ['logs'] });
      qc.invalidateQueries({ queryKey: ['status'] });
    } else {
      toast(res.error ?? t('common.error'), 'error');
    }
  };

  return (
    <div className="page">
      {timer.status?.sleep_mode && (
        <div>
          <SleepBadge />
        </div>
      )}

      <div className={`timer-card level-${timer.level.level}`}>
        <div className="label">{t('home.sinceLastCatheter')}</div>
        {timer.diffMinutes === null ? (
          <div className="value" style={{ fontSize: '1.2rem' }}>
            {t('home.noDataYet')}
          </div>
        ) : (
          <>
            <div className="value">
              {timer.diffMinutes}
              <span style={{ fontSize: '1rem' }}> {t('common.minutes')}</span>
            </div>
            <div className="label">
              {timer.level.emoji} {timer.level.labelAr}
              {remaining !== null && remaining > 0 ? ` · ${t('home.remaining')}: ${remaining} ${t('common.minutes')}` : ''}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${levelPct}%` }} />
            </div>
          </>
        )}
      </div>

      {capabilities.can_log && (
        <div className="card">
          <h2>{t('home.quickActions')}</h2>
          <div className="quick-grid">
            {QUICK_ACTIONS.map((qa) => (
              <button key={qa.type} className="quick-btn" onClick={() => navigate(qa.path)}>
                <span className="icon">{qa.icon}</span>
                <span>{t(TYPE_LABEL_KEY[qa.type])}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>🧠 {t('home.smartSummary')}</h2>
        {summaryQuery.data?.ok ? (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-700)' }}>{summaryQuery.data.summary}</p>
            {summaryQuery.data.flags.map((f, i) => (
              <div key={i} className={`flag-${f.level}`} style={{ fontSize: '0.8rem', marginTop: 4 }}>
                {f.message}
              </div>
            ))}
          </>
        ) : (
          <p className="empty-state">{t('common.loading')}</p>
        )}
        <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => summaryQuery.refetch()}>
          {t('home.runSummary')}
        </button>
      </div>

      <div className="card">
        <h2>{t('home.recentEntries')}</h2>
        {!logsQuery.data?.logs?.length ? (
          <p className="empty-state">{t('home.noDataYet')}</p>
        ) : (
          logsQuery.data.logs.map((log: any) => {
            const ageMin = (Date.now() - new Date(log.timestamp).getTime()) / 60000;
            return (
              <div className="entry-item" key={`${log.type}-${log.id}`}>
                <span className="emoji">{TYPE_EMOJI[log.type]}</span>
                <div className="meta">
                  <div className="title">{t(TYPE_LABEL_KEY[log.type])}</div>
                  <div className="time">{new Date(log.timestamp).toLocaleString(i18n.language)}</div>
                </div>
                {capabilities.can_log && ageMin <= 30 && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '6px 10px' }}
                    disabled={undoing === log.type}
                    onClick={() => handleUndo(log.type)}
                    title={t('home.undoWindow')}
                  >
                    ↩️ {t('home.undo')}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
