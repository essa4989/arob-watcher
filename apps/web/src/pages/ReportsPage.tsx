import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToExcel, exportToPdf } from '../utils/export';

type Period = 'daily' | 'weekly' | 'monthly' | 'all';

export function ReportsPage() {
  const { t } = useTranslation();
  const { capabilities } = useAuth();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>('daily');

  const statsQuery = useQuery({ queryKey: ['stats', period], queryFn: () => reportService.getStats(period) });
  const patternsQuery = useQuery({ queryKey: ['patterns'], queryFn: () => reportService.patterns(7) });

  const stats = statsQuery.data;

  const handleExportExcel = async () => {
    const data = await reportService.getAllLogsForExport();
    if (!data.ok) return toast(t('common.error'), 'error');
    exportToExcel(data);
    toast(`📊 ${t('common.success')}`, 'success');
  };

  const handleExportPdf = async () => {
    const data = await reportService.getAllLogsForExport();
    if (!data.ok) return toast(t('common.error'), 'error');
    exportToPdf(data, t('app.title'));
  };

  const severityClass = { critical: 'flag-critical', high: 'flag-critical', medium: 'flag-warning', low: 'flag-info' } as const;

  return (
    <div className="page">
      <div className="card">
        <h2>{t('reports.title')}</h2>
        <div className="chip-group">
          {(['daily', 'weekly', 'monthly', 'all'] as Period[]).map((p) => (
            <button key={p} className={`chip${period === p ? ' selected' : ''}`} onClick={() => setPeriod(p)}>
              {t(`reports.${p === 'all' ? 'allTime' : p}`)}
            </button>
          ))}
        </div>

        {stats?.ok && (
          <div className="stat-grid" style={{ marginTop: 14 }}>
            <div className="stat-tile">
              <div className="num">{stats.counts.catheter}</div>
              <div className="lbl">💗 قسطرة</div>
            </div>
            <div className="stat-tile">
              <div className="num">{stats.counts.medication}</div>
              <div className="lbl">💊 دواء</div>
            </div>
            <div className="stat-tile">
              <div className="num">{stats.total_urine} {t('common.ml')}</div>
              <div className="lbl">{t('reports.totalUrine')}</div>
            </div>
            <div className="stat-tile">
              <div className="num">{stats.total_fluid} {t('common.ml')}</div>
              <div className="lbl">{t('reports.totalFluid')}</div>
            </div>
            <div className="stat-tile" style={{ gridColumn: '1 / -1' }}>
              <div className="num">{stats.balance} {t('common.ml')}</div>
              <div className="lbl">{t('reports.balance')}</div>
            </div>
          </div>
        )}

        {capabilities.can_export && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-secondary btn-block" onClick={handleExportExcel}>
              📊 {t('reports.exportExcel')}
            </button>
            <button className="btn btn-secondary btn-block" onClick={handleExportPdf}>
              📄 {t('reports.exportPdf')}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>🔍 {t('reports.patterns')}</h3>
        {!patternsQuery.data?.patterns?.length ? (
          <p className="empty-state">{t('reports.noPatterns')}</p>
        ) : (
          patternsQuery.data.patterns.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div className={severityClass[p.severity]}>{p.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-700)' }}>{p.description}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>💡 {p.recommendation}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
