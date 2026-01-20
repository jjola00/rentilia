'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

type ConfettiOptions = Parameters<typeof confetti>[0];

const baseOptions: ConfettiOptions = {
  particleCount: 140,
  spread: 80,
  origin: { y: 0.6 },
};

export function useConfetti() {
  return useCallback((options: ConfettiOptions = {}) => {
    if (typeof window === 'undefined') return;
    const bursts: ConfettiOptions[] = [
      { particleCount: 70, spread: 70, startVelocity: 45 },
      { particleCount: 50, spread: 90, startVelocity: 35 },
      { particleCount: 90, spread: 110, startVelocity: 55 },
    ];

    bursts.forEach((burst, index) => {
      window.setTimeout(() => {
        confetti({ ...baseOptions, ...burst, ...options });
      }, index * 160);
    });
  }, []);
}
