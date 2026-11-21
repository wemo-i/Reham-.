import {
  collection,
  doc,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { EXPERIMENT_WORDS, WORD_CATEGORIES } from '../data/words';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AnswerChoice,
  CategorySummary,
  TrialResponse,
  WordCategory,
  WordSummary,
} from '../types';

const COLLECTION_NAME = 'trial_responses';
const PENDING_STORAGE_KEY = 'lexical_decision_pending_v1';
const confirmedSavedIds = new Set<string>();
const inFlightWrites = new Map<string, Promise<void>>();

function sanitizeId(value: string, fallbackPrefix: string): string {
  const cleaned = String(value || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}-${Date.now()}`;
}

function buildFirestorePayload(record: TrialResponse) {
  const safeId = sanitizeId(record.id, 'resp');
  const safeSessionId = sanitizeId(record.sessionId, 'sess');
  const safeParticipantCode = (String(record.participantCode || '').trim() || 'Anon').slice(0, 64);
  const safeWord = (String(record.word || '').trim() || 'unknown').slice(0, 64);
  const safeTimestamp = (String(record.timestamp || '').trim() || new Date().toISOString()).slice(
    0,
    64
  );

  const payload: {
    id: string;
    sessionId: string;
    participantCode: string;
    word: string;
    category: WordCategory;
    answer: AnswerChoice;
    timestamp: string;
    createdAt: ReturnType<typeof serverTimestamp>;
    reactionTimeMs?: number;
  } = {
    id: safeId,
    sessionId: safeSessionId,
    participantCode: safeParticipantCode,
    word: safeWord,
    category: record.category,
    answer: record.answer,
    timestamp: safeTimestamp,
    createdAt: serverTimestamp(),
  };

  if (
    typeof record.reactionTimeMs === 'number' &&
    Number.isFinite(record.reactionTimeMs) &&
    record.reactionTimeMs >= 0 &&
    record.reactionTimeMs <= 3600000
  ) {
    payload.reactionTimeMs = Math.round(record.reactionTimeMs);
  }

  return { safeId, payload };
}

function mapDocToTrialResponse(data: Record<string, unknown>, docId: string): TrialResponse | null {
  const word = typeof data.word === 'string' ? data.word : '';
  const category = data.category as WordCategory;
  const answer = data.answer as AnswerChoice;
  if (!word || !WORD_CATEGORIES.includes(category) || (answer !== 'Yes' && answer !== 'No')) {
    return null;
  }

  return {
    id: typeof data.id === 'string' ? data.id : docId,
    sessionId: typeof data.sessionId === 'string' ? data.sessionId : 'unknown',
    participantCode: typeof data.participantCode === 'string' ? data.participantCode : 'Anon',
    word,
    category,
    answer,
    timestamp:
      typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
    ...(typeof data.reactionTimeMs === 'number' ? { reactionTimeMs: data.reactionTimeMs } : {}),
  };
}

function readPendingResponses(): TrialResponse[] {
  try {
    const raw = window.localStorage.getItem(PENDING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePendingResponses(records: TrialResponse[]): void {
  try {
    window.localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

function mergeResponses(primary: TrialResponse[], secondary: TrialResponse[]): TrialResponse[] {
  const seen = new Set<string>();
  const merged: TrialResponse[] = [];

  for (const item of [...primary, ...secondary]) {
    const key = `${item.sessionId}::${item.word}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  return merged.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function subscribeToAllResponses(
  onData: (records: TrialResponse[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const responsesRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    responsesRef,
    (snapshot) => {
      const records: TrialResponse[] = [];
      snapshot.forEach((docSnap) => {
        const mapped = mapDocToTrialResponse(docSnap.data() as Record<string, unknown>, docSnap.id);
        if (mapped) {
          records.push(mapped);
        }
      });
      records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrappedError) {
        if (onError) {
          onError(wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError)));
        }
      }
    }
  );
}

