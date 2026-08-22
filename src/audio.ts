import { clamp, rand } from './utils';

type Mode = 'explore' | 'combat' | 'boss';

type ToneOpts = { type?: OscillatorType; gain?: number; duration?: number; detune?: number; attack?: number; release?: number };

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer = 0;
  private nextStep = 0;
  private step = 0;
  private mode: Mode = 'explore';
  private targetMode: Mode = 'explore';
  private muted = false;
  private listener = { x: 0, z: 0, rightX: 1, rightZ: 0 };

  async unlock() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  private init() {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    this.ctx = new AudioContextCtor();
    const ctx = this.ctx;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 16; compressor.ratio.value = 5; compressor.attack.value = .003; compressor.release.value = .2;
    this.master = ctx.createGain(); this.master.gain.value = .78;
    this.musicBus = ctx.createGain(); this.musicBus.gain.value = .24;
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = .58;
    this.ambienceBus = ctx.createGain(); this.ambienceBus.gain.value = .2;
    this.musicBus.connect(this.master); this.sfxBus.connect(this.master); this.ambienceBus.connect(this.master);
    this.master.connect(compressor).connect(ctx.destination);
    this.reverb = ctx.createConvolver(); this.reverb.buffer = this.makeImpulse(1.7, 2.7); this.reverb.connect(this.master);
    this.noise = this.makeNoise(2);
    this.makeWind();
    this.nextStep = ctx.currentTime + .05;
  }

  private makeNoise(seconds: number) {
    if (!this.ctx) throw new Error('Audio not initialized');
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return b;
  }

  private makeImpulse(seconds: number, decay: number) {
    if (!this.ctx) throw new Error('Audio not initialized');
    const b = this.ctx.createBuffer(2, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay);
    }
    return b;
  }

  private makeWind() {
    if (!this.ctx || !this.noise || !this.ambienceBus) return;
    const src = this.ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 520; filter.Q.value = .35;
    const gain = this.ctx.createGain(); gain.gain.value = .065;
    src.connect(filter).connect(gain).connect(this.ambienceBus); src.start();
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = .08;
    const lfoGain = this.ctx.createGain(); lfoGain.gain.value = 210;
    lfo.connect(lfoGain).connect(filter.frequency); lfo.start();
  }

  setListener(x: number, z: number, rightX: number, rightZ: number) { this.listener = { x, z, rightX, rightZ }; }
  setMode(mode: Mode) { this.targetMode = mode; }
  setMuted(v: boolean) { this.muted = v; if (this.master && this.ctx) this.master.gain.setTargetAtTime(v ? 0 : .78, this.ctx.currentTime, .04); }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }
  isMuted() { return this.muted; }

  private panGain(x?: number, z?: number) {
    if (x == null || z == null) return { gain: 1, pan: 0 };
    const dx = x - this.listener.x, dz = z - this.listener.z;
    const d = Math.hypot(dx, dz);
    const nx = d ? dx / d : 0, nz = d ? dz / d : 0;
    return { gain: clamp(1 / (1 + d * d * .012), .08, 1), pan: clamp(nx * this.listener.rightX + nz * this.listener.rightZ, -1, 1) };
  }

  private route(node: AudioNode, gain = 1, pan = 0, reverb = 0) {
    if (!this.ctx || !this.sfxBus) return;
    const g = this.ctx.createGain(); g.gain.value = gain;
    const p = this.ctx.createStereoPanner(); p.pan.value = pan;
    node.connect(g).connect(p).connect(this.sfxBus);
    if (reverb && this.reverb) { const send = this.ctx.createGain(); send.gain.value = reverb; node.connect(send).connect(this.reverb); }
  }

  private tone(freq: number, opts: ToneOpts = {}, when?: number, destination?: AudioNode) {
    if (!this.ctx) return;
    const t = when ?? this.ctx.currentTime;
    const dur = opts.duration ?? .18, attack = opts.attack ?? .004, release = opts.release ?? .12;
    const o = this.ctx.createOscillator(); o.type = opts.type ?? 'sine'; o.frequency.value = freq; o.detune.value = opts.detune ?? 0;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(opts.gain ?? .1, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur + release);
    o.connect(g); if (destination) g.connect(destination); else this.route(g);
    o.start(t); o.stop(t + dur + release + .02);
  }

  private noiseBurst(duration: number, filterFreq: number, gain: number, type: BiquadFilterType = 'lowpass', x?: number, z?: number) {
    if (!this.ctx || !this.noise) return;
    const pg = this.panGain(x, z); const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter(); filter.type = type; filter.frequency.value = filterFreq;
    const env = this.ctx.createGain(); env.gain.setValueAtTime(gain * pg.gain, t); env.gain.exponentialRampToValueAtTime(.0001, t + duration);
    src.connect(filter).connect(env); this.route(env, 1, pg.pan, .08); src.start(t); src.stop(t + duration + .02);
  }

  sfx(name: string, x?: number, z?: number, variant = 0) {
    if (!this.ctx || this.muted) return;
    const pg = this.panGain(x, z); const t = this.ctx.currentTime;
    const at = (f: number, g: number, d: number, type: OscillatorType = 'sine', delay = 0) => {
      if (!this.ctx || !this.sfxBus) return;
      const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f * (1 + variant * .03);
      const env = this.ctx.createGain(); env.gain.setValueAtTime(.0001, t + delay); env.gain.exponentialRampToValueAtTime(g * pg.gain, t + delay + .005); env.gain.exponentialRampToValueAtTime(.0001, t + delay + d);
      const p = this.ctx.createStereoPanner(); p.pan.value = pg.pan;
      o.connect(env).connect(p).connect(this.sfxBus); o.start(t + delay); o.stop(t + delay + d + .03);
    };
    switch (name) {
      case 'swing': this.noiseBurst(.16, 1800 + variant * 180, .16, 'bandpass', x, z); at(170, .04, .11, 'triangle'); break;
      case 'heavy': this.noiseBurst(.28, 950, .22, 'lowpass', x, z); at(92, .11, .24, 'sawtooth'); break;
      case 'impact': this.noiseBurst(.12, 1250, .2, 'bandpass', x, z); at(70, .16, .13, 'sine'); break;
      case 'hurt': at(155, .1, .18, 'sawtooth'); this.noiseBurst(.1, 1000, .1, 'lowpass', x, z); break;
      case 'dodge': this.noiseBurst(.22, 1400, .12, 'bandpass', x, z); break;
      case 'step': this.noiseBurst(.07, 500 + variant * 100, .055, 'lowpass', x, z); break;
      case 'coin': at(950, .045, .11, 'sine'); at(1420, .035, .15, 'sine', .055); break;
      case 'pickup': at(620, .06, .12, 'triangle'); at(930, .05, .15, 'triangle', .06); at(1240, .04, .2, 'sine', .12); break;
      case 'level': [523, 659, 784, 1047].forEach((f, i) => at(f, .06, .45, 'sine', i * .09)); break;
      case 'potion': at(420, .05, .22, 'sine'); at(650, .04, .25, 'sine', .07); break;
      case 'shockwave': at(58, .2, .52, 'sine'); this.noiseBurst(.4, 550, .18, 'lowpass', x, z); break;
      case 'nova': at(220, .08, .7, 'sine'); at(440, .05, .7, 'triangle', .04); at(880, .04, .5, 'sine', .08); this.noiseBurst(.45, 1800, .13, 'bandpass', x, z); break;
      case 'boss': at(48, .18, .85, 'sawtooth'); at(72, .1, .85, 'square'); this.noiseBurst(.7, 380, .18, 'lowpass', x, z); break;
      case 'ui': at(560, .025, .08, 'sine'); break;
    }
  }

  update(dt: number) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.timer += dt;
    if (this.mode !== this.targetMode && this.step % 16 === 0) this.mode = this.targetMode;
    const bpm = this.mode === 'boss' ? 126 : this.mode === 'combat' ? 102 : 76;
    const stepDur = 60 / bpm / 4;
    const horizon = this.ctx.currentTime + .16;
    while (this.nextStep < horizon) {
      this.scheduleMusic(this.nextStep, this.step);
      this.nextStep += stepDur; this.step = (this.step + 1) % 64;
    }
  }

  private scheduleMusic(t: number, step: number) {
    if (!this.ctx || !this.musicBus || this.muted) return;
    const roots = this.mode === 'boss' ? [55, 49, 58.27, 52] : [110, 87.31, 130.81, 98];
    const bar = Math.floor(step / 16) % 4; const root = roots[bar];
    if (step % 16 === 0) {
      const chord = [root, root * 1.1892, root * 1.4983];
      chord.forEach((f, i) => this.pad(f, t, this.mode === 'explore' ? 2.4 : 1.4, .016 + i * .002));
    }
    if (this.mode === 'explore') {
      if ([2, 7, 11, 14].includes(step % 16) && Math.random() > .42) this.pluck(root * [2, 2.378, 2.67, 3, 3.56][Math.floor(rand(0, 5))], t, .026);
    } else {
      if (step % 2 === 0) this.bass(root / 2, t, this.mode === 'boss' ? .055 : .04);
      if (step % 4 === 0) this.kick(t, this.mode === 'boss' ? .075 : .055);
      if (step % 2 === 1) this.hat(t, this.mode === 'boss' ? .018 : .012);
      if (this.mode === 'boss' && step % 4 === 2) this.bass(root * 1.5, t, .035);
    }
  }

  private pad(freq: number, t: number, duration: number, gain: number) {
    if (!this.ctx || !this.musicBus) return;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = this.mode === 'boss' ? 820 : 520; f.Q.value = .7;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(gain, t + .22); g.gain.exponentialRampToValueAtTime(.0001, t + duration);
    o.connect(f).connect(g).connect(this.musicBus); if (this.reverb) { const send = this.ctx.createGain(); send.gain.value = .12; g.connect(send).connect(this.reverb); }
    o.start(t); o.stop(t + duration + .05);
  }
  private pluck(freq: number, t: number, gain: number) { this.musicTone(freq, t, .16, gain, 'triangle', 1800); }
  private bass(freq: number, t: number, gain: number) { this.musicTone(freq, t, .1, gain, 'square', 480); }
  private musicTone(freq: number, t: number, duration: number, gain: number, type: OscillatorType, cutoff: number) {
    if (!this.ctx || !this.musicBus) return;
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + duration);
    o.connect(f).connect(g).connect(this.musicBus); o.start(t); o.stop(t + duration + .02);
  }
  private kick(t: number, gain: number) {
    if (!this.ctx || !this.musicBus) return;
    const o = this.ctx.createOscillator(); o.type = 'sine'; const g = this.ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(g).connect(this.musicBus); o.start(t); o.stop(t + .18);
  }
  private hat(t: number, gain: number) {
    if (!this.ctx || !this.musicBus || !this.noise) return;
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6200;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + .045);
    s.connect(f).connect(g).connect(this.musicBus); s.start(t); s.stop(t + .05);
  }
}
