import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { journeyService } from '../services/journeyService';
import { useToast } from '../context/ToastContext';
import type { EntryType } from '@arob/shared';

interface StarDialogProps {
  type: EntryType;
  onClose: () => void;
}

export function StarDialog({ type, onClose }: StarDialogProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const award = useMutation({
    mutationFn: () => journeyService.award(type),
    onSuccess: (res) => {
      if (res.ok) {
        toast(res.leveledUp ? `🎉 ${t('starDialog.leveledUp')}` : '🌸', 'success');
      }
      onClose();
    },
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem' }}>🌸</div>
        <h2>{t('starDialog.title')}</h2>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary btn-block" onClick={() => award.mutate()} disabled={award.isPending}>
            {t('starDialog.yes')}
          </button>
          <button className="btn btn-secondary btn-block" onClick={onClose}>
            {t('starDialog.no')}
          </button>
        </div>
      </div>
    </div>
  );
}
