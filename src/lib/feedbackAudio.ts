let context: AudioContext | undefined;
let generation = 0;
const active = new Set<OscillatorNode>();

export function stopFeedbackAudio() {
  generation++;
  for (const oscillator of active) {
    try {
      oscillator.stop();
    } catch {
      /* The note may already have ended. */
    }
  }
  active.clear();
}

export async function playFeedbackAudio(correct: boolean, enabled: boolean) {
  if (!enabled) return;
  stopFeedbackAudio();
  const ticket = generation;
  try {
    const Audio =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Audio) return;
    context ??= new Audio();
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running' || ticket !== generation) return;
    const start = context.currentTime;
    const notes = correct ? [523.25, 659.25, 783.99, 1046.5] : [392, 311.13];
    for (const [index, frequency] of notes.entries()) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = start + index * (correct ? 0.09 : 0.15);
      const duration = correct && index === notes.length - 1 ? 0.22 : 0.14;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.055, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        active.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      active.add(oscillator);
      oscillator.start(at);
      oscillator.stop(at + duration + 0.02);
    }
  } catch {
    // Audio support or autoplay restrictions must never interrupt an answer.
    stopFeedbackAudio();
  }
}
