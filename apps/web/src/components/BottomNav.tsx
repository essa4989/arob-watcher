import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ITEMS = [
  { to: '/', icon: '🏠', key: 'home' },
  { to: '/journey', icon: '🌸', key: 'journey' },
  { to: '/reports', icon: '📊', key: 'reports' },
  { to: '/guide', icon: '📖', key: 'guide' },
  { to: '/settings', icon: '⚙️', key: 'settings' },
];

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="icon">{item.icon}</span>
          <span>{t(`nav.${item.key}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
