import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Lock, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { IntroView } from './components/IntroView';
import { MagicalMistCanvas } from './components/MagicalMistCanvas';
import { ThankYouView } from './components/ThankYouView';
import { TopBar } from './components/TopBar';
import { TrialView } from './components/TrialView';
import { COPY } from './data/copy';
import { EXPERIMENT_WORDS, generateParticipantCode, shuffleWords } from './data/words';
import { auth, googleProvider, isAuthorizedResearcher } from './firebase';
import {
  playStartSpellSound,
  stopAmbientMagicSound,
  syncAmbientMagicSound,
} from './services/sound';
import {
  clearAllResponses,
  fetchAllResponses,
  flushSessionResponses,
  logTrialResponseBackground,
  subscribeToAllResponses,
} from './services/storage';
import { AnswerChoice, AppPhase, Locale, TrialResponse, WordItem } from './types';

const RESEARCHER_ACCESS_TOKEN = 'lexlab2026';
const RESEARCHER_PASSCODE = '2026';
const SESSION_KEY_STORAGE = 'lexical_researcher_key';

function getInitialResearcherKey(): string {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (path.endsWith('/results') || path.endsWith('/admin') || hash === 'results' || hash === 'admin') {
    return RESEARCHER_ACCESS_TOKEN;
  }
  const params = new URLSearchParams(window.location.search);
  const token = params.get('researcher');
  if (token === RESEARCHER_ACCESS_TOKEN) {
    return token;
  }
  try {
    return window.sessionStorage.getItem(SESSION_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [researcherKey, setResearcherKey] = useState<string>(() => getInitialResearcherKey());
  const isResearcher = researcherKey.length > 0;

  const [locale, setLocale] = useState<Locale>('en');
  const [phase, setPhase] = useState<AppPhase>(() => (researcherKey ? 'dashboard' : 'intro'));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [participantInput, setParticipantInput] = useState<string>('');
  const [activeCode, setActiveCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [shuffledWords, setShuffledWords] = useState<WordItem[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [sessionRecords, setSessionRecords] = useState<TrialResponse[]>([]);
  const [allResponses, setAllResponses] = useState<TrialResponse[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [dashboardError, setDashboardError] = useState<string>('');

  // Discreet Passcode Modal for unlocking results directly inside *.ai.studio URLs
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  const copy = COPY[locale];
  const isAuthorized = isAuthorizedResearcher(authUser);

  useEffect(() => {
    void flushSessionResponses([]);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      setAuthError('');
      setDashboardError('');
    });
    return () => unsubscribe();
  }, []);

  const loadAllResponses = useCallback(async () => {
    if (!isResearcher || !isAuthorized) return;
    setIsLoadingDashboard(true);
    setDashboardError('');
    try {
      const records = await fetchAllResponses();
      setAllResponses(records);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [isResearcher, isAuthorized]);

  useEffect(() => {
    if (!isResearcher || !authReady || !isAuthorized) {
      if (!isAuthorized) {
        setAllResponses([]);
        setIsLoadingDashboard(false);
      }
      return;
    }

    setIsLoadingDashboard(true);
    setDashboardError('');
    const unsubscribe = subscribeToAllResponses(
      (records) => {
        setAllResponses(records);
        setDashboardError('');
        setIsLoadingDashboard(false);
      },
      (error) => {
        setDashboardError(error.message);
        setIsLoadingDashboard(false);
      }
    );

    return () => unsubscribe();
  }, [isResearcher, authReady, isAuthorized]);

  useEffect(() => {
    const unlock = () => {
      setAudioUnlocked(true);
      if (soundEnabled) {
        syncAmbientMagicSound(true);
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      stopAmbientMagicSound();
    };
  }, []);

  useEffect(() => {
    if (!audioUnlocked) return;
    syncAmbientMagicSound(soundEnabled);
  }, [soundEnabled, audioUnlocked]);

  const handleToggleSound = () => {
    setAudioUnlocked(true);
    setSoundEnabled((prev) => {
      const next = !prev;
      syncAmbientMagicSound(next);
      return next;
    });
  };

  const handleGenerateCode = () => {
    setParticipantInput(generateParticipantCode());
  };

  const handleStartExperiment = () => {
    const resolvedCode = participantInput.trim() || generateParticipantCode();
    const newSessionId = createSessionId();
    setActiveCode(resolvedCode);
    setParticipantInput(resolvedCode);
    setSessionId(newSessionId);
    setShuffledWords(shuffleWords(EXPERIMENT_WORDS));
    setTrialIndex(0);
    setSessionRecords([]);
    playStartSpellSound(soundEnabled);
    setPhase('trial');
  };

  const handleTrialAnswer = (answer: AnswerChoice, reactionTimeMs: number) => {
    const wordItem = shuffledWords[trialIndex];
    if (!wordItem) return;

    const record: TrialResponse = {
      id: `${sessionId}-${trialIndex}`,
      sessionId,
      participantCode: activeCode,
      word: wordItem.word,
      category: wordItem.category,
      answer,
      timestamp: new Date().toISOString(),
      reactionTimeMs,
    };

    const nextSessionRecords = [...sessionRecords, record];
    setSessionRecords(nextSessionRecords);
    logTrialResponseBackground(record);

    if (trialIndex + 1 < shuffledWords.length) {
      setTrialIndex((prev) => prev + 1);
    } else {
      void flushSessionResponses(nextSessionRecords).then(() => {
        if (isResearcher) {
          void loadAllResponses();
        }
      });
      setPhase('thankyou');
    }
  };

  const handleNavigate = (target: 'intro' | 'dashboard') => {
    if (target === 'dashboard' && isResearcher) {
      void loadAllResponses();
      setPhase('dashboard');
    } else {
      setPhase('intro');
    }
  };

  const handleProceedToDashboard = useCallback(() => {
    if (!isResearcher) return;
    void loadAllResponses();
    setPhase('dashboard');
  }, [isResearcher, loadAllResponses]);

  const handleStartNewParticipant = () => {
    setParticipantInput('');
    setPhase('intro');
  };

  const handleClearAll = async () => {
    if (!isResearcher || !isAuthorized) return;
    await clearAllResponses();
    setAllResponses([]);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          locale === 'ar'
            ? `هذا الدومين (${window.location.hostname}) غير مضاف في نطاقات Firebase المصرح لها. أضفه في Firebase Console > Authentication > Settings > Authorized domains، أو افتح النتائج من رابط Firebase/Run المباشر.`
            : `Domain (${window.location.hostname}) is not authorized for Google Sign-In. Add it in Firebase Console > Authentication > Settings > Authorized domains, or open /results on the direct app URL.`
        );
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          locale === 'ar'
            ? 'المتصفح حجب نافذة تسجيل الدخول المنبثقة. اسمح بالنوافذ المنبثقة أو افتح رابط /results في تبويب مستقل.'
            : 'Browser blocked the Google sign-in popup. Allow popups or open /results in a standalone tab.'
        );
      } else {
        setAuthError(code ? `${copy.researcherAuthError} (${code})` : copy.researcherAuthError);
      }
    }
  };

  const handleGoogleSignOut = async () => {
    setAuthError('');
    try {
      await signOut(auth);
    } catch {
      // Ignore sign-out errors
    }
  };

  const handleLockDashboard = () => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY_STORAGE);
    } catch {
      // Ignore storage error
    }
    void signOut(auth).catch(() => undefined);
    setResearcherKey('');
    setAllResponses([]);
    setAuthError('');
    setPhase('intro');
    if (
      window.location.pathname.endsWith('/results') ||
      window.location.pathname.endsWith('/admin') ||
      window.location.hash === '#results'
    ) {
      const resetPath = new URL(import.meta.env.BASE_URL || '/', window.location.href).pathname;
      window.history.replaceState({}, '', resetPath);
    }
  };

  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    const candidate = pinInput.trim();
    if (!candidate) return;

    setIsVerifyingPin(true);
    setPinError('');

    if (candidate !== RESEARCHER_PASSCODE && candidate !== RESEARCHER_ACCESS_TOKEN) {
      setPinError(copy.researcherPinError);
      setIsVerifyingPin(false);
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY_STORAGE, RESEARCHER_ACCESS_TOKEN);
    } catch {
      // Ignore storage error
    }
    setResearcherKey(RESEARCHER_ACCESS_TOKEN);
    setShowPinModal(false);
    setPinInput('');
    setIsVerifyingPin(false);
    setPhase('dashboard');
  };

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  if (phase === 'trial') {
    return (
      <div
        dir={dir}
        lang={locale}
        className="relative min-h-[100dvh] bg-gradient-to-b from-[#0C141B] via-[#0E2C36] to-[#0C141B] text-[#CBE0E1]"
      >
        <MagicalMistCanvas />
        <TrialView
          copy={copy}
          participantCode={activeCode}
          words={shuffledWords}
          currentIndex={trialIndex}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onAnswer={handleTrialAnswer}
          onAbort={() => setPhase('intro')}
        />
      </div>
    );
  }

  return (
    <div
      dir={dir}
      lang={locale}
      className="relative flex min-h-[100dvh] flex-col bg-gradient-to-b from-[#0C141B] via-[#0E2C36] to-[#0C141B] text-[#CBE0E1]"
    >
      <MagicalMistCanvas />
      <TopBar
        copy={copy}
        locale={locale}
        phase={phase}
        isResearcher={isResearcher}
        onNavigate={handleNavigate}
        onToggleLocale={() => setLocale((prev) => (prev === 'en' ? 'ar' : 'en'))}
      />

      {phase === 'intro' && (
        <IntroView
          copy={copy}
          participantCode={participantInput}
          soundEnabled={soundEnabled}
          isResearcher={isResearcher}
          onToggleSound={handleToggleSound}
          onChangeCode={setParticipantInput}
          onGenerateCode={handleGenerateCode}
          onStart={handleStartExperiment}
          onOpenDashboard={() => handleNavigate('dashboard')}
        />
      )}

      {phase === 'thankyou' && (
        <ThankYouView
          copy={copy}
          locale={locale}
          participantCode={activeCode}
          sessionRecords={sessionRecords}
          soundEnabled={soundEnabled}
          isResearcher={isResearcher}
          onProceedToDashboard={handleProceedToDashboard}
          onPlayAgain={handleStartNewParticipant}
        />
      )}

      {phase === 'dashboard' && isResearcher && (
        <DashboardView
          copy={copy}
          responses={allResponses}
          isLoading={isLoadingDashboard}
          authReady={authReady}
          isAuthorized={isAuthorized}
          signedInEmail={authUser?.email ?? null}
          authError={authError}
          dashboardError={dashboardError}
          onGoogleSignIn={() => void handleGoogleSignIn()}
          onGoogleSignOut={() => void handleGoogleSignOut()}
          onRefresh={() => void loadAllResponses()}
          onLock={handleLockDashboard}
          onStartNewParticipant={handleStartNewParticipant}
          onClearAll={handleClearAll}
        />
      )}

      {/* Discreet Researcher Access Trigger for iframe-wrapped URLs like *.ai.studio */}
      {!isResearcher && (
        <footer className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-end px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setPinError('');
              setPinInput('');
              setShowPinModal(true);
            }}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-[#8CA293]/55 transition-colors hover:text-[#CBE0E1]"
          >
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>{copy.researcherAccessLabel}</span>
          </button>
        </footer>
      )}

      {/* Researcher Passcode Modal */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="researcher-pin-title"
        >
          <form
            onSubmit={handleUnlockSubmit}
            className="w-full max-w-sm rounded-2xl border border-[#327D87]/60 bg-[#0E2C36] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="researcher-pin-title"
                  className="font-[family-name:var(--font-display)] text-lg font-bold text-[#CBE0E1]"
                >
                  {copy.researcherPinTitle}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#95B3B5]">
                  {copy.researcherPinSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                aria-label={copy.researcherPinCancel}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#95B3B5] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={copy.researcherPinPlaceholder}
              className="mt-4 min-h-[48px] w-full rounded-xl border border-[#327D87]/60 bg-[#0C141B] px-4 font-mono text-base text-[#CBE0E1] placeholder:font-sans placeholder:text-[#8CA293]/60 focus:border-[#CBE0E1] focus:outline-none"
            />

            {pinError && (
              <p className="mt-2.5 text-xs font-medium text-red-400">{pinError}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="min-h-[44px] rounded-xl border border-[#327D87]/40 px-4 text-xs font-semibold text-[#95B3B5] hover:text-white"
              >
                {copy.researcherPinCancel}
              </button>
              <button
                type="submit"
                disabled={isVerifyingPin || !pinInput.trim()}
                className="min-h-[44px] rounded-xl bg-[#CBE0E1] px-5 text-xs font-bold text-[#0C141B] transition-colors hover:bg-white disabled:opacity-50"
              >
                {copy.researcherPinSubmit}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
