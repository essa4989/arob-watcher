import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { CatheterFormPage } from './pages/CatheterFormPage';
import { MedicationFormPage } from './pages/MedicationFormPage';
import { CheckFormPage } from './pages/CheckFormPage';
import { FluidFormPage } from './pages/FluidFormPage';
import { CareFormPage } from './pages/CareFormPage';
import { JourneyPage } from './pages/JourneyPage';
import { ReportsPage } from './pages/ReportsPage';
import { GuidePage } from './pages/GuidePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Header() {
  const { t } = useTranslation();
  return (
    <header className="app-header">
      <div>
        <h1>🌸 {t('app.title')}</h1>
        <div className="sub">{t('app.tagline')}</div>
      </div>
    </header>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app-shell">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/log/catheter" element={<CatheterFormPage />} />
                <Route path="/log/medication" element={<MedicationFormPage />} />
                <Route path="/log/check" element={<CheckFormPage />} />
                <Route path="/log/fluid" element={<FluidFormPage />} />
                <Route path="/log/care" element={<CareFormPage />} />
                <Route path="/journey" element={<JourneyPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
              <BottomNav />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
