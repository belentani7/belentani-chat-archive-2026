// Belentani: Era de Judas — lightweight audio feedback.
// Design reminder: audio confirms player actions; no external track is required.

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private started = false;

  private ensure() {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return false;
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.started = true;
    return true;
  }

  private tone(frequency: number, duration: number, type: OscillatorType, slide = 0) {
    if (!this.ensure() || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  start() {
    this.ensure();
    if (!this.started) return;
    this.tone(130, 0.16, "sawtooth", 70);
    window.setTimeout(() => this.tone(260, 0.16, "triangle", -20), 80);
  }

  attack() {
    this.tone(220, 0.12, "square", 420);
    window.setTimeout(() => this.tone(520, 0.11, "triangle", -80), 38);
  }

  collect() {
    this.tone(440, 0.12, "sine", 150);
    window.setTimeout(() => this.tone(660, 0.18, "sine", 220), 90);
  }

  hurt() {
    this.tone(95, 0.22, "sawtooth", -30);
  }

  boss() {
    this.tone(78, 0.42, "sawtooth", 220);
    window.setTimeout(() => this.tone(156, 0.34, "square", -30), 110);
  }

  victory() {
    [330, 440, 554, 660].forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.35, "sine", 70), index * 120);
    });
  }

  dispose() {
    if (this.ctx && this.ctx.state !== "closed") void this.ctx.close();
    this.ctx = null;
    this.master = null;
  }
}
