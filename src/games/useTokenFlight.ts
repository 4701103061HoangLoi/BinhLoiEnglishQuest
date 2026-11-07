import { useLayoutEffect, useRef } from 'react';

export function useTokenFlight(selected: string[], questionId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ id: string; rect: DOMRect }[]>([]);
  const animations = useRef(new Map<string, Animation>());

  useLayoutEffect(
    () => () => {
      pending.current = [];
      animations.current.forEach((animation) => animation.cancel());
      animations.current.clear();
    },
    [questionId],
  );

  useLayoutEffect(() => {
    const moves = pending.current;
    pending.current = [];
    if (
      document.documentElement.dataset.reducedMotion === 'true' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )
      return;
    for (const { id, rect } of moves) {
      const zone = selected.includes(id) ? 'answer' : 'bank';
      const destination = Array.from(
        containerRef.current?.querySelectorAll<HTMLButtonElement>(
          '[data-token-id]',
        ) ?? [],
      ).find(
        (element) =>
          element.dataset.tokenId === id && element.dataset.tokenZone === zone,
      );
      if (!destination?.animate) continue;
      const target = destination.getBoundingClientRect();
      if (!target.width || !target.height || !rect.width || !rect.height)
        continue;
      const x = rect.left - target.left;
      const y = rect.top - target.top;
      animations.current.get(id)?.cancel();
      const animation = destination.animate(
        [
          {
            transform: `translate(${x}px, ${y}px) scale(${rect.width / target.width}, ${rect.height / target.height})`,
            transformOrigin: 'top left',
            zIndex: 3,
            pointerEvents: 'none',
          },
          {
            transform: `translate(${x * 0.3}px, ${y * 0.3 - 10}px) scale(1.02)`,
            transformOrigin: 'top left',
            zIndex: 3,
            pointerEvents: 'none',
            offset: 0.7,
          },
          {
            transform: 'translate(0px, 0px) scale(1)',
            transformOrigin: 'top left',
            zIndex: 3,
            pointerEvents: 'none',
          },
        ],
        { duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
      animations.current.set(id, animation);
      const finish = () => {
        if (animations.current.get(id) === animation)
          animations.current.delete(id);
      };
      void animation.finished.then(finish, finish);
    }
  }, [selected]);

  function capture(element: HTMLElement) {
    const id = element.dataset.tokenId;
    if (!id) return;
    const rect = element.getBoundingClientRect();
    animations.current.get(id)?.cancel();
    pending.current.push({ id, rect });
  }
  function move(element: HTMLElement, change: () => void) {
    capture(element);
    change();
  }
  function reset(change: () => void) {
    containerRef.current
      ?.querySelectorAll<HTMLElement>('[data-token-zone="answer"]')
      .forEach(capture);
    change();
  }
  return { containerRef, move, reset };
}
