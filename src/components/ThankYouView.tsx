import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { AppCopy } from '../data/copy';
import { HARRY_POTTER_MEANINGS } from '../data/words';
import { playVictorySound } from '../services/sound';
import { Locale, TrialResponse } from '../types';

interface ThankYouViewProps {
  copy: AppCopy;
  locale: Locale;
  participantCode: string;
  sessionRecords: TrialResponse[];
  soundEnabled: boolean;
  isResearcher: boolean;
  onProceedToDashboard: () => void;
  onPlayAgain: () => void;
}

export function ThankYouView({
  copy,
  locale,
  participantCode,
  sessionRecords,
  soundEnabled,
  isResearcher,
  onProceedToDashboard,
  onPlayAgain,
}: ThankYouViewProps) {
  const [secondsLeft, setSecondsLeft] = useState(6);
  const [showGlossary, setShowGlossary] = useState(false);

  const summary = useMemo(() => {
    const realTotal = sessionRecords.filter((r) => r.category === 'Real English Words');
    const realYes = realTotal.filter((r) => r.answer === 'Yes').length;

    const coinedTotal = sessionRecords.filter((r) => r.category === 'Harry Potter Coined Words');
    const coinedYes = coinedTotal.filter((r) => r.answer === 'Yes').length;

    const nonTotal = sessionRecords.filter((r) => r.category === 'Plausible Nonwords');
    const nonNo = nonTotal.filter((r) => r.answer === 'No').length;

    const rts = sessionRecords
      .map((r) => r.reactionTimeMs)
      .filter((rt): rt is number => typeof rt === 'number');
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;

    return {
      realYes,
      realTotal: realTotal.length,
      coinedYes,
      coinedTotal: coinedTotal.length,
      nonNo,
      nonTotal: nonTotal.length,
      avgRt,
    };
  }, [sessionRecords]);

  const answerLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of sessionRecords) {
      map.set(r.word.toLowerCase(), r.answer);
    }
    return map;
  }, [sessionRecords]);

  useEffect(() => {
    playVictorySound(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isResearcher || showGlossary) return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      onProceedToDashboard();
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isResearcher, onProceedToDashboard, showGlossary]);

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-3xl border border-[#327D87]/50 bg-[#0E2C36]/90 p-6 text-center shadow-2xl shadow-black/50 backdrop-blur-md sm:p-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#CBE0E1]/40 bg-[#08545C] text-[#CBE0E1] shadow-[0_0_28px_rgba(50,125,135,0.5)]">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>

        <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-[#CBE0E1] sm:text-3xl [text-wrap:balance]">
          {copy.thankYouHeadline}
        </h1>

        <p className="mt-2.5 text-sm leading-relaxed text-[#95B3B5] sm:text-base">
          {copy.thankYouBody}{' '}
          <span className="font-mono font-semibold text-[#CBE0E1]">{participantCode}</span>.
        </p>

        {/* Personal Round Breakdown */}
        <div className="mt-7 rounded-2xl border border-[#327D87]/35 bg-[#0C141B]/75 p-5">
          <h2 className="text-center text-xs font-semibold tracking-wide text-[#95B3B5]">
            {copy.personalSummaryTitle}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#275766]/50 bg-[#0E2C36]/80 p-3.5 text-center">
              <p className="text-[11px] text-[#95B3B5]">{copy.realRecognizedLabel}</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#CBE0E1]">
                {summary.realYes}/{summary.realTotal}
              </p>
            </div>
            <div className="rounded-xl border border-[#275766]/50 bg-[#0E2C36]/80 p-3.5 text-center">
              <p className="text-[11px] text-[#95B3B5]">{copy.coinedSpottedLabel}</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-emerald-300">
                {summary.coinedYes}/{summary.coinedTotal}
              </p>
            </div>
            <div className="rounded-xl border border-[#275766]/50 bg-[#0E2C36]/80 p-3.5 text-center">
              <p className="text-[11px] text-[#95B3B5]">{copy.nonwordsRejectedLabel}</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#CBE0E1]">
                {summary.nonNo}/{summary.nonTotal}
              </p>
            </div>
            <div className="rounded-xl border border-[#275766]/50 bg-[#0E2C36]/80 p-3.5 text-center">
              <p className="text-[11px] text-[#95B3B5]">{copy.avgSpeedLabel}</p>
              <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-[#CBE0E1]">
                {summary.avgRt}ms
              </p>
            </div>
          </div>
        </div>

        {/* Magical Harry Potter Word Meanings Reveal Box */}
        <div className="mt-6 rounded-2xl border border-[#95B3B5]/35 bg-gradient-to-b from-[#08545C]/45 to-[#0C141B]/80 p-5 text-center">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:text-start">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#CBE0E1]/35 bg-[#0E2C36] text-[#CBE0E1]">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-[#CBE0E1]">
                  {copy.glossaryPromptTitle}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-[#95B3B5]">
                  {copy.glossaryPromptSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGlossary((prev) => !prev)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#CBE0E1]/45 bg-[#08545C] px-4 text-xs font-bold text-white shadow-md shadow-[#0C141B]/50 transition-colors hover:bg-[#327D87] whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-4 w-4 text-[#CBE0E1]" aria-hidden="true" />
              <span>{showGlossary ? copy.glossaryCloseButton : copy.glossaryOpenButton}</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showGlossary && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="mt-5 border-t border-[#327D87]/35 pt-5 text-start"
              >
                <p className="rounded-xl border border-[#327D87]/35 bg-[#0E2C36]/90 px-4 py-3 text-xs leading-relaxed text-[#CBE0E1] sm:text-sm">
                  {copy.glossaryCredit}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {HARRY_POTTER_MEANINGS.map((entry, idx) => {
                    const userAnswer = answerLookup.get(entry.matchKey);

                    return (
                      <div
                        key={entry.word}
                        className="flex flex-col justify-between rounded-xl border border-[#275766]/65 bg-[#0C141B]/85 p-4 transition-colors hover:border-[#95B3B5]/50"
                      >
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h3
                              dir="ltr"
                              className="font-[family-name:var(--font-display)] text-base font-bold text-[#CBE0E1]"
                            >
                              <span className="mr-2 font-mono text-xs font-medium tabular-nums text-[#8CA293]">
                                {String(idx + 1).padStart(2, '0')}.
                              </span>
                              {entry.word}
                            </h3>

                            {userAnswer && (
                              <span
                                className={`font-mono text-[11px] font-semibold ${
                                  userAnswer === 'Yes' ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {copy.yourAnswerLabel}: {userAnswer}
                              </span>
                            )}
                          </div>

                          <p dir="ltr" className="mt-2 text-xs leading-relaxed text-[#95B3B5] sm:text-sm">
                            {entry.meaningEn}
                          </p>
                          {locale === 'ar' && (
                            <p dir="rtl" className="mt-1.5 text-xs leading-relaxed text-[#8CA293]">
                              {entry.meaningAr}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isResearcher ? (
          <>
            {!showGlossary && (
              <p className="mt-6 font-mono text-xs tabular-nums text-[#95B3B5]">
                {copy.redirectingNotice(secondsLeft)}
              </p>
            )}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onProceedToDashboard}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#CBE0E1] px-6 text-sm font-bold text-[#0C141B] transition-colors hover:bg-white sm:w-auto whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
              >
                <span>{copy.viewStatsNow}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onPlayAgain}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#327D87]/60 bg-[#08545C]/60 px-5 text-sm font-semibold text-[#CBE0E1] transition-colors hover:bg-[#08545C] sm:w-auto whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>{copy.playAgain}</span>
              </button>
            </div>
          </>
        ) : (
          <p className="mt-6 text-xs leading-relaxed text-[#95B3B5] sm:text-sm">
            {copy.studentCompleteNotice}
          </p>
        )}
      </motion.div>
    </main>
  );
}
