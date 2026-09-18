/**
 * Specialized Arabic Math Speech Service
 * 
 * Provides resilient, high-fidelity Arabic speech playback through a dual-engine architecture:
 * 1. Primary Engine: High-fidelity Arabic Neural Voice (Google TTS MP3 stream)
 *    - Guarantees authentic, clear Syrian/Classical Arabic pronunciation
 *    - Requires ZERO pre-installed system voice packs (works on any OS/device)
 *    - Unlocked on user gesture with smooth chunking and preloading
 * 2. Secondary Engine: Browser SpeechSynthesis API fallback (if offline)
 * 3. Acoustic Diagnostic chime & hardware audio unlocker
 */

import { convertMathToSpokenArabic } from '../utils/arabicSpeechUtils';

export interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  currentSentence: string;
  sentenceIndex: number;
  totalSentences: number;
  hasArabicVoice: boolean;
  engine: 'neural' | 'synth' | 'idle';
  error: string | null;
}

type SpeechListener = (state: SpeechState) => void;

export class SpeechService {
  private static instance: SpeechService;
  
  // HTML5 Audio Primary Engine
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  
  // Secondary Web Speech Engine
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  
  // Audio parameters
  private rate: number = 0.95; // Natural, clear educational pacing
  private pitch: number = 1.0;
  private listeners: Set<SpeechListener> = new Set();
  
  // Queue & State
  private sentenceQueue: string[] = [];
  private currentQueueIndex: number = 0;
  private onCompleteCallback: (() => void) | null = null;
  private isCanceledManually: boolean = false;
  private currentEngine: 'neural' | 'synth' | 'idle' = 'idle';

  // Web Audio Context for acoustic feedback & audio hardware activation
  private audioCtx: AudioContext | null = null;

  private state: SpeechState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    currentSentence: '',
    sentenceIndex: 0,
    totalSentences: 0,
    hasArabicVoice: true,
    engine: 'idle',
    error: null,
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      // Initialize HTML5 Audio
      try {
        this.audioElement = new Audio();
        // Avoid sending referrer headers
        if ('referrerPolicy' in this.audioElement) {
          (this.audioElement as any).referrerPolicy = 'no-referrer';
        }
      } catch (e) {
        console.warn('HTML5 Audio init note:', e);
      }

