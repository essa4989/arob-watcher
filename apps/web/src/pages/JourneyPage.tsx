import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { journeyService } from '../services/journeyService';
import { rewardService } from '../services/rewardService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { STAR_LEVELS } from '@arob/shared';

export function JourneyPage() {
  const { t, i18n } = useTranslation();
  const { capabilities } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [showAddReward, setShowAddReward] = useState(false);
  const [title, setTitle] = useState('');
  const [starsNeeded, setStarsNeeded] = useState('');

  const journeyQuery = useQuery({ queryKey: ['journey'], queryFn: () => journeyService.getStatus() });
  const rewardsQuery = useQuery({ queryKey: ['rewards'], queryFn: () => rewardService.list() });
  const honorQuery = useQuery({ queryKey: ['honor-board'], queryFn: () => journeyService.getHonorBoard() });

  const j = journeyQuery.data;

  const handleUndo = async () => {
    const res = await journeyService.undo();
    if (res.ok) {
      toast('↩️', 'success');
      qc.invalidateQueries({ queryKey: ['journey'] });
      qc.invalidateQueries({ queryKey: ['honor-board'] });
    } else {
      toast(res.error ?? t('common.error'), 'error');
    }
  };

  const handleAddReward = async () => {
    if (!title.trim() || !starsNeeded) return;
    const res = await rewardService.save({ title, starsNeeded: Number(starsNeeded) });
    if (res.ok) {
      toast(`🎁 ${t('common.success')}`, 'success');
      setShowAddReward(false);
      setTitle('');
      setStarsNeeded('');
      qc.invalidateQueries({ queryKey: ['rewards'] });
    }
  };

  const handleClaim = async (id: string) => {
    const res = await rewardService.claim(id);
    if (res.ok) {
      toast('🎉', 'success');
      qc.invalidateQueries({ queryKey: ['rewards'] });
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>{t('journey.title')}</h2>
        {j?.ok && (
          <>
            <div style={{ fontSize: '2.4rem' }}>{j.level.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{j.level.name}</div>
            <div className="progress-bar" style={{ marginTop: 10 }}>
              <div className="fill" style={{ width: `${j.progress_to_next}%` }} />
            </div>
            <div className="stat-grid" style={{ marginTop: 14 }}>
              <div className="stat-tile">
                <div className="num">{j.total_stars}</div>
                <div className="lbl">{t('journey.totalStars')}</div>
              </div>
              <div className="stat-tile">
                <div className="num">{j.today_stars}</div>
                <div className="lbl">{t('journey.todayStars')}</div>
              </div>
              <div className="stat-tile">
                <div className="num">
                  {j.current_streak} {t('journey.days')}
                </div>
                <div className="lbl">{t('journey.streak')}</div>
              </div>
              <div className="stat-tile">
                <div className="num">
                  {j.longest_streak} {t('journey.days')}
                </div>
                <div className="lbl">{t('journey.longestStreak')}</div>
              </div>
            </div>
            {capabilities.can_log && (
              <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={handleUndo}>
                ↩️ {t('home.undo')}
              </button>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h3>{t('journey.levels')}</h3>
        <div className="level-grid">
          {STAR_LEVELS.map((lvl) => (
            <div key={lvl.level} className={`level-row${(j?.total_stars ?? 0) >= lvl.stars ? ' reached' : ''}`}>
              <span style={{ fontSize: '1.3rem' }}>{lvl.emoji}</span>
              <span style={{ flex: 1, fontWeight: 700 }}>{lvl.nameAr}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>⭐ {lvl.stars}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{t('journey.rewards')}</h3>
          {capabilities.can_rewards && (
            <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setShowAddReward(true)}>
              + {t('journey.addReward')}
            </button>
          )}
        </div>
        {!rewardsQuery.data?.rewards?.length ? (
          <p className="empty-state">{t('home.noDataYet')}</p>
        ) : (
          rewardsQuery.data.rewards.map((r) => (
            <div className="entry-item" key={r.id}>
              <span className="emoji">🎁</span>
              <div className="meta">
                <div className="title">{r.title}</div>
                <div className="time">
                  ⭐ {r.starsNeeded} · {t(`journey.${r.status}`)}
                </div>
              </div>
              {r.status === 'available' && capabilities.can_rewards && (
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => handleClaim(r.id)}>
                  {t('journey.claim')}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>🏆 {t('journey.honorBoard')}</h3>
        {!honorQuery.data?.entries?.length ? (
          <p className="empty-state">{t('home.noDataYet')}</p>
        ) : (
          honorQuery.data.entries.slice(0, 10).map((e: any) => (
            <div className="entry-item" key={e.id}>
              <span className="emoji">🌟</span>
              <div className="meta">
                <div className="title">{e.type}</div>
                <div className="time">{new Date(e.timestamp).toLocaleString(i18n.language)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddReward && (
        <div className="modal-backdrop" onClick={() => setShowAddReward(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>{t('journey.addReward')}</h2>
            <div className="field">
              <label>{t('journey.rewardTitle')}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>{t('journey.starsNeeded')}</label>
              <input type="number" value={starsNeeded} onChange={(e) => setStarsNeeded(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={handleAddReward}>
              {t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
