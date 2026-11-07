import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function makeOscillator() {
  return {
    type: 'sine',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as null | (() => void),
  };
}
class AudioContextMock {
  static instances: AudioContextMock[] = [];
  state = 'suspended';
  currentTime = 10;
  destination = {};
  nodes: ReturnType<typeof makeOscillator>[] = [];
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  constructor() {
    AudioContextMock.instances.push(this);
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  createOscillator() {
    const node = makeOscillator();
    this.nodes.push(node);
    return node;
  }
}
beforeEach(() => {
  vi.resetModules();
  AudioContextMock.instances = [];
  vi.stubGlobal('AudioContext', AudioContextMock);
});
afterEach(() => vi.unstubAllGlobals());
describe('answer feedback audio', () => {
  it('is lazy and silent when muted, plays distinct right/wrong melodies and reuses one context', async () => {
    const audio = await import('../src/lib/feedbackAudio');
    await audio.playFeedbackAudio(true, false);
    expect(AudioContextMock.instances).toHaveLength(0);
    await audio.playFeedbackAudio(true, true);
    const context = AudioContextMock.instances[0];
    expect(context.resume).toHaveBeenCalledOnce();
    expect(context.nodes).toHaveLength(4);
    const right = context.nodes.map(
      (node) => node.frequency.setValueAtTime.mock.calls[0][0],
    );
    expect(right[3]).toBeGreaterThan(right[0]);
    await audio.playFeedbackAudio(false, true);
    expect(AudioContextMock.instances).toHaveLength(1);
    expect(context.nodes).toHaveLength(6);
    const wrong = context.nodes
      .slice(4)
      .map((node) => node.frequency.setValueAtTime.mock.calls[0][0]);
    expect(wrong[1]).toBeLessThan(wrong[0]);
    context.nodes
      .slice(0, 4)
      .forEach((node) => expect(node.stop).toHaveBeenCalledTimes(2));
    audio.stopFeedbackAudio();
    context.nodes
      .slice(4)
      .forEach((node) => expect(node.stop).toHaveBeenCalledTimes(2));
  });
  it('does not queue stale sounds while resuming and cancels pending sounds on mute', async () => {
    const audio = await import('../src/lib/feedbackAudio');
    await audio.playFeedbackAudio(true, true);
    const context = AudioContextMock.instances[0];
    context.state = 'suspended';
    let resume!: () => void;
    context.resume.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resume = () => {
            context.state = 'running';
            resolve();
          };
        }),
    );
    const pending = audio.playFeedbackAudio(false, true);
    audio.stopFeedbackAudio();
    resume();
    await pending;
    expect(context.nodes).toHaveLength(4);
  });
  it('handles blocked or unsupported audio without rejecting the answer', async () => {
    const audio = await import('../src/lib/feedbackAudio');
    vi.stubGlobal('AudioContext', undefined);
    await expect(audio.playFeedbackAudio(true, true)).resolves.toBeUndefined();
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );
    await expect(audio.playFeedbackAudio(false, true)).resolves.toBeUndefined();
  });
});
