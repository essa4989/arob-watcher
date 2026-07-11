import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { statusService } from '../services/statusService';
import { settingsService } from '../services/settingsService';
import { medScheduleService } from '../services/medScheduleService';
import { authService } from '../services/authService';
import { getDeviceName, setDeviceName, getToken } from '../services/apiClient';
import { LangSwitch } from '../components/LangSwitch';
import type { Role } from '@arob/shared';

const ROLE_LABEL: Record<Role, string> = { parent: 'settings.parent', nurse: 'settings.nurse', doctor: 'settings.doctor' };

export function SettingsPage() {
  const { t } = useTranslation();
  const { role, capabilities, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [device, setDevice] = useState(getDeviceName());
  const [targetRole, setTargetRole] = useState<Role>('nurse');
  const [newPin, setNewPin] = useState('');
  const [chatId, setChatId] = useState('');
  const [chatLabel, setChatLabel] = useState('');
  const [medName, setMedName] = useState('');
  const [medTimes, setMedTimes] = useState('');

  const sleepQuery = useQuery({ queryKey: ['sleep'], queryFn: () => statusService.getSleep() });
  const diagQuery = useQuery({ queryKey: ['diagnostic'], queryFn: () => settingsService.diagnostic() });
  const chatsQuery = useQuery({ queryKey: ['telegram-chats'], queryFn: () => settingsService.listTelegramChats(), enabled: capabilities.can_settings });
  const auditQuery = useQuery({ queryKey: ['audit'], queryFn: () => authService.getAuditLog(), enabled: role === 'parent' });
  const scheduleQuery = useQuery({ queryKey: ['med-schedule'], queryFn: () => medScheduleService.list(), enabled: capabilities.can_settings });

  const toggleSleep = async (enabled: boolean) => {
    const cfg = sleepQuery.data;
    await statusService.setSleep(enabled, cfg?.from ?? '23:00', cfg?.to ?? '07:00');
    qc.invalidateQueries({ queryKey: ['sleep'] });
    qc.invalidateQueries({ queryKey: ['status'] });
  };

  const saveSleepTimes = async (from: string, to: string) => {
    await statusService.setSleep(sleepQuery.data?.enabled ?? false, from, to);
    qc.invalidateQueries({ queryKey: ['sleep'] });
  };

  const handleSaveDeviceName = () => {
    setDeviceName(device);
    toast(`✅ ${t('common.success')}`, 'success');
  };

  const handleChangePin = async () => {
    const token = getToken();
    if (!token || !/^\d{4,8}$/.test(newPin)) return toast(t('common.error'), 'error');
    const res = await authService.changePin(token, targetRole, newPin);
    if (res.ok) {
      toast(`🔐 ${t('common.success')}`, 'success');
      setNewPin('');
    } else {
      toast(res.error ?? t('common.error'), 'error');
    }
  };

  const handleTestTelegram = async () => {
    const res = await settingsService.testTelegram();
    toast(res.results?.some((r) => r.ok) ? `📨 ${t('common.success')}` : t('common.error'), res.results?.some((r) => r.ok) ? 'success' : 'error');
  };

  const handleAddChat = async () => {
    if (!chatId.trim()) return;
    await settingsService.addTelegramChat(chatId.trim(), chatLabel || undefined);
    setChatId('');
    setChatLabel('');
    qc.invalidateQueries({ queryKey: ['telegram-chats'] });
  };

  const handleAddSchedule = async () => {
    if (!medName.trim() || !medTimes.trim()) return;
    await medScheduleService.save({
      name: medName,
      times: medTimes.split(',').map((s) => s.trim()).filter(Boolean),
      days: [],
    });
    setMedName('');
    setMedTimes('');
    qc.invalidateQueries({ queryKey: ['med-schedule'] });
    toast(`✅ ${t('common.success')}`, 'success');
  };

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>🔐 {t('settings.security')}</h2>
          <LangSwitch />
        </div>
        {role ? (
          <>
            <p>
              {t('auth.loggedInAs')}: <strong>{t(ROLE_LABEL[role])}</strong>
            </p>
            <button className="btn btn-ghost" onClick={logout}>
              {t('common.logout')}
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>
            {t('common.login')}
          </button>
        )}
      </div>

      {capabilities.can_change_pin && (
        <div className="card">
          <h3>{t('settings.changePin')}</h3>
          <div className="field">
            <label>{t('settings.role')}</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value as Role)}>
              <option value="parent">{t('settings.parent')}</option>
              <option value="nurse">{t('settings.nurse')}</option>
              <option value="doctor">{t('settings.doctor')}</option>
            </select>
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>{t('settings.pin')}</label>
            <input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={handleChangePin}>
            {t('common.save')}
          </button>
        </div>
      )}

      {capabilities.can_settings && (
        <div className="card">
          <h3>🌙 {t('settings.sleepMode')}</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={sleepQuery.data?.enabled ?? false} onChange={(e) => toggleSleep(e.target.checked)} />
            {t('settings.sleepMode')}
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div className="field">
              <label>{t('settings.sleepFrom')}</label>
              <input
                type="time"
                defaultValue={sleepQuery.data?.from ?? '23:00'}
                onBlur={(e) => saveSleepTimes(e.target.value, sleepQuery.data?.to ?? '07:00')}
              />
            </div>
            <div className="field">
              <label>{t('settings.sleepTo')}</label>
              <input
                type="time"
                defaultValue={sleepQuery.data?.to ?? '07:00'}
                onBlur={(e) => saveSleepTimes(sleepQuery.data?.from ?? '23:00', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {capabilities.can_settings && (
        <div className="card">
          <h3>💊 جدول الأدوية</h3>
          {scheduleQuery.data?.schedules?.map((s) => (
            <div className="entry-item" key={s.id}>
              <span className="emoji">💊</span>
              <div className="meta">
                <div className="title">{s.name}</div>
                <div className="time">{(s.times as unknown as string[]).join('، ')}</div>
              </div>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await medScheduleService.remove(s.id);
                  qc.invalidateQueries({ queryKey: ['med-schedule'] });
                }}
              >
                🗑️
              </button>
            </div>
          ))}
          <div className="field" style={{ marginTop: 10 }}>
            <label>{t('forms.med')}</label>
            <input value={medName} onChange={(e) => setMedName(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label>مواعيد الجرعات (مثال: 08:00, 14:00, 20:00)</label>
            <input value={medTimes} onChange={(e) => setMedTimes(e.target.value)} placeholder="08:00, 14:00" />
          </div>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={handleAddSchedule}>
            {t('common.add')}
          </button>
        </div>
      )}

      {capabilities.can_settings && (
        <div className="card">
          <h3>📨 {t('settings.telegramChats')}</h3>
          {chatsQuery.data?.chats?.map((c) => (
            <div className="entry-item" key={c.id}>
              <span className="emoji">👤</span>
              <div className="meta">
                <div className="title">{c.label ?? c.chatId}</div>
                <div className="time">{c.chatId}</div>
              </div>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await settingsService.removeTelegramChat(c.id);
                  qc.invalidateQueries({ queryKey: ['telegram-chats'] });
                }}
              >
                🗑️
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input placeholder="chat id" value={chatId} onChange={(e) => setChatId(e.target.value)} style={{ flex: 1 }} />
            <input placeholder="label" value={chatLabel} onChange={(e) => setChatLabel(e.target.value)} style={{ flex: 1 }} />
          </div>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={handleAddChat}>
            {t('common.add')}
          </button>
          <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={handleTestTelegram}>
            {t('settings.testTelegram')}
          </button>
        </div>
      )}

      {role === 'parent' && (
        <div className="card">
          <h3>📋 {t('settings.auditLog')}</h3>
          {!auditQuery.data?.entries?.length ? (
            <p className="empty-state">{t('home.noDataYet')}</p>
          ) : (
            auditQuery.data.entries.map((e: any) => (
              <div className="entry-item" key={e.id}>
                <span className="emoji">📋</span>
                <div className="meta">
                  <div className="title">{e.action}</div>
                  <div className="time">{new Date(e.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="card">
        <h3>⚙️ {t('settings.diagnostics')}</h3>
        <div className="field">
          <label>{t('settings.deviceName')}</label>
          <input value={device} onChange={(e) => setDevice(e.target.value)} onBlur={handleSaveDeviceName} />
        </div>
        {diagQuery.data?.ok && (
          <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--ink-700)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>{t('settings.version')}: {diagQuery.data.version}</div>
            <div>{t('settings.database')}: {diagQuery.data.database}</div>
            <div>Telegram: {diagQuery.data.telegram_configured ? '✅' : '❌'} ({diagQuery.data.telegram_chats})</div>
          </div>
        )}
      </div>
    </div>
  );
}
