import { WordCategory, WordItem } from '../types';

export const WORD_CATEGORIES: WordCategory[] = [
  'Real English Words',
  'Harry Potter Coined Words',
  'Plausible Nonwords',
];

export interface CoinedWordMeaning {
  word: string;
  matchKey: string;
  meaningEn: string;
  meaningAr: string;
}

export const HARRY_POTTER_MEANINGS: CoinedWordMeaning[] = [
  {
    word: 'Muggle',
    matchKey: 'muggle',
    meaningEn: 'A person who has no magical abilities.',
    meaningAr: 'شخص لا يمتلك أي قدرات سحرية.',
  },
  {
    word: 'Remembrall',
    matchKey: 'remembrall',
    meaningEn: 'A magical ball that reminds a person when they have forgotten something.',
    meaningAr: 'كرة سحرية تُذكّر الشخص عندما ينسى شيئاً ما.',
  },
  {
    word: 'Mudblood',
    matchKey: 'mudblood',
    meaningEn: 'An offensive term for a witch or wizard born to non-magical parents.',
    meaningAr: 'مصطلح مُسيء يُطلق على الساحر أو الساحرة المولودين لوالدين غير سحريين.',
  },
  {
    word: 'Alohomora',
    matchKey: 'alohomora',
    meaningEn: 'A magic spell used to unlock doors and objects.',
    meaningAr: 'تعويذة سحرية تُستخدم لفتح الأبواب والأقفال المغلقة.',
  },
  {
    word: 'Pensieve',
    matchKey: 'pensieve',
    meaningEn: 'A magical object used to store and view memories.',
    meaningAr: 'أداة سحرية تُستخدم لحفظ الذكريات واستعراضها.',
  },
  {
    word: 'Thestral',
    matchKey: 'thestral',
    meaningEn: 'A magical, winged horse-like creature that only certain people can see.',
    meaningAr: 'مخلوق سحري مجنّح يشبه الحصان لا يستطيع رؤيته إلا أشخاص معينون.',
  },
  {
    word: 'Quaffle',
    matchKey: 'quaffle',
    meaningEn: 'A ball used in the magical game of Quidditch.',
    meaningAr: 'الكرة الرئيسية المستخدمة في لعبة الكويدتش السحرية.',
  },
  {
    word: 'Niffler',
    matchKey: 'niffler',
    meaningEn: 'A small magical creature attracted to shiny objects.',
    meaningAr: 'مخلوق سحري صغير ينجذب بشدة إلى الأشياء اللامعة.',
  },
];

export const EXPERIMENT_WORDS: WordItem[] = [
  // Real English Words (8)
  { word: 'magician', category: 'Real English Words' },
  { word: 'entertainment', category: 'Real English Words' },
  { word: 'eternally', category: 'Real English Words' },
  { word: 'misfortune', category: 'Real English Words' },
  { word: 'glimpse', category: 'Real English Words' },
  { word: 'wander', category: 'Real English Words' },
  { word: 'allomorph', category: 'Real English Words' },
  { word: 'velum', category: 'Real English Words' },

  // Harry Potter Coined Words (8)
  { word: 'Muggle', category: 'Harry Potter Coined Words' },
  { word: 'remembrall', category: 'Harry Potter Coined Words' },
  { word: 'mudblood', category: 'Harry Potter Coined Words' },
  { word: 'Alohomora', category: 'Harry Potter Coined Words' },
  { word: 'Pensieve', category: 'Harry Potter Coined Words' },
  { word: 'Thestral', category: 'Harry Potter Coined Words' },
  { word: 'Quaffle', category: 'Harry Potter Coined Words' },
  { word: 'Niffler', category: 'Harry Potter Coined Words' },

  // Plausible Nonwords (8)
  { word: 'fleep', category: 'Plausible Nonwords' },
  { word: 'voral', category: 'Plausible Nonwords' },
  { word: 'plock', category: 'Plausible Nonwords' },
  { word: 'thrade', category: 'Plausible Nonwords' },
  { word: 'flaim', category: 'Plausible Nonwords' },
  { word: 'snork', category: 'Plausible Nonwords' },
  { word: 'plint', category: 'Plausible Nonwords' },
  { word: 'trindle', category: 'Plausible Nonwords' },
];

export function shuffleWords(items: WordItem[]): WordItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateParticipantCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `P-${suffix}`;
}
