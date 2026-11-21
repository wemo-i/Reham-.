import { Check, Copy, Download, Lock, LogIn, LogOut, Plus, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppCopy } from '../data/copy';
import { WORD_CATEGORIES } from '../data/words';
import {
  computeCategorySummaries,
  computeWordSummaries,
  exportResponsesToCsv,
} from '../services/storage';
import { TrialResponse, WordCategory } from '../types';

interface DashboardViewProps {
  copy: AppCopy;
  responses: TrialResponse[];
  isLoading: boolean;
  authReady: boolean;
  isAuthorized: boolean;
  signedInEmail: string | null;
  authError: string;
  dashboardError: string;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onRefresh: () => void;
  onLock: () => void;
  onStartNewParticipant: () => void;
  onClearAll: () => Promise<void>;
}

const CATEGORY_BAR_COLOR: Record<WordCategory, string> = {
  'Real English Words': '#CBE0E1',
  'Harry Potter Coined Words': '#327D87',
  'Plausible Nonwords': '#8CA293',
};

export function DashboardView({
  copy,
  responses,
  isLoading,
  authReady,
  isAuthorized,
  signedInEmail,
  authError,
  dashboardError,
  onGoogleSignIn,
  onGoogleSignOut,
  onRefresh,
  onLock,
  onStartNewParticipant,
  onClearAll,
}: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | WordCategory>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [copiedType, setCopiedType] = useState<'student' | 'researcher' | null>(null);

  const handleCopyLink = async (type: 'student' | 'researcher') => {
    const resolvedBase = new URL(import.meta.env.BASE_URL || '/', window.location.href);
    const studentUrl = resolvedBase.href;
    const researcherUrl =
      resolvedBase.pathname === '/'
        ? `${resolvedBase.origin}/results`
        : `${studentUrl}#results`;
    const url = type === 'student' ? studentUrl : researcherUrl;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      window.setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const participantOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of responses) {
      if (!map.has(r.sessionId)) {
        map.set(r.sessionId, r.participantCode);
      }
    }
    return Array.from(map.entries()).map(([sessionId, code]) => ({
      sessionId,
      code,
    }));
  }, [responses]);

  const scopedResponses = useMemo(() => {
    if (selectedParticipant === 'all') return responses;
    return responses.filter((r) => r.sessionId === selectedParticipant);
  }, [responses, selectedParticipant]);

  const categorySummaries = useMemo(
    () => computeCategorySummaries(scopedResponses),
    [scopedResponses]
  );

  const wordSummaries = useMemo(() => {
    const allWords = computeWordSummaries(scopedResponses);
    if (selectedCategory === 'all') return allWords;
    return allWords.filter((w) => w.category === selectedCategory);
  }, [scopedResponses, selectedCategory]);

  const totalSessions = useMemo(() => {
    return new Set(scopedResponses.map((r) => r.sessionId)).size;
  }, [scopedResponses]);

  const overallYesRate = useMemo(() => {
    if (scopedResponses.length === 0) return 0;
    const yesTotal = scopedResponses.filter((r) => r.answer === 'Yes').length;
    return (yesTotal / scopedResponses.length) * 100;
  }, [scopedResponses]);

  const latestTimestamp = useMemo(() => {
    if (scopedResponses.length === 0) return '—';
    const latest = scopedResponses[scopedResponses.length - 1];
    try {
      return new Date(latest.timestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return latest.timestamp;
    }
  }, [scopedResponses]);

  const recentLogs = useMemo(() => {
    const filtered =
      selectedCategory === 'all'
        ? scopedResponses
        : scopedResponses.filter((r) => r.category === selectedCategory);
    return [...filtered].reverse().slice(0, 72);
  }, [scopedResponses, selectedCategory]);

  const handleConfirmClear = async () => {
    await onClearAll();
    setSelectedParticipant('all');
    setConfirmingClear(false);
  };

  if (!authReady || (isAuthorized && isLoading)) {
    return (
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-[#0E2C36]" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl border border-[#327D87]/25 bg-[#0E2C36]"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-xl border border-[#327D87]/25 bg-[#0E2C36]"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <section className="rounded-2xl border border-[#327D87]/50 bg-[#0E2C36]/90 p-7 text-center shadow-2xl backdrop-blur-md sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#327D87]/50 bg-[#0C141B]/70 text-[#CBE0E1]">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#CBE0E1]">
            {copy.researcherAuthTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#95B3B5]">
            {copy.researcherAuthDesc}
          </p>

          {signedInEmail && (
            <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-950/35 px-4 py-3 text-xs text-amber-200">
              <div className="flex items-center justify-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{signedInEmail}</span>
              </div>
              <p className="mt-1 text-amber-200/85">{copy.researcherWrongAccountNotice}</p>
            </div>
          )}

          {authError && (
            <p className="mt-4 text-xs font-medium text-red-400">{authError}</p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-[#CBE0E1] px-6 text-sm font-bold text-[#0C141B] transition-colors hover:bg-white"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{copy.researcherSignInButton}</span>
            </button>

            {signedInEmail && (
              <button
                type="button"
                onClick={onGoogleSignOut}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#327D87]/50 bg-[#0C141B]/70 px-4 text-xs font-semibold text-[#95B3B5] transition-colors hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>{copy.researcherSignOutButton}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLock}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[#327D87]/40 px-4 text-xs font-medium text-[#95B3B5] transition-colors hover:text-white"
            >
              <span>{copy.researcherPinCancel}</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 border-b border-[#327D87]/35 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-[#CBE0E1] sm:text-3xl [text-wrap:balance]">
            {copy.dashboardTitle}
          </h1>
          <p className="mt-1.5 text-sm text-[#95B3B5]">{copy.dashboardSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleCopyLink('student')}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#327D87]/50 bg-[#08545C]/65 px-3.5 text-xs font-semibold text-[#CBE0E1] transition-colors hover:bg-[#08545C] whitespace-nowrap shrink-0"
          >
            {copiedType === 'student' ? (
              <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 text-[#95B3B5]" aria-hidden="true" />
            )}
            <span>{copiedType === 'student' ? copy.copiedLabel : copy.copyStudentLink}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleCopyLink('researcher')}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#327D87]/50 bg-[#0E2C36] px-3.5 text-xs font-semibold text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C] whitespace-nowrap shrink-0"
          >
            {copiedType === 'researcher' ? (
              <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 text-[#95B3B5]" aria-hidden="true" />
            )}
            <span>
              {copiedType === 'researcher' ? copy.copiedLabel : copy.copyResearcherLink}
            </span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#327D87]/50 bg-[#0E2C36] px-3.5 text-xs font-semibold text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C] whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#95B3B5]" aria-hidden="true" />
            <span>{copy.refreshResults}</span>
          </button>

          <button
            type="button"
            onClick={onStartNewParticipant}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#327D87]/50 bg-[#0E2C36] px-4 text-sm font-medium text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
          >
            <Plus className="h-4 w-4 text-[#95B3B5]" aria-hidden="true" />
            <span>{copy.newParticipant}</span>
          </button>

          <button
            type="button"
            disabled={responses.length === 0}
            onClick={() => exportResponsesToCsv(responses)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#CBE0E1] px-4 text-sm font-bold text-[#0C141B] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{copy.exportCsv}</span>
          </button>

          {responses.length > 0 && !confirmingClear && (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#327D87]/35 bg-[#0E2C36] px-3.5 text-sm font-medium text-[#95B3B5] transition-colors hover:border-red-400/50 hover:bg-red-950/60 hover:text-red-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{copy.clearData}</span>
            </button>
          )}

          {confirmingClear && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-red-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 whitespace-nowrap shrink-0"
              >
                {copy.confirmClear}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#327D87]/50 bg-[#0E2C36] px-3.5 text-sm font-medium text-[#CBE0E1] transition-colors hover:bg-[#08545C] whitespace-nowrap shrink-0"
              >
                {copy.cancelClear}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onLock}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#327D87]/35 bg-[#0C141B]/70 px-3 text-xs font-medium text-[#95B3B5] transition-colors hover:border-[#95B3B5] hover:text-[#CBE0E1] whitespace-nowrap shrink-0"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{copy.lockDashboard}</span>
          </button>
        </div>
      </div>

      {dashboardError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-400/50 bg-red-950/45 px-4 py-3 text-xs text-red-200"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
          <span className="break-all leading-relaxed">{dashboardError}</span>
        </div>
      )}

      {responses.length === 0 ? (
        <section className="mt-10 rounded-2xl border border-[#327D87]/35 bg-[#0E2C36]/85 px-6 py-16 text-center backdrop-blur-md">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#CBE0E1]">
            {copy.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#95B3B5]">
            {copy.emptyDesc}
          </p>
          <button
            type="button"
            onClick={onStartNewParticipant}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#CBE0E1] px-6 text-sm font-bold text-[#0C141B] transition-colors hover:bg-white whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{copy.emptyAction}</span>
          </button>
        </section>
      ) : (
        <div className="mt-8 space-y-10">
          {/* Top KPI Strip */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-[#95B3B5]">{copy.statParticipants}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#CBE0E1] sm:text-3xl">
                {totalSessions}
              </p>
            </div>
            <div className="rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-[#95B3B5]">{copy.statResponses}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#CBE0E1] sm:text-3xl">
                {scopedResponses.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-[#95B3B5]">{copy.statOverallYes}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-300 sm:text-3xl">
                {overallYesRate.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 p-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-[#95B3B5]">{copy.statLastUpdated}</p>
              <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-[#CBE0E1] sm:text-base">
                {latestTimestamp}
              </p>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap items-center gap-1 rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 p-1"
              role="tablist"
              aria-label="Category filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[38px] rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#CBE0E1] text-[#0C141B] font-semibold'
                    : 'text-[#95B3B5] hover:text-white'
                }`}
              >
                {copy.filterAll}
              </button>
              {WORD_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[38px] rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === category
                      ? 'bg-[#CBE0E1] text-[#0C141B] font-semibold'
                      : 'text-[#95B3B5] hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <label
                htmlFor="participant-filter"
                className="text-xs font-medium text-[#95B3B5] whitespace-nowrap"
              >
                {copy.participantFilterLabel}:
              </label>
              <select
                id="participant-filter"
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="min-h-[40px] rounded-xl border border-[#327D87]/45 bg-[#0E2C36] px-3 text-xs font-medium text-[#CBE0E1] focus:border-[#CBE0E1] focus:outline-none"
              >
                <option value="all">{copy.allParticipants}</option>
                {participantOptions.map((item) => (
                  <option key={item.sessionId} value={item.sessionId}>
                    {item.code}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 3-Category Percentage Breakdown */}
          <section aria-labelledby="category-breakdown-heading">
            <div className="mb-4">
              <h2
                id="category-breakdown-heading"
                className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#CBE0E1]"
              >
                {copy.categorySectionTitle}
              </h2>
              <p className="mt-1 text-sm text-[#95B3B5]">{copy.categorySectionDesc}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {categorySummaries.map((summary) => {
                const labelInfo = copy.categoryLabels[summary.category];
                const barColor = CATEGORY_BAR_COLOR[summary.category];

                return (
                  <div
                    key={summary.category}
                    className="flex flex-col justify-between rounded-2xl border border-[#327D87]/40 bg-[#0E2C36]/90 p-6 backdrop-blur-sm"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-[#CBE0E1]">{labelInfo.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#95B3B5]">
                        {labelInfo.subtitle}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-3xl font-bold tabular-nums text-[#CBE0E1] sm:text-4xl">
                          {summary.yesPercentage.toFixed(1)}%
                        </span>
                        <span className="font-mono text-xs tabular-nums text-[#95B3B5]">
                          {summary.yesCount} / {summary.total} {copy.yesLabel}
                        </span>
                      </div>

                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#0C141B]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, summary.yesPercentage))}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clean SVG Chart Comparison */}
          <section className="rounded-2xl border border-[#327D87]/40 bg-[#0E2C36]/90 p-6 backdrop-blur-sm">
            <h2 className="text-base font-semibold text-[#CBE0E1]">{copy.chartTitle}</h2>
            <div className="mt-5 space-y-4">
              {categorySummaries.map((summary) => {
                const barColor = CATEGORY_BAR_COLOR[summary.category];
                return (
                  <div key={summary.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#CBE0E1]">{summary.category}</span>
                      <span className="font-mono font-semibold tabular-nums text-[#95B3B5]">
                        {summary.yesPercentage.toFixed(1)}% ({summary.yesCount}/{summary.total})
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 600 18"
                      className="h-4.5 w-full overflow-visible"
                      role="img"
                      aria-label={`${summary.category}: ${summary.yesPercentage.toFixed(1)}% Yes`}
                    >
                      <rect x="0" y="2" width="600" height="14" rx="4" fill="#0C141B" />
                      <line x1="150" y1="0" x2="150" y2="18" stroke="#275766" strokeWidth="1" />
                      <line x1="300" y1="0" x2="300" y2="18" stroke="#275766" strokeWidth="1" />
                      <line x1="450" y1="0" x2="450" y2="18" stroke="#275766" strokeWidth="1" />
                      <rect
                        x="0"
                        y="2"
                        width={Math.max(0, Math.min(600, (summary.yesPercentage / 100) * 600))}
                        height="14"
                        rx="4"
                        fill={barColor}
                      />
                    </svg>
                  </div>
                );
              })}
              <div className="flex justify-between pt-1 font-mono text-[11px] tabular-nums text-[#8CA293]">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </section>

          {/* Word-by-Word Breakdown Table */}
          <section className="overflow-hidden rounded-2xl border border-[#327D87]/40 bg-[#0E2C36]/90 backdrop-blur-sm">
            <div className="border-b border-[#327D87]/25 px-6 py-4">
              <h2 className="text-base font-semibold text-[#CBE0E1]">{copy.wordBreakdownTitle}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#327D87]/25 bg-[#0C141B]/65 text-xs font-medium text-[#95B3B5]">
                    <th className="px-6 py-3">{copy.colWord}</th>
                    <th className="px-6 py-3">{copy.colCategory}</th>
                    <th className="px-4 py-3 text-right">{copy.colTrials}</th>
                    <th className="px-4 py-3 text-right">{copy.colYes}</th>
                    <th className="px-4 py-3 text-right">{copy.colNo}</th>
                    <th className="px-6 py-3 text-right">{copy.colYesRate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#327D87]/15">
                  {wordSummaries.map((item) => (
                    <tr key={item.word} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-3 font-semibold text-[#CBE0E1]" dir="ltr">
                        {item.word}
                      </td>
                      <td className="px-6 py-3 text-xs text-[#95B3B5]">{item.category}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#95B3B5]">
                        {item.total}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-400">
                        {item.yesCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-red-400">
                        {item.noCount}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold tabular-nums text-[#CBE0E1]">
                        {item.yesPercentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Raw Trial Log Table */}
          <section className="overflow-hidden rounded-2xl border border-[#327D87]/40 bg-[#0E2C36]/90 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#327D87]/25 px-6 py-4">
              <h2 className="text-base font-semibold text-[#CBE0E1]">{copy.recentLogsTitle}</h2>
              <span className="font-mono text-xs tabular-nums text-[#95B3B5]">
                {recentLogs.length} / {scopedResponses.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#327D87]/25 bg-[#0C141B]/65 text-xs font-medium text-[#95B3B5]">
                    <th className="px-6 py-3">{copy.colParticipant}</th>
                    <th className="px-4 py-3">{copy.colWord}</th>
                    <th className="px-4 py-3">{copy.colCategory}</th>
                    <th className="px-4 py-3">{copy.colAnswer}</th>
                    <th className="px-6 py-3 text-right">{copy.colTimestamp}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#327D87]/15">
                  {recentLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-2.5 font-mono text-xs font-medium text-[#95B3B5]">
                        {row.participantCode}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[#CBE0E1]" dir="ltr">
                        {row.word}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#8CA293]">{row.category}</td>
                      <td
                        className={`px-4 py-2.5 text-xs font-semibold ${
                          row.answer === 'Yes' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {row.answer}
                      </td>
                      <td className="px-6 py-2.5 text-right font-mono text-xs tabular-nums text-[#8CA293]">
                        {row.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
