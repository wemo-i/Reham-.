export type WordCategory =
  | 'Real English Words'
  | 'Harry Potter Coined Words'
  | 'Plausible Nonwords';

export type AnswerChoice = 'Yes' | 'No';

export type Locale = 'en' | 'ar';

export type AppPhase = 'intro' | 'trial' | 'thankyou' | 'dashboard';

export interface WordItem {
  word: string;
  category: WordCategory;
}

export interface TrialResponse {
  id: string;
  sessionId: string;
  participantCode: string;
  word: string;
  category: WordCategory;
  answer: AnswerChoice;
  timestamp: string;
  reactionTimeMs?: number;
}

export interface CategorySummary {
  category: WordCategory;
  total: number;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
}

export interface WordSummary {
  word: string;
  category: WordCategory;
  total: number;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
}
