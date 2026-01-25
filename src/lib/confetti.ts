import confetti from "canvas-confetti";

/**
 * Gold/amber themed confetti burst for major wins.
 * Matches the Redeemed Strength brand palette.
 */
export function fireGoldConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}) {
  const {
    particleCount = 80,
    spread = 70,
    origin = { x: 0.5, y: 0.5 },
  } = options || {};

  // Gold/amber color palette matching the brand
  const colors = [
    "#D4AF37", // Primary gold
    "#C5A028", // Darker gold
    "#F4D03F", // Bright gold
    "#B8860B", // Dark goldenrod
    "#FFD700", // Pure gold
    "#CD853F", // Peru/copper accent
  ];

  confetti({
    particleCount,
    spread,
    origin,
    colors,
    disableForReducedMotion: true,
    gravity: 1.2,
    scalar: 0.9,
    drift: 0,
    ticks: 150,
  });
}

/**
 * Victory celebration - dual burst from left and right.
 * Use for completing full weeks or major achievements.
 */
export function fireVictoryConfetti() {
  const colors = [
    "#D4AF37",
    "#C5A028", 
    "#F4D03F",
    "#B8860B",
    "#FFD700",
  ];

  const end = Date.now() + 500;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Small burst for task completions.
 * More subtle than victory confetti.
 */
export function fireTaskConfetti(element?: HTMLElement) {
  const rect = element?.getBoundingClientRect();
  const origin = rect
    ? {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      }
    : { x: 0.5, y: 0.5 };

  fireGoldConfetti({
    particleCount: 30,
    spread: 50,
    origin,
  });
}

/**
 * Streak milestone celebration.
 * Bigger burst for 7, 14, 21, 30+ day streaks.
 */
export function fireStreakConfetti(streakDays: number) {
  const intensity = Math.min(Math.floor(streakDays / 7), 4);
  const particleCount = 50 + intensity * 25;

  fireGoldConfetti({
    particleCount,
    spread: 80 + intensity * 10,
  });
}

export default {
  gold: fireGoldConfetti,
  victory: fireVictoryConfetti,
  task: fireTaskConfetti,
  streak: fireStreakConfetti,
};