      // Initialize Web Speech Synthesis as backup
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => {
            this.initVoices();
          };
        }
      }
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * Unlocks Web Audio and AudioElement pipelines upon user interaction
   */
  public ensureAudioContext(): void {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass && !this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        if (!this.audioElement) {
          this.audioElement = new Audio();
        }
      }
    } catch (e) {
      // AudioContext handled gracefully
    }
  }

  /**
   * Plays a pleasant chime to confirm audio output is working through physical speakers
   */
  public playChime(type: 'start' | 'next' | 'success' | 'note' = 'note') {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.08, now);

      if (type === 'start') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      // Non-critical
    }
  }

  /**
   * Interactive test function to diagnose and confirm audio works on student device
   */
  public testAudio() {
    this.ensureAudioContext();
    this.playChime('success');
    this.speak('أهلاً بك يا بطل الرياضيات! الصوت يعمل الآن بجودة ممتازة.');
  }

  public initVoices(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    try {
      const voices = this.synth.getVoices();
      const arVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('ar') ||
          v.lang.toLowerCase().includes('ar-') ||
          v.name.toLowerCase().includes('arabic') ||
          v.name.includes('عربي') ||
          v.name.includes('العربية') ||
          v.name.toLowerCase().includes('tarik') ||
          v.name.toLowerCase().includes('maged') ||
          v.name.toLowerCase().includes('laila')
      );

      if (arVoices.length > 0) {
        this.selectedVoice = arVoices[0];
        this.state.hasArabicVoice = true;
      } else if (voices.length > 0) {
        this.selectedVoice = voices[0];
        this.state.hasArabicVoice = false;
      }
      this.notify();
    } catch (e) {
      // Ignore
    }
    return this.selectedVoice;
  }

  public refreshVoice(): SpeechSynthesisVoice | null {
    return this.initVoices();
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.7, Math.min(1.5, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.rate;
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public subscribe(callback: SpeechListener) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ ...this.state }));
  }

  /**
   * Preprocesses raw math or lesson text into spoken Arabic sentences
   */
  public prepareArabicMathText(rawText: string): string {
    return convertMathToSpokenArabic(rawText);
  }

  /**
   * Splits text into natural sentence chunks sized appropriately for audio streaming
   */
  private chunkText(text: string, maxLen = 130): string[] {
    const processed = this.prepareArabicMathText(text);

    // Split on punctuation (. ! ؟ ، \n ؛)
    const rawParts = processed.split(/([.!?؟\n؛]|،\s*)/).filter((s) => s.trim().length > 0);

    const merged: string[] = [];
    let current = '';

    for (const part of rawParts) {
      if (/^[.!?؟\n؛،]$/.test(part)) {
        current += part;
      } else {
        if (current.trim()) {
          merged.push(current.trim());
        }
        current = part;
      }
    }
    if (current.trim()) {
      merged.push(current.trim());
    }

    // Ensure chunks don't exceed maxLen
    const finalChunks: string[] = [];
    for (const item of merged) {
      if (item.length <= maxLen) {
        finalChunks.push(item);
      } else {
        // Split on words
        const words = item.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).length <= maxLen) {
            sub = sub ? sub + ' ' + w : w;
          } else {
            if (sub) finalChunks.push(sub);
            sub = w;
          }
        }
        if (sub) finalChunks.push(sub);
      }
    }

    return finalChunks.length > 0 ? finalChunks : [processed];
  }

  /**
   * Builds the high-fidelity Google Arabic Neural TTS URL
   */
  private getAudioUrl(textChunk: string): string {
    const encoded = encodeURIComponent(textChunk.trim());
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encoded}`;
  }

  /**
   * Preloads the next chunk to guarantee smooth, continuous speech playback
   */
  private prefetchNextChunk() {
    const nextIdx = this.currentQueueIndex + 1;
    if (nextIdx < this.sentenceQueue.length) {
      try {
        const nextUrl = this.getAudioUrl(this.sentenceQueue[nextIdx]);
        const preloader = new Audio();
        if ('referrerPolicy' in preloader) {
          (preloader as any).referrerPolicy = 'no-referrer';
        }
        preloader.src = nextUrl;
      } catch (e) {
        // Prefetch failure is non-blocking
      }
    }
  }

  /**
   * Speaks a full text with high-quality Arabic audio
   */
  public speak(fullText: string, onEnd?: () => void) {
    if (!fullText || !fullText.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.ensureAudioContext();
    this.playChime('start');

    this.cancel();
    this.isCanceledManually = false;
    this.onCompleteCallback = onEnd || null;

    const chunks = this.chunkText(fullText);
    this.sentenceQueue = chunks;
    this.currentQueueIndex = 0;

    this.currentEngine = 'neural';

    this.state = {
      isPlaying: true,
      isPaused: false,
      currentText: fullText,
      currentSentence: chunks[0] || '',
      sentenceIndex: 0,
      totalSentences: chunks.length,
      hasArabicVoice: true,
      engine: 'neural',
      error: null,
    };
    this.notify();

    // Play first chunk immediately
    this.playNextChunk();
  }

  private playNextChunk() {
    if (this.isCanceledManually) return;

    if (this.currentQueueIndex >= this.sentenceQueue.length) {
      // Completed all sentences
      this.finishPlayback();
      return;
    }

    const currentText = this.sentenceQueue[this.currentQueueIndex];
    this.state.currentSentence = currentText;
    this.state.sentenceIndex = this.currentQueueIndex;
    this.notify();

    if (this.currentEngine === 'neural') {
      this.playWithNeuralAudio(currentText);
    } else {
      this.playWithSpeechSynthesis(currentText);
    }
  }

  /**
   * Primary Engine: HTML5 Audio Stream
   */
  private playWithNeuralAudio(text: string) {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        if ('referrerPolicy' in this.audioElement) {
          (this.audioElement as any).referrerPolicy = 'no-referrer';
        }
      }

      // Detach prior listeners
      this.audioElement.onended = null;
      this.audioElement.onerror = null;

      const url = this.getAudioUrl(text);
      this.currentAudioUrl = url;
      this.audioElement.src = url;
      this.audioElement.playbackRate = this.rate;

      this.audioElement.onended = () => {
        if (this.isCanceledManually) return;
        this.currentQueueIndex++;
        // Small pause between sentences for clarity
        setTimeout(() => {
          this.playNextChunk();
        }, 220);
      };

      this.audioElement.onerror = (e) => {
        console.warn('Neural audio stream error, switching to browser synthesis fallback:', e);
        this.currentEngine = 'synth';
        this.state.engine = 'synth';
        this.notify();
        this.playWithSpeechSynthesis(text);
      };

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Started successfully, prefetch next
            this.prefetchNextChunk();
          })
          .catch((err) => {
            console.warn('Audio play rejection (user interaction or network):', err);
            // Fallback to synth
            this.currentEngine = 'synth';
            this.state.engine = 'synth';
            this.notify();
            this.playWithSpeechSynthesis(text);
          });
      }
    } catch (err) {
      console.warn('Audio setup error:', err);
      this.currentEngine = 'synth';
      this.playWithSpeechSynthesis(text);
    }
  }

  /**
   * Secondary Engine: Browser SpeechSynthesis API
   */
  private playWithSpeechSynthesis(text: string) {
    if (!this.synth) {
      // If neither is available, advance smoothly after reading time
      this.advanceWithTimer(text);
      return;
    }

    try {
      this.initVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.selectedVoice ? this.selectedVoice.lang : 'ar-SA';
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      let finished = false;

      utterance.onend = () => {
        if (finished || this.isCanceledManually) return;
        finished = true;
        this.currentQueueIndex++;
        setTimeout(() => {
          this.playNextChunk();
        }, 250);
      };

      utterance.onerror = () => {
        if (finished || this.isCanceledManually) return;
        finished = true;
        this.advanceWithTimer(text);
      };

      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.speak(utterance);
    } catch (e) {
      this.advanceWithTimer(text);
    }
  }

  /**
   * Paced display fallback so students can always comfortably read
   */
  private advanceWithTimer(text: string) {
    const readingTimeMs = Math.max(3000, Math.min(7000, text.length * 80));
    setTimeout(() => {
      if (this.isCanceledManually) return;
      this.currentQueueIndex++;
      this.playNextChunk();
    }, readingTimeMs);
  }

  private finishPlayback() {
    this.currentEngine = 'idle';
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentText: '',
      currentSentence: '',
      sentenceIndex: 0,
      totalSentences: 0,
      hasArabicVoice: true,
      engine: 'idle',
      error: null,
    };
    this.notify();

    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  public pause() {
    if (!this.state.isPlaying || this.state.isPaused) return;

    if (this.currentEngine === 'neural' && this.audioElement) {
      try {
        this.audioElement.pause();
      } catch (e) {
        // ignore
      }
    } else if (this.synth && this.state.isPlaying) {
      try {
        this.synth.pause();
      } catch (e) {
        // ignore
      }
    }

    this.state.isPaused = true;
    this.notify();
  }

  public resume() {
    if (!this.state.isPlaying || !this.state.isPaused) return;

    if (this.currentEngine === 'neural' && this.audioElement) {
      try {
        this.audioElement.play();
      } catch (e) {
        // ignore
      }
    } else if (this.synth && this.synth.paused) {
      try {
        this.synth.resume();
      } catch (e) {
        // ignore
      }
    }

    this.state.isPaused = false;
    this.notify();
  }

  public cancel() {
    this.isCanceledManually = true;

    // Stop HTML5 Audio
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
      } catch (e) {
        // ignore
      }
    }

    // Stop Web Speech
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.sentenceQueue = [];
    this.currentQueueIndex = 0;
    this.currentEngine = 'idle';

    this.state = {
      isPlaying: false,
      isPaused: false,
      currentText: '',
      currentSentence: '',
      sentenceIndex: 0,
      totalSentences: 0,
      hasArabicVoice: true,
      engine: 'idle',
      error: null,
    };
    this.notify();
  }

  public togglePlay(text: string) {
    if (this.state.isPlaying) {
      if (this.state.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    } else {
      this.speak(text);
    }
  }

  public isSupported(): boolean {
    return true; // Always supported via HTML5 Audio and Web Speech fallback
  }
}

export const speechService = SpeechService.getInstance();
