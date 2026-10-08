// Web Audio API Synthesizer for Satisfying Ball Physics Videos — 10 Instruments & 7 Scales

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.destStream = null;
    this.delayNode = null;
    this.delayGain = null;

    this.enabled = true;
    this.volume = 0.7;
    this.instrument = 'marimba';
    this.scaleType = 'pentatonic_major';
    this.progressionMode = 'ascending'; // 'ascending', 'bouncing_ladder', 'harmonic', 'random'
    this.noteIndex = 0;
    this.direction = 1;

    // Musical scales definitions in Hz
    this.scales = {
      pentatonic_major: [
        130.81, 146.83, 164.81, 196.00, 220.00,
        261.63, 293.66, 329.63, 392.00, 440.00,
        523.25, 587.33, 659.25, 783.99, 880.00,
        1046.50, 1174.66, 1318.51, 1567.98, 1760.00
      ],
      pentatonic_minor: [
        110.00, 130.81, 146.83, 164.81, 196.00,
        220.00, 261.63, 293.66, 329.63, 392.00,
        440.00, 523.25, 587.33, 659.25, 783.99,
        880.00, 1046.50, 1174.66, 1318.51, 1567.98
      ],
      hirajoshi: [
        110.00, 123.47, 130.81, 164.81, 174.61,
        220.00, 246.94, 261.63, 329.63, 349.23,
        440.00, 493.88, 523.25, 659.25, 698.46,
        880.00, 987.77, 1046.50, 1318.51, 1396.91
      ],
      dreamy_lydian: [
        130.81, 146.83, 164.81, 185.00, 196.00, 220.00, 246.94,
        261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88,
        523.25, 587.33, 659.25, 739.99, 783.99, 880.00, 987.77
      ],
      cyber_bass: [
        55.00, 65.41, 73.42, 82.41, 98.00, 110.00,
        130.81, 146.83, 164.81, 196.00, 220.00, 261.63,
        329.63, 392.00, 440.00, 523.25
      ],
      dorian_vibes: [
        146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63,
        293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25,
        587.33, 659.25, 698.46, 783.99, 880.00, 987.77
      ],
      blues_scale: [
        130.81, 155.56, 174.61, 185.00, 196.00, 233.08,
        261.63, 311.13, 349.23, 369.99, 392.00, 466.16,
        523.25, 622.25, 698.46, 739.99, 783.99, 932.33
      ]
    };
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.destStream = this.ctx.createMediaStreamDestination();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Subtle Stereo Delay for pleasant ambiance
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.18, this.ctx.currentTime);
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.delayNode);
    this.delayGain.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.destStream);
  }

  ensureAudio() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getNextFrequency() {
    const scale = this.scales[this.scaleType] || this.scales.pentatonic_major;
    const len = scale.length;
    let freq = scale[0];

    if (this.progressionMode === 'ascending') {
      this.noteIndex = (this.noteIndex + 1) % len;
      freq = scale[this.noteIndex];
    } else if (this.progressionMode === 'bouncing_ladder') {
      this.noteIndex += this.direction;
      if (this.noteIndex >= len - 1) {
        this.noteIndex = len - 1;
        this.direction = -1;
      } else if (this.noteIndex <= 0) {
        this.noteIndex = 0;
        this.direction = 1;
      }
      freq = scale[this.noteIndex];
    } else if (this.progressionMode === 'random') {
      this.noteIndex = Math.floor(Math.random() * len);
      freq = scale[this.noteIndex];
    } else if (this.progressionMode === 'harmonic') {
      this.noteIndex = (this.noteIndex + 2) % len;
      freq = scale[this.noteIndex];
    }

    return freq;
  }

  playBounce(intensity = 1.0, isDestroy = false) {
    if (!this.enabled) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freq = this.getNextFrequency();

    switch (this.instrument) {
      case 'marimba':
        this._playMarimba(freq, t, intensity, isDestroy);
        break;
      case 'kalimba':
        this._playKalimba(freq, t, intensity, isDestroy);
        break;
      case 'synth':
        this._playDreamSynth(freq, t, intensity, isDestroy);
        break;
      case 'chime':
        this._playChime(freq, t, intensity, isDestroy);
        break;
      case 'vibraphone':
        this._playVibraphone(freq, t, intensity, isDestroy);
        break;
      case 'musicbox':
        this._playMusicBox(freq, t, intensity, isDestroy);
        break;
      case 'waterdrop':
        this._playWaterDrop(freq, t, intensity, isDestroy);
        break;
      case 'pluck':
        this._playPluck(freq, t, intensity, isDestroy);
        break;
      case 'arcade':
        this._playArcade(freq, t, intensity, isDestroy);
        break;
      case 'basspluck':
        this._playBassPluck(freq, t, intensity, isDestroy);
        break;
      default:
        this._playMarimba(freq, t, intensity, isDestroy);
        break;
    }
  }

  // 1. Marimba (Satisfying wooden attack)
  _playMarimba(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 3.0, t);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.15, t);
    osc2.connect(gain2);
    gain2.connect(gain);

    const dur = isDestroy ? 0.35 : 0.22;
    const vol = Math.min(1.0, 0.45 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  // 2. Kalimba / Sanza (Delicate resonant metallic tine)
  _playKalimba(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const oscHar = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    oscHar.type = 'sine';
    oscHar.frequency.setValueAtTime(freq * 2.76, t); // inharmonic metal tine mode

    const harGain = this.ctx.createGain();
    harGain.gain.setValueAtTime(0.2, t);
    harGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    oscHar.connect(harGain);
    harGain.connect(gain);

    const dur = isDestroy ? 0.5 : 0.32;
    const vol = Math.min(1.0, 0.42 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    oscHar.start(t);
    osc.stop(t + dur + 0.05);
    oscHar.stop(t + dur + 0.05);
  }

  // 3. Dream Synth (Warm atmospheric pluck)
  _playDreamSynth(freq, t, intensity, isDestroy) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.006, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.4);
    filter.Q.setValueAtTime(4.0, t);

    const dur = isDestroy ? 0.45 : 0.28;
    const vol = Math.min(1.0, 0.32 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  // 4. Glass Chime
  _playChime(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, t);
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 3.01, t);

    const dur = isDestroy ? 0.6 : 0.38;
    const vol = Math.min(1.0, 0.3 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + dur + 0.05);
    oscHarmonic.stop(t + dur + 0.05);
  }

  // 5. Vibraphone (Warm metallic chime with tremolo LFO)
  _playVibraphone(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Tremolo LFO
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6.0, t);
    lfoGain.gain.setValueAtTime(0.12, t);
    lfo.connect(lfoGain);

    const dur = isDestroy ? 0.65 : 0.42;
    const vol = Math.min(1.0, 0.38 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  // 6. Music Box (High crystal celestial music box)
  _playMusicBox(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2.0, t);

    const dur = isDestroy ? 0.7 : 0.45;
    const vol = Math.min(1.0, 0.35 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // 7. Water Drop / Bubble Pop (Ultra satisfying liquid drop)
  _playWaterDrop(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps rapidly upwards: classic water pop effect!
    const baseF = freq * 0.75;
    osc.frequency.setValueAtTime(baseF, t);
    osc.frequency.exponentialRampToValueAtTime(baseF * 2.6, t + 0.07);

    const dur = 0.18;
    const vol = Math.min(1.0, 0.45 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  // 8. Acoustic Pluck (Clean string harp)
  _playPluck(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    const dur = isDestroy ? 0.35 : 0.22;
    const vol = Math.min(1.0, 0.4 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // 9. Retro Arcade 8-bit
  _playArcade(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * (isDestroy ? 1.5 : 0.8), t + 0.08);

    const dur = 0.12;
    const vol = Math.min(1.0, 0.22 * intensity);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // 10. Cyber Bass Pluck
  _playBassPluck(freq, t, intensity, isDestroy) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.5, t); // one octave down

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.0, t);
    filter.frequency.exponentialRampToValueAtTime(70, t + 0.25);

    const dur = 0.32;
    const vol = Math.min(1.0, 0.5 * intensity);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  playVictory() {
    if (!this.enabled) return;
    this.ensureAudio();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0.001, t + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.35, t + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.8);
    });
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? vol : 0, this.ctx.currentTime);
    }
  }

  setMute(mute) {
    this.enabled = !mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  resetNoteIndex() {
    this.noteIndex = 0;
    this.direction = 1;
  }

  getAudioStreamTrack() {
    if (!this.destStream) {
      this.init();
    }
    const tracks = this.destStream.stream.getAudioTracks();
    return tracks.length > 0 ? tracks[0] : null;
  }
}
