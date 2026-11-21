let audioCtx: AudioContext | null = null;
let ambientMasterGain: GainNode | null = null;
let ambientNodes: AudioNode[] = [];
let sparkleTimerId: number | null = null;
let ambientRunning = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => undefined);
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.08
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

const SPARKLE_NOTES = [587.33, 659.25, 698.46, 880.0, 1046.5, 1174.66, 1318.51];

function triggerAmbientSparkle(): void {
  const ctx = getAudioContext();
  if (!ctx || !ambientMasterGain || !ambientRunning) return;

  const note = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)];
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(note, now);

  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(0.08, now + 0.06);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

  osc.connect(env);
  env.connect(ambientMasterGain);

  osc.start(now);
  osc.stop(now + 2.2);
}

export function startAmbientMagicSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ambientRunning && ambientMasterGain) {
    const now = ctx.currentTime;
    ambientMasterGain.gain.cancelScheduledValues(now);
    ambientMasterGain.gain.setTargetAtTime(0.14, now, 0.4);
    return;
  }

  ambientRunning = true;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.setTargetAtTime(0.14, ctx.currentTime, 0.8);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(780, ctx.currentTime);
  filter.Q.setValueAtTime(0.7, ctx.currentTime);

  // Slow LFO for gentle underwater/mist shimmer on the filter cutoff
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.11, ctx.currentTime);
  lfoGain.gain.setValueAtTime(240, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  filter.connect(master);
  master.connect(ctx.destination);

  // Ethereal D-minor 9th ambient pad (D3, A3, E4, F4)
  const padSpecs: Array<{ freq: number; detune: number; type: OscillatorType; gain: number }> = [
    { freq: 146.83, detune: -4, type: 'sine', gain: 0.16 },
    { freq: 146.83, detune: 4, type: 'triangle', gain: 0.06 },
    { freq: 220.0, detune: -3, type: 'sine', gain: 0.1 },
    { freq: 329.63, detune: 5, type: 'sine', gain: 0.07 },
    { freq: 349.23, detune: -5, type: 'sine', gain: 0.06 },
  ];

  const createdNodes: AudioNode[] = [master, filter, lfo, lfoGain];

  for (const spec of padSpecs) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freq, ctx.currentTime);
    osc.detune.setValueAtTime(spec.detune, ctx.currentTime);
    oscGain.gain.setValueAtTime(spec.gain, ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(filter);
    osc.start();

    createdNodes.push(osc, oscGain);
  }

  ambientMasterGain = master;
  ambientNodes = createdNodes;

  if (sparkleTimerId !== null) {
    window.clearInterval(sparkleTimerId);
  }
  triggerAmbientSparkle();
  sparkleTimerId = window.setInterval(() => {
    if (ambientRunning) {
      triggerAmbientSparkle();
    }
  }, 2400);
}

export function stopAmbientMagicSound(): void {
  ambientRunning = false;
  if (sparkleTimerId !== null) {
    window.clearInterval(sparkleTimerId);
    sparkleTimerId = null;
  }

  const ctx = audioCtx;
  if (ctx && ambientMasterGain) {
    const now = ctx.currentTime;
    ambientMasterGain.gain.cancelScheduledValues(now);
    ambientMasterGain.gain.setTargetAtTime(0.0001, now, 0.25);

    const nodesToStop = [...ambientNodes];
    ambientNodes = [];
    ambientMasterGain = null;

    window.setTimeout(() => {
      for (const node of nodesToStop) {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          try {
            (node as OscillatorNode).stop();
          } catch {
            // Already stopped
          }
        }
        try {
          node.disconnect();
        } catch {
          // Already disconnected
        }
      }
    }, 450);
  }
}

export function syncAmbientMagicSound(enabled: boolean): void {
  if (enabled) {
    startAmbientMagicSound();
  } else {
    stopAmbientMagicSound();
  }
}

export function playStartSpellSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0, 0.24, 'triangle', 0.06);
  playTone(659.25, 0.07, 0.24, 'triangle', 0.06);
  playTone(783.99, 0.14, 0.32, 'sine', 0.07);
  playTone(1046.5, 0.22, 0.42, 'sine', 0.05);
}

export function playChoiceSparkSound(choice: 'Yes' | 'No', enabled: boolean): void {
  if (!enabled) return;
  if (choice === 'Yes') {
    playTone(493.88, 0, 0.16, 'triangle', 0.06);
    playTone(739.99, 0.04, 0.2, 'sine', 0.045);
  } else {
    playTone(587.33, 0, 0.16, 'triangle', 0.06);
    playTone(880, 0.04, 0.2, 'sine', 0.045);
  }
}

export function playVictorySound(enabled: boolean): void {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, idx) => {
    playTone(freq, idx * 0.09, 0.38, idx % 2 === 0 ? 'triangle' : 'sine', 0.06);
  });
}
