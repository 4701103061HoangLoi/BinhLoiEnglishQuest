import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackgroundMusic } from '../src/components/BackgroundMusic';

let hidden = false;
beforeEach(() => {
  hidden = false;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe('optional background music', () => {
  it('starts only on click, pauses when hidden and never resumes after the user turns it off', async () => {
    const user = userEvent.setup();
    render(<BackgroundMusic />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Bật nhạc nền' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: 'Tắt nhạc nền' }),
    ).toHaveAttribute('aria-pressed', 'true');
    hidden = true;
    fireEvent(document, new Event('visibilitychange'));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
    hidden = false;
    await act(async () => fireEvent(document, new Event('visibilitychange')));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: 'Tắt nhạc nền' }));
    fireEvent(document, new Event('visibilitychange'));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });
  it('handles blocked playback and lets the user retry', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new Error('blocked'),
    );
    const user = userEvent.setup();
    render(<BackgroundMusic />);
    await user.click(screen.getByRole('button', { name: 'Bật nhạc nền' }));
    expect(screen.getByRole('status')).toHaveTextContent('Chưa phát được nhạc');
    await user.click(screen.getByRole('button', { name: 'Bật nhạc nền' }));
    expect(
      screen.getByRole('button', { name: 'Tắt nhạc nền' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('keeps music off if the user stops it while playback is still starting', async () => {
    let release!: () => void;
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<BackgroundMusic />);
    await user.click(screen.getByRole('button', { name: 'Bật nhạc nền' }));
    await user.click(screen.getByRole('button', { name: 'Tắt nhạc nền' }));
    await act(async () => release());
    expect(
      screen.getByRole('button', { name: 'Bật nhạc nền' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
