import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

interface TrialResponseRecord {
  id: string;
  sessionId: string;
  participantCode: string;
  word: string;
  category: string;
  answer: 'Yes' | 'No';
  timestamp: string;
  reactionTimeMs?: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'responses.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readResponses(): Promise<TrialResponseRecord[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeResponses(records: TrialResponseRecord[]): Promise<void> {
  await ensureDataFile();
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(records, null, 2), 'utf8');
  await fs.rename(tempFile, DATA_FILE);
}

function enqueueMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function escapeCsvCell(value: string): string {
  const stringVal = String(value ?? '');
  if (/[",\n\r]/.test(stringVal)) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

function isValidRecord(item: unknown): item is TrialResponseRecord {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.sessionId === 'string' &&
    typeof r.participantCode === 'string' &&
    typeof r.word === 'string' &&
    typeof r.category === 'string' &&
    (r.answer === 'Yes' || r.answer === 'No') &&
    typeof r.timestamp === 'string'
  );
}

const RESEARCHER_KEY = process.env.RESEARCHER_KEY || 'lexlab2026';
const RESEARCHER_PIN = process.env.RESEARCHER_PIN || '2026';

function isAuthorizedResearcher(req: express.Request): boolean {
  const headerKey = req.header('x-researcher-key');
  const queryKey = typeof req.query.key === 'string' ? req.query.key : undefined;
  const provided = headerKey || queryKey;
  return provided === RESEARCHER_KEY || provided === RESEARCHER_PIN;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/responses', async (req, res) => {
    if (!isAuthorizedResearcher(req)) {
      res.status(403).json({ error: 'Researcher access required' });
      return;
    }
    try {
      const responses = await readResponses();
      res.json({ responses });
    } catch (error) {
      console.error('Failed to read responses:', error);
      res.status(500).json({ error: 'Failed to load responses' });
    }
  });

  app.post('/api/responses', async (req, res) => {
    try {
      const incomingRaw = Array.isArray(req.body?.responses)
        ? req.body.responses
        : [req.body];

      const validItems = incomingRaw.filter(isValidRecord);
      if (validItems.length === 0) {
        res.status(400).json({ error: 'Invalid response payload' });
        return;
      }

      const updatedCount = await enqueueMutation(async () => {
        const existing = await readResponses();
        const existingKeys = new Set(existing.map((item) => `${item.sessionId}::${item.word}`));

        let added = 0;
        for (const item of validItems) {
          const key = `${item.sessionId}::${item.word}`;
          if (!existingKeys.has(key)) {
            existing.push({
              id: item.id,
              sessionId: item.sessionId,
              participantCode: item.participantCode.trim().slice(0, 64) || 'Anonymous',
              word: item.word,
              category: item.category,
              answer: item.answer,
              timestamp: item.timestamp,
              reactionTimeMs: typeof item.reactionTimeMs === 'number' ? item.reactionTimeMs : undefined,
            });
            existingKeys.add(key);
            added += 1;
          }
        }

        if (added > 0) {
          await writeResponses(existing);
        }
        return existing.length;
      });

      res.status(201).json({ ok: true, total: updatedCount });
    } catch (error) {
      console.error('Failed to save responses:', error);
      res.status(500).json({ error: 'Failed to save responses' });
    }
  });

  app.delete('/api/responses', async (req, res) => {
    if (!isAuthorizedResearcher(req)) {
      res.status(403).json({ error: 'Researcher access required' });
      return;
    }
    try {
      await enqueueMutation(async () => {
        await writeResponses([]);
      });
      res.json({ ok: true });
    } catch (error) {
      console.error('Failed to clear responses:', error);
      res.status(500).json({ error: 'Failed to clear responses' });
    }
  });

  app.get('/api/export.csv', async (req, res) => {
    if (!isAuthorizedResearcher(req)) {
      res.status(403).json({ error: 'Researcher access required' });
      return;
    }
    try {
      const responses = await readResponses();
      const header = ['Participant Code', 'Word', 'Category', 'Answer', 'Timestamp'].join(',');
      const rows = responses.map((row) =>
        [
          escapeCsvCell(row.participantCode),
          escapeCsvCell(row.word),
          escapeCsvCell(row.category),
          escapeCsvCell(row.answer),
          escapeCsvCell(row.timestamp),
        ].join(',')
      );
      const csvContent = `\uFEFF${[header, ...rows].join('\r\n')}`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="lexical-decision-data.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  });

  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lexical Decision server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