export async function fetchAllResponses(): Promise<TrialResponse[]> {
  try {
    const snapshot = await getDocsFromServer(collection(db, COLLECTION_NAME));
    const records: TrialResponse[] = [];
    snapshot.forEach((docSnap) => {
      const mapped = mapDocToTrialResponse(docSnap.data() as Record<string, unknown>, docSnap.id);
      if (mapped) {
        records.push(mapped);
      }
    });
    return records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

function writeSingleRecord(record: TrialResponse): Promise<boolean> {
  const { safeId, payload } = buildFirestorePayload(record);
  if (confirmedSavedIds.has(safeId)) {
    return Promise.resolve(true);
  }

  const existingPromise = inFlightWrites.get(safeId);
  if (existingPromise) {
    return existingPromise.then(() => confirmedSavedIds.has(safeId));
  }

  const writePromise = setDoc(doc(db, COLLECTION_NAME, safeId), payload)
    .then(() => {
      confirmedSavedIds.add(safeId);
      const remaining = readPendingResponses().filter(
        (item) => sanitizeId(item.id, 'resp') !== safeId
      );
      writePendingResponses(remaining);
    })
    .catch((error) => {
      try {
        handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${safeId}`);
      } catch {
        // Pending queue retains unsent trial for final flush / retry
      }
    })
    .finally(() => {
      inFlightWrites.delete(safeId);
    });

  inFlightWrites.set(safeId, writePromise);
  return writePromise.then(() => confirmedSavedIds.has(safeId));
}

export function logTrialResponseBackground(record: TrialResponse): void {
  const { safeId } = buildFirestorePayload(record);
  if (confirmedSavedIds.has(safeId)) return;

  const current = readPendingResponses();
  const merged = mergeResponses(current, [record]);
  writePendingResponses(merged);

  void writeSingleRecord(record);
}

export async function flushSessionResponses(records: TrialResponse[]): Promise<void> {
  if (inFlightWrites.size > 0) {
    await Promise.allSettled(Array.from(inFlightWrites.values()));
  }

  const pendingBefore = readPendingResponses();
  const merged = mergeResponses(pendingBefore, records).filter((item) => {
    const safeId = sanitizeId(item.id, 'resp');
    return !confirmedSavedIds.has(safeId);
  });

  if (merged.length === 0) {
    writePendingResponses([]);
    return;
  }

  writePendingResponses(merged);

  const stillUnsent: TrialResponse[] = [];

  await Promise.all(
    merged.map(async (record) => {
      const ok = await writeSingleRecord(record);
      if (!ok) {
        stillUnsent.push(record);
      }
    })
  );

  writePendingResponses(stillUnsent);
}

export async function clearAllResponses(): Promise<void> {
  writePendingResponses([]);
  confirmedSavedIds.clear();
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const docs = snapshot.docs;
    const chunkSize = 450;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const docSnap of chunk) {
        batch.delete(docSnap.ref);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
  }
}

function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportResponsesToCsv(responses: TrialResponse[]): void {
  const header = ['Participant Code', 'Word', 'Category', 'Answer', 'Timestamp'].join(',');
  const rows = responses.map((r) =>
    [
      escapeCsvCell(r.participantCode),
      escapeCsvCell(r.word),
      escapeCsvCell(r.category),
      escapeCsvCell(r.answer),
      escapeCsvCell(r.timestamp),
    ].join(',')
  );

  const csvString = `\uFEFF${[header, ...rows].join('\r\n')}`;
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `lexical-decision-data-${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function computeCategorySummaries(responses: TrialResponse[]): CategorySummary[] {
  return WORD_CATEGORIES.map((category: WordCategory) => {
    const items = responses.filter((r) => r.category === category);
    const total = items.length;
    const yesCount = items.filter((r) => r.answer === 'Yes').length;
    const noCount = total - yesCount;
    const yesPercentage = total > 0 ? (yesCount / total) * 100 : 0;

    return {
      category,
      total,
      yesCount,
      noCount,
      yesPercentage,
    };
  });
}

export function computeWordSummaries(responses: TrialResponse[]): WordSummary[] {
  return EXPERIMENT_WORDS.map((item) => {
    const matches = responses.filter((r) => r.word === item.word);
    const total = matches.length;
    const yesCount = matches.filter((r) => r.answer === 'Yes').length;
    const noCount = total - yesCount;
    const yesPercentage = total > 0 ? (yesCount / total) * 100 : 0;

    return {
      word: item.word,
      category: item.category,
      total,
      yesCount,
      noCount,
      yesPercentage,
    };
  });
}
