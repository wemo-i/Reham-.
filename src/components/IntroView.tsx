import { ArrowRight, Check, RefreshCw, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { motion } from 'motion/react';
import { FormEvent, useState } from 'react';
import { AppCopy } from '../data/copy';

interface IntroViewProps {
  copy: AppCopy;
  participantCode: string;
  soundEnabled: boolean;
  isResearcher: boolean;
  onToggleSound: () => void;
  onChangeCode: (value: string) => void;
  onGenerateCode: () => void;
  onStart: () => void;
  onOpenDashboard: () => void;
}

type ConsentChoice = 'pending' | 'agreed' | 'declined';

export function IntroView({
  copy,
  participantCode,
  soundEnabled,
  isResearcher,
  onToggleSound,
  onChangeCode,
  onGenerateCode,
  onStart,
  onOpenDashboard,
}: IntroViewProps) {
  const [consentChoice, setConsentChoice] = useState<ConsentChoice>('pending');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (consentChoice !== 'agreed') return;
    onStart();
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Top Enchanted Header with Animated Luminous Seal */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start justify-between gap-6 border-b border-[#327D87]/35 pb-7 md:flex-row md:items-center"
      >
        <div className="flex items-center gap-4">
          {/* Animated Moving Celestial/Mystical Emblem */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20">
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full text-[#95B3B5]/70"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="6 6"
              />
              <circle cx="50" cy="5" r="2.5" fill="#CBE0E1" />
              <circle cx="95" cy="50" r="2" fill="#327D87" />
              <circle cx="50" cy="95" r="2.5" fill="#CBE0E1" />
            </motion.svg>
            <div className="animate-aura flex h-12 w-12 items-center justify-center rounded-full border border-[#CBE0E1]/45 bg-gradient-to-br from-[#08545C] to-[#0E2C36] text-[#CBE0E1] shadow-[0_0_24px_rgba(50,125,135,0.45)] sm:h-14 sm:w-14">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium tracking-wide text-[#95B3B5]">
              {copy.introKicker}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-[#CBE0E1] sm:text-3xl lg:text-4xl [text-wrap:balance]">
              {copy.introHeadline}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? copy.soundOn : copy.soundOff}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#327D87]/50 bg-[#0E2C36]/90 px-4 text-xs font-semibold text-[#CBE0E1] transition-colors hover:border-[#95B3B5] hover:bg-[#08545C] whitespace-nowrap shrink-0"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-[#CBE0E1]" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4 text-[#8CA293]" aria-hidden="true" />
          )}
          <span>{soundEnabled ? copy.soundOn : copy.soundOff}</span>
        </button>
      </motion.section>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#95B3B5] sm:text-base">
        {copy.introLead}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#8CA293]">
        {copy.protocolMeta.map((item, idx) => (
          <span key={item} className="inline-flex items-center gap-3">
            <span>{item}</span>
            {idx < copy.protocolMeta.length - 1 && (
              <span aria-hidden="true" className="text-[#327D87]">
                ·
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Main Content Split: Animated Informed Consent Form + Agreement/Launch Card */}
      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Informed Consent Form Document */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[#327D87]/45 bg-[#0E2C36]/85 p-6 backdrop-blur-md sm:p-8 lg:col-span-7"
        >
          <div className="border-b border-[#327D87]/35 pb-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#CBE0E1] sm:text-2xl">
              {copy.consentFormHeader}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#CBE0E1]">
              <span className="font-semibold text-[#95B3B5]">{copy.studyTitleLabel} </span>
              <span>{copy.studyTitleValue}</span>
            </p>
          </div>

          <div className="mt-5 space-y-5">
            {copy.consentSections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.28,
                  delay: 0.08 + idx * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="rounded-xl border border-[#275766]/45 bg-[#0C141B]/55 p-4 transition-colors hover:border-[#327D87]/70"
              >
                <h3 className="text-sm font-semibold text-[#CBE0E1]">{section.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#95B3B5]">{section.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Interactive Participant Agreement & Launch Panel */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="lg:sticky lg:top-20 lg:col-span-5"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#95B3B5]/35 bg-[#0E2C36]/95 p-6 shadow-2xl shadow-black/45 backdrop-blur-md sm:p-7"
          >
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#CBE0E1]">
              {copy.agreementHeading}
            </h2>

            <div className="mt-4 space-y-3" role="radiogroup" aria-label={copy.agreementHeading}>
              <button
                type="button"
                role="radio"
                aria-checked={consentChoice === 'agreed'}
                onClick={() => setConsentChoice('agreed')}
                className={`flex min-h-[54px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                  consentChoice === 'agreed'
                    ? 'border-emerald-400 bg-[#0D4A3F] text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-[#275766] bg-[#0C141B]/70 text-[#CBE0E1] hover:border-[#327D87]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                    consentChoice === 'agreed'
                      ? 'border-emerald-300 bg-emerald-500 text-slate-950'
                      : 'border-[#8CA293]/60 bg-transparent'
                  }`}
                >
                  {consentChoice === 'agreed' && <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />}
                </span>
                <span className="flex-1">{copy.agreeOption}</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={consentChoice === 'declined'}
                onClick={() => setConsentChoice('declined')}
                className={`flex min-h-[54px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                  consentChoice === 'declined'
                    ? 'border-red-400 bg-red-950/70 text-red-100'
                    : 'border-[#275766] bg-[#0C141B]/70 text-[#CBE0E1] hover:border-[#327D87]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                    consentChoice === 'declined'
                      ? 'border-red-300 bg-red-500 text-white'
                      : 'border-[#8CA293]/60 bg-transparent'
                  }`}
                >
                  {consentChoice === 'declined' && <X className="h-4 w-4 stroke-[3]" aria-hidden="true" />}
                </span>
                <span className="flex-1">{copy.declineOption}</span>
              </button>
            </div>

            {consentChoice === 'declined' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-xl border border-red-400/35 bg-[#0C141B]/80 p-4"
              >
                <p className="text-sm font-semibold text-red-200">{copy.declinedTitle}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#95B3B5]">
                  {copy.declinedMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setConsentChoice('pending')}
                  className="mt-3 min-h-[40px] rounded-lg border border-[#327D87]/60 px-3 text-xs font-semibold text-[#CBE0E1] transition-colors hover:bg-[#08545C]"
                >
                  {copy.reconsiderButton}
                </button>
              </motion.div>
            )}

            {consentChoice === 'agreed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 border-t border-[#327D87]/35 pt-5"
              >
                <label
                  htmlFor="participant-code-input"
                  className="block text-sm font-semibold text-[#CBE0E1]"
                >
                  {copy.participantLabel}
                </label>

                <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="participant-code-input"
                    type="text"
                    value={participantCode}
                    onChange={(e) => onChangeCode(e.target.value)}
                    placeholder={copy.participantPlaceholder}
                    maxLength={48}
                    autoComplete="off"
                    className="min-h-[48px] w-full flex-1 rounded-xl border border-[#327D87]/60 bg-[#0C141B] px-4 font-mono text-sm text-[#CBE0E1] placeholder:font-sans placeholder:text-[#8CA293]/70 focus:border-[#CBE0E1] focus:outline-none focus:ring-2 focus:ring-[#327D87]/40"
                  />
                  <button
                    type="button"
                    onClick={onGenerateCode}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#327D87]/60 bg-[#08545C] px-4 text-sm font-semibold text-[#CBE0E1] transition-colors hover:bg-[#327D87] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.generateCode}</span>
                  </button>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#8CA293]">
                  {copy.participantHelp}
                </p>

                <button
                  type="submit"
                  className="mt-5 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl border border-[#CBE0E1]/50 bg-gradient-to-r from-[#0D4A3F] via-[#08545C] to-[#327D87] px-6 text-base font-bold text-white shadow-lg shadow-[#08545C]/50 transition-transform duration-150 hover:brightness-110 active:scale-[0.98] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBE0E1]"
                >
                  <span>{copy.startButton}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {consentChoice === 'pending' && (
              <p className="mt-5 rounded-xl border border-[#275766]/50 bg-[#0C141B]/55 px-4 py-3 text-xs leading-relaxed text-[#95B3B5]">
                {copy.consentRequiredHint}
              </p>
            )}

            {isResearcher && (
              <div className="mt-5 border-t border-[#327D87]/25 pt-4 text-center">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="min-h-[44px] px-2 text-sm font-medium text-[#95B3B5] underline-offset-4 transition-colors hover:text-[#CBE0E1] hover:underline"
                >
                  {copy.openDashboardLink}
                </button>
              </div>
            )}
          </form>
        </motion.aside>
      </div>
    </main>
  );
}
