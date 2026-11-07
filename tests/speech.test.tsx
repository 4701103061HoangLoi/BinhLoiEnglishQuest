import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QuestPage } from '../src/pages/QuestPage';
import { SpeechButton } from '../src/components/Common';
import { ProgressProvider } from '../src/contexts/ProgressContext';

class Utterance {
  lang = '';
  rate = 1;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  constructor(public text: string) {}
}
let utterances: Utterance[];
let current: Utterance | undefined;
beforeEach(() => {
  utterances = [];
  current = undefined;
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  vi.stubGlobal('speechSynthesis', {
    cancel: vi.fn(() => {
      const previous = current;
      current = undefined;
      previous?.onerror?.({ error: 'interrupted' });
    }),
    speak: vi.fn((utterance: Utterance) => {
      current = utterance;
      utterances.push(utterance);
    }),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('pronunciation button', () => {
  it('keeps the third quest word open when leaving a spoken second word', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [{ path: '/quest/:topicId', element: <QuestPage /> }],
      { initialEntries: ['/quest/my-new-school'] },
    );
    render(
      <ProgressProvider>
        <RouterProvider router={router} />
      </ProgressProvider>,
    );
    await user.click(
      screen.getByRole('button', { name: 'Bắt đầu hành trình' }),
    );
    await user.click(screen.getByRole('button', { name: 'Tiếp' }));
    await user.click(
      screen.getByRole('button', { name: 'Nghe phát âm notebook' }),
    );
    expect(utterances.at(-1)?.text).toBe('notebook');
    await user.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByRole('heading', { name: 'pencil' })).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Nghe phát âm pencil' }),
    );
    expect(utterances.at(-1)?.text).toBe('pencil');
    expect(screen.getByRole('heading', { name: 'pencil' })).toBeVisible();
    expect(
      screen.queryByText(/Không phát được âm thanh/),
    ).not.toBeInTheDocument();
    expect(document.querySelector('.quest-hunt-grid')).not.toBeInTheDocument();
    await user.click(document.querySelector('summary')!);
    expect(document.querySelector('.quest-hunt-grid')).not.toBeInTheDocument();
    await user.click(document.querySelector('summary')!);
    await user.click(screen.getByRole('button', { name: 'Vào nhiệm vụ' }));
    expect(screen.getByText('pencil', { selector: 'h2' })).not.toBeVisible();
    expect(document.querySelector('.quest-hunt-grid')).toBeVisible();
  });
  it('restarts reading on repeated clicks without treating cancellation as an error', async () => {
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <SpeechButton text="school bag" />
      </ProgressProvider>,
    );
    const button = screen.getByRole('button', {
      name: 'Nghe phát âm school bag',
    });
    await user.click(button);
    await user.click(button);
    await user.click(button);
    expect(utterances).toHaveLength(3);
    expect(utterances[2].text).toBe('school bag');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    act(() => utterances[0].onerror?.({ error: 'network' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    act(() => utterances[2].onerror?.({ error: 'canceled' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('keeps real errors visible, clears them on retry and ignores old-word callbacks', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ProgressProvider>
        <SpeechButton text="pencil" />
      </ProgressProvider>,
    );
    await user.click(
      screen.getByRole('button', { name: 'Nghe phát âm pencil' }),
    );
    act(() => utterances[0].onerror?.({ error: 'network' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Không phát được âm thanh',
    );
    await user.click(
      screen.getByRole('button', { name: 'Nghe phát âm pencil' }),
    );
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    const oldWord = utterances[1];
    rerender(
      <ProgressProvider>
        <SpeechButton text="ruler" />
      </ProgressProvider>,
    );
    act(() => oldWord.onerror?.({ error: 'network' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
