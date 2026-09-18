/**
 * High-quality, safe Web Audio synthesizer for STEM Game
 * Uses single AudioContext with DynamicsCompressorNode, smooth ADSR envelopes,
 * and polyphony limiting to eliminate click, pops, and audio distortion.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private activeVoicesCount = 0;
  private readonly MAX_POLYPHONY = 6;

  private sfxEnabled = true;
  private bgmEnabled = true;
  private isMuted = false;

  public init() {
    this.initContext();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Dynamics compressor acts as a brickwall limiter to prevent clipping/distortion
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(40, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        // Master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

        // Sub gains
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

        // Routing
        this.sfxGain.connect(this.masterGain);
        this.bgmGain.connect(this.masterGain);
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setPreferences(sfx: boolean, bgm: boolean) {
    this.sfxEnabled = sfx;
    this.bgmEnabled = bgm;
    if (!bgm && this.isBgmPlaying) {
      this.stopBgm();
    } else if (bgm && !this.isBgmPlaying && !this.isMuted) {
      this.startBgm();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.7, now + 0.05);
    }
    if (muted && this.isBgmPlaying) {
      this.stopBgm();
    } else if (!muted && this.bgmEnabled && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  /** UI Hover subtle blip */
  public playHover() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.activeVoicesCount >= this.MAX_POLYPHONY) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.04);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      this.activeVoicesCount++;
      osc.start(now);
      osc.stop(now + 0.05);

      osc.onended = () => {
        this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
        gain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** UI Button Click */
  public playClick() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.activeVoicesCount >= this.MAX_POLYPHONY) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      this.activeVoicesCount++;
      osc.start(now);
      osc.stop(now + 0.07);

      osc.onended = () => {
        this.activeVoicesCount = Math.max(0, this.activeVoicesCount - 1);
        gain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** Countdown 3-2-1 Beep */
  public playCountdownBeep(isFinal = false) {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      const freq = isFinal ? 880 : 440;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.4 : 0.18));

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.42 : 0.2));

      osc.onended = () => {
        gain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** Target Challenge Score Reached (Success Chime) */
  public playScoreTargetReached() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);

        osc.onended = () => {
          gain.disconnect();
        };
      });
    } catch {
      // ignore
    }
  }

  /** Correct Answer Chime */
  public playCorrectAnswer() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const chords = [587.33, 739.99, 880.0, 1174.66]; // D, F#, A, D
      chords.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime + i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.42);

        osc.onended = () => {
          gain.disconnect();
        };
      });
    } catch {
      // ignore
    }
  }

  /** Wrong Answer Buzz */
  public playWrongAnswer() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);

      osc.onended = () => {
        gain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** Puzzle Piece Snap (Lock into place) */
  public playPieceSnap() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // High crisp mechanical snap + low wood resonance
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();

      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

      clickGain.gain.setValueAtTime(0, now);
      clickGain.gain.linearRampToValueAtTime(0.45, now + 0.008);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      clickOsc.connect(clickGain);
      clickGain.connect(this.sfxGain);

      clickOsc.start(now);
      clickOsc.stop(now + 0.13);

      clickOsc.onended = () => {
        clickGain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** Puzzle Piece Wrong Slot (Spring bounce) */
  public playPieceWrong() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);

      osc.onended = () => {
        gain.disconnect();
      };
    } catch {
      // ignore
    }
  }

  /** Victory Fanfare (All 9 pieces completed) */
  public playVictoryFanfare() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      // Grand celebratory major sequence: C4, G4, C5, E5, G5, C6
      const fanfareNotes = [
        { freq: 261.63, delay: 0.0, dur: 0.2 },
        { freq: 392.00, delay: 0.18, dur: 0.2 },
        { freq: 523.25, delay: 0.36, dur: 0.25 },
        { freq: 659.25, delay: 0.58, dur: 0.25 },
        { freq: 783.99, delay: 0.80, dur: 0.3 },
        { freq: 1046.50, delay: 1.05, dur: 0.8 }
      ];

      fanfareNotes.forEach(({ freq, delay, dur }) => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + dur + 0.05);

        osc.onended = () => {
          gain.disconnect();
        };
      });
    } catch {
      // ignore
    }
  }

  // --- BACKGROUND MUSIC SYNTH LOOP ---

  public startBgm() {
    if (!this.bgmEnabled || this.isMuted || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    let step = 0;
    // Pleasant ambient pentatonic scale notes (F, G, A, C, D)
    const melody = [349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(melody[step % melody.length], now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.6);

      osc.onended = () => {
        gain.disconnect();
      };

      step++;
      this.bgmTimer = window.setTimeout(playStep, 580);
    };

    playStep();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public startBGM() {
    this.startBgm();
  }

  public stopBGM() {
    this.stopBgm();
  }
}

export const audioManager = new AudioManager();
