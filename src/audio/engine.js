import { noteById } from '../music/notes';

const RELEASE = 0.6; // seconds of fade-out when a key is released
const RETRIGGER_RELEASE = 0.08; // fade of a still-ringing voice when its key is struck again
const MAX_VOICES = 48;
// Samples are 24 kHz mono; decoding at their native rate halves memory compared
// with decoding at the output rate. Playback resamples transparently.
const DECODE_RATE = 24000;

const AudioContextClass = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : undefined;
const OfflineContextClass = typeof window !== 'undefined' ? window.OfflineAudioContext || window.webkitOfflineAudioContext : undefined;

/**
 * Plays the piano samples with the Web Audio API: one decoded buffer per note,
 * a fresh source node per strike (so repeated notes overlap naturally), a gain
 * envelope for releases and a sustain pedal.
 */
class AudioEngine {
  ctx = null;
  output = null;
  decoder = null;
  volume = 1;
  buffers = new Map();
  loading = new Map();
  voices = []; // every sounding voice, oldest first
  held = new Set(); // notes whose key is down
  sustained = new Set(); // notes released while the pedal was down
  pending = new Map(); // note id → strike waiting for its buffer
  sustain = false;

  get supported() {
    return Boolean(AudioContextClass);
  }

  context() {
    if (!this.ctx) {
      this.ctx = new AudioContextClass({ latencyHint: 'interactive' });
      // Gentle limiter so big chords don't clip.
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 8;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.2;
      this.output = this.ctx.createGain();
      this.output.gain.value = this.volume;
      this.output.connect(limiter);
      limiter.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Must be called from a user gesture at least once (autoplay policies). */
  unlock() {
    if (!this.supported) return;
    const ctx = this.context();
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
  }

  decode(data) {
    if (!this.decoder) {
      try {
        this.decoder = new OfflineContextClass(1, 1, DECODE_RATE);
      } catch {
        this.decoder = this.context();
      }
    }
    // Callback form: older Safari versions don't return a promise.
    return new Promise((resolve, reject) => this.decoder.decodeAudioData(data, resolve, reject));
  }

  /** Fetches and decodes a note's sample; resolves with its AudioBuffer. */
  load(id) {
    if (!this.supported) return Promise.resolve(null);
    if (this.buffers.has(id)) return Promise.resolve(this.buffers.get(id));
    if (this.loading.has(id)) return this.loading.get(id);
    const note = noteById.get(id);
    if (!note?.src) return Promise.resolve(null);

    const promise = fetch(note.src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => this.decode(data))
      .then((buffer) => {
        this.buffers.set(id, buffer);
        return buffer;
      })
      .catch((err) => {
        console.error(`Could not load the sound for ${id}:`, err);
        return null;
      })
      .finally(() => this.loading.delete(id));
    this.loading.set(id, promise);
    return promise;
  }

  /** Loads several notes, a few at a time. */
  async preload(ids, concurrency = 4) {
    const queue = ids.filter((id) => !this.buffers.has(id));
    const worker = async () => {
      while (queue.length) await this.load(queue.shift());
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }

  noteOn(id) {
    if (!this.supported) return;
    this.unlock();
    this.held.add(id);
    this.sustained.delete(id);

    const buffer = this.buffers.get(id);
    if (buffer) {
      this.start(id, buffer);
      return;
    }
    // First strike of a note that isn't decoded yet: play it as soon as it is,
    // even if the key was already released (a quick tap must still sound).
    const token = {};
    this.pending.set(id, token);
    this.load(id).then((loaded) => {
      if (this.pending.get(id) !== token) return;
      this.pending.delete(id);
      if (!loaded) return;
      this.start(id, loaded);
      if (this.held.has(id)) return;
      if (this.sustain) this.sustained.add(id);
      else this.releaseNote(id, RELEASE);
    });
  }

  noteOff(id) {
    this.held.delete(id);
    if (this.pending.has(id)) return; // released by the pending strike when it starts
    if (this.sustain) {
      this.sustained.add(id);
      return;
    }
    this.releaseNote(id, RELEASE);
  }

  setSustain(on) {
    if (this.sustain === on) return;
    this.sustain = on;
    if (on) return;
    for (const id of this.sustained) {
      if (!this.held.has(id)) this.releaseNote(id, RELEASE);
    }
    this.sustained.clear();
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.output) this.output.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
  }

  /** Silences everything (used when the page loses focus). */
  allNotesOff() {
    this.held.clear();
    this.sustained.clear();
    this.pending.clear();
    for (const voice of this.voices) this.releaseVoice(voice, RETRIGGER_RELEASE);
  }

  start(id, buffer) {
    const ctx = this.context();
    for (const voice of this.voices) {
      if (voice.id === id) this.releaseVoice(voice, RETRIGGER_RELEASE);
    }
    const ringing = this.voices.filter((v) => !v.released);
    if (ringing.length >= MAX_VOICES) this.releaseVoice(ringing[0], RETRIGGER_RELEASE);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    source.connect(gain);
    gain.connect(this.output);

    const voice = { id, source, gain, released: false };
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      this.voices = this.voices.filter((v) => v !== voice);
    };
    this.voices.push(voice);
    source.start();
  }

  releaseNote(id, time) {
    for (const voice of this.voices) {
      if (voice.id === id) this.releaseVoice(voice, time);
    }
  }

  releaseVoice(voice, time) {
    const now = this.ctx.currentTime;
    const end = now + time;
    if (voice.released && voice.end <= end) return;
    voice.released = true;
    voice.end = end;
    const gain = voice.gain.gain;
    if (gain.cancelAndHoldAtTime) {
      gain.cancelAndHoldAtTime(now);
    } else {
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
    }
    gain.setTargetAtTime(0, now, time / 5);
    try {
      voice.source.stop(end);
    } catch {
      // Some browsers refuse a second stop(); the first one still ends the voice.
    }
  }
}

export const audioEngine = new AudioEngine();
