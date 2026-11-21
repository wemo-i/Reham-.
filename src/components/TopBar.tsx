import { AppCopy } from '../data/copy';
import { AppPhase, Locale } from '../types';

interface TopBarProps {
  copy: AppCopy;
  locale: Locale;
  phase: AppPhase;
  isResearcher: boolean;
  onNavigate: (target: 'intro' | 'dashboard') => void;
  onToggleLocale: () => void;
}

export function TopBar({
  copy,
  locale,
  phase,
  isResearcher,
  onNavigate,
  onToggleLocale,
}: TopBarProps) {
  const isExperimentActive = phase === 'intro' || phase === 'thankyou';
  const isDashboardActive = phase === 'dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-[#327D87]/30 bg-[#0C141B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('intro')}
          className="text-left font-[family-name:var(--font-display)] text-base font-bold tracking-wide text-[#CBE0E1] whitespace-nowrap shrink-0 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#95B3B5]"
        >
          {copy.brandTitle}
        </button>

        {isResearcher ? (
          <nav className="flex items-center gap-5 sm:gap-7" aria-label="Primary">
            <button
              type="button"
              onClick={() => onNavigate('intro')}
              className={`min-h-[40px] border-b-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#95B3B5] ${
                isExperimentActive
                  ? 'border-[#CBE0E1] text-[#CBE0E1]'
                  : 'border-transparent text-[#8CA293] hover:text-[#CBE0E1]'
              }`}
            >
              {copy.navExperiment}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`min-h-[40px] border-b-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#95B3B5] ${
                isDashboardActive
                  ? 'border-[#CBE0E1] text-[#CBE0E1]'
                  : 'border-transparent text-[#8CA293] hover:text-[#CBE0E1]'
              }`}
            >
              {copy.navDashboard}
            </button>
          </nav>
        ) : (
          <div />
        )}

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleLocale}
            lang={locale === 'en' ? 'ar' : 'en'}
            className="min-h-[40px] rounded-lg border border-[#327D87]/50 bg-[#0E2C36] px-3.5 py-1.5 text-xs font-semibold text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95B3B5]"
          >
            {copy.languageSwitch}
          </button>
        </div>
      </div>
    </header>
  );
}
