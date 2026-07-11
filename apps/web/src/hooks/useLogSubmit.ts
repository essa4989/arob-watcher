import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { setLocalCatheterNow } from './useCatheterTimer';
import type { EntryType } from '@arob/shared';

/**
 * UI-first save flow: update local state and show the star dialog immediately
 * (~300ms, matching the legacy nurse-facing UX), then call the server in the
 * background without blocking. Do not await the server before showing feedback.
 */
export function useLogSubmit(type: EntryType, submitFn: () => Promise<{ ok: boolean; error?: string }>) {
  const [showStar, setShowStar] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const save = (validate?: () => string | null) => {
    const err = validate?.();
    if (err) {
      toast(err, 'error');
      return false;
    }
    if (type === 'catheter') setLocalCatheterNow();
    toast(`✅ ${t('common.success')}`, 'success');
    setTimeout(() => setShowStar(true), 300);

    void submitFn().then((res) => {
      if (!res.ok) toast(res.error ?? t('common.error'), 'error');
      qc.invalidateQueries({ queryKey: ['status'] });
      qc.invalidateQueries({ queryKey: ['logs'] });
      qc.invalidateQueries({ queryKey: ['smart-summary'] });
      qc.invalidateQueries({ queryKey: ['journey'] });
    });
    return true;
  };

  const closeStar = () => {
    setShowStar(false);
    navigate('/');
  };

  return { save, showStar, closeStar };
}
