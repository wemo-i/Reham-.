import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AppCopy } from '../data/copy';
import { playChoiceSparkSound } from '../services/sound';
import { AnswerChoice, WordItem } from '../types';

interface TrialViewProps {
  copy: AppCopy;
  participantCode: string;
  words: WordItem[];
  currentIndex: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onAnswer: (answer: AnswerChoice, reactionTimeMs: number) => void;
  onAbort: () => void;
}

const SPARK_VECTORS = [
  { tx: '-76px', ty: '-54px' },
  { tx: '-34px', ty: '-82px' },
  { tx: '22px', ty: '-86px' },
  { tx: '72px', ty: '-58px' },
  { tx: '88px', ty: '-8px' },
  { tx: '64px', ty: '52px' },
  { tx: '-62px', ty: '54px' },
  { tx: '-88px', ty: '-6px' },
];

export function TrialView({
  copy,
  participantCode,
  words,
  currentIndex,
  soundEnabled,
  onToggleSound,
  onAnswer,
  onAbort,
}: TrialViewProps) {
  const currentWord = words[currentIndex];
  const totalWords = words.length;
  const trialStartRef = useRef<number>(performance.now());
  const lockedRef = useRef<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sparkChoice, setSparkChoice] = useState<AnswerChoice | null>(null);
  const [lastSpeedFast, setLastSpeedFast] = useState(false);

  useEffect(() => {
    trialStartRef.current = performance.now();
    lockedRef.current = false;
    setIsTransitioning(false);
    setSparkChoice(null);
  }, [currentIndex]);

  const submitAnswer = (choice: AnswerChoice) => {
    if (lockedRef.current || !currentWord) return;
    lockedRef.current = true;
    const rt = Math.max(0, Math.round(performance.now() - trialStartRef.current));
    setLastSpeedFast(rt < 1200);
    setSparkChoice(choice);
    setIsTransitioning(true);
    playChoiceSparkSound(choice, soundEnabled);

    window.setTimeout(() => {
      onAnswer(choice, rt);
    }, 170);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === 'ArrowLeft' || event.key === 'y' || event.key === 'Y') {
        event.preventDefault();
        submitAnswer('Yes');
      } else if (event.key === 'ArrowRight' || event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        submitAnswer('No');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentWord) return null;

  const progressRatio = (currentIndex + 1) / totalWords;
  const pointsEarned = currentIndex * 10;

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col text-[#CBE0E1]">
      {/* Silver-Teal Luminous Progress Bar */}
      <div
        className="h-1.5 w-full bg-[#0E2C36]"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalWords}
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-[#08545C] via-[#327D87] to-[#CBE0E1] transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progressRatio})` }}
        />
      </div>

      {/* Compact Game HUD */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#95B3B5]">
          <span className="font-mono font-semibold text-[#CBE0E1]">{participantCode}</span>
          <span aria-hidden="true" className="text-[#327D87]">
            ·
          </span>
          <span className="font-mono tabular-nums text-[#CBE0E1]">
            {String(currentIndex + 1).padStart(2, '0')} / {totalWords}
          </span>
          <span aria-hidden="true" className="text-[#327D87]">
            ·
          </span>
          <span className="font-mono font-semibold tabular-nums text-[#95B3B5]">
            {pointsEarned} {copy.pointsLabel}
          </span>
          {lastSpeedFast && currentIndex > 0 && (
            <>
              <span aria-hidden="true" className="hidden text-[#327D87] sm:inline">
                ·
              </span>
              <span className="hidden items-center gap-1 text-[#CBE0E1] sm:inline-flex">
                <Sparkles className="h-3 w-3 text-[#95B3B5]" aria-hidden="true" />
                <span>{copy.reflexFast}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? copy.soundOn : copy.soundOff}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#327D87]/50 bg-[#0E2C36]/90 text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C]"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-[#8CA293]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onAbort}
            className="min-h-[44px] rounded-lg px-3 text-xs font-medium text-[#95B3B5] transition-colors hover:bg-[#0E2C36] hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
          >
            {copy.exitSession}
          </button>
        </div>
      </header>

      {/* Main Enchanted Trial Stage */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-between px-4 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        <div className="w-full text-center">
          <h1
            dir="ltr"
            className="font-[family-name:var(--font-display)] text-2xl font-bold leading-snug tracking-wide text-[#CBE0E1] sm:text-3xl md:text-4xl [text-wrap:balance]"
          >
            Do you think this is a real English word?
          </h1>
        </div>

        {/* Luminous Silver-Mist Word Card */}
        <div className="relative my-auto flex w-full max-w-xl items-center justify-center py-6">
          {sparkChoice && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {SPARK_VECTORS.map((vec, idx) => (
                <span
                  key={idx}
                  className={`animate-spark absolute h-2.5 w-2.5 rounded-full ${
                    sparkChoice === 'Yes' ? 'bg-emerald-300' : 'bg-red-400'
                  } shadow-[0_0_12px_rgba(203,224,225,0.9)]`}
                  style={
                    {
                      '--tx': vec.tx,
                      '--ty': vec.ty,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}

          <div
            className={`relative w-full rounded-3xl border border-[#CBE0E1]/60 bg-gradient-to-b from-[#E3F0F1] to-[#CBE0E1] px-6 py-12 shadow-[0_24px_80px_rgba(8,84,92,0.55)] transition-all duration-150 sm:px-10 sm:py-16 ${
              isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2.5 rounded-2xl border border-[#275766]/25"
            />
            <div
              dir="ltr"
              lang="en"
              className="relative select-none text-center text-5xl font-bold tracking-tight text-[#0C141B] sm:text-6xl md:text-7xl"
            >
              {currentWord.word}
            </div>
          </div>
        </div>

        {/* Swapped Button Colors: Left = Yes (GREEN), Right = No (RED) */}
        <div className="w-full max-w-xl">
          <div dir="ltr" className="grid grid-cols-2 gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => submitAnswer('Yes')}
              className="flex min-h-[80px] w-full items-center justify-center rounded-2xl border-2 border-emerald-300/45 bg-gradient-to-b from-emerald-600 to-emerald-700 px-6 font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white shadow-xl shadow-emerald-950/60 transition-transform duration-100 hover:from-emerald-500 hover:to-emerald-700 active:scale-[0.97] sm:min-h-[94px] sm:text-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() => submitAnswer('No')}
              className="flex min-h-[80px] w-full items-center justify-center rounded-2xl border-2 border-red-300/45 bg-gradient-to-b from-red-600 to-red-700 px-6 font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white shadow-xl shadow-red-950/60 transition-transform duration-100 hover:from-red-500 hover:to-red-700 active:scale-[0.97] sm:min-h-[94px] sm:text-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400"
            >
              No
            </button>
          </div>

          <p className="mt-4 hidden text-center text-xs text-[#8CA293] sm:block">
            {copy.trialHint}
          </p>
        </div>
      </main>
    </div>
  );
}
