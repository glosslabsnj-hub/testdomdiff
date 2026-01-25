// Jail-themed sound effects using Web Audio API
// No external audio files needed - generates synthetic prison sounds

interface SoundOptions {
  volume?: number;
  enabled?: boolean;
}

// Get stored sound preference, default to true
export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('redeemed-sounds-enabled');
  return stored === null ? true : stored === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('redeemed-sounds-enabled', String(enabled));
}

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

// Helper to create oscillator-based sounds
function createOscillator(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainValue: number = 0.3
): void {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  // Quick attack, decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Metallic clang sound (cell door)
export function playCellDoorClang(options: SoundOptions = {}): void {
  const { volume = 0.4, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  // Resume audio context if suspended (required for user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Low metallic thud
  createOscillator(80, 'triangle', 0.15, volume * 0.6);
  
  // High metallic ring
  setTimeout(() => {
    createOscillator(800, 'square', 0.08, volume * 0.2);
    createOscillator(1200, 'square', 0.06, volume * 0.15);
  }, 10);
  
  // Resonance
  setTimeout(() => {
    createOscillator(400, 'sine', 0.2, volume * 0.1);
  }, 50);
}

// Chain link sound (for streaks/milestones)
export function playChainBreak(options: SoundOptions = {}): void {
  const { volume = 0.5, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Multiple metallic clicks in sequence
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createOscillator(600 + (i * 200), 'square', 0.05, volume * 0.3);
      createOscillator(150 - (i * 30), 'triangle', 0.1, volume * 0.4);
    }, i * 50);
  }
  
  // Final release sound
  setTimeout(() => {
    createOscillator(200, 'sine', 0.3, volume * 0.2);
  }, 150);
}

// Whistle sound (for all complete)
export function playGuardWhistle(options: SoundOptions = {}): void {
  const { volume = 0.3, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  
  // Whistle frequency sweep
  oscillator.frequency.setValueAtTime(1800, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(2400, audioContext.currentTime + 0.15);
  oscillator.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.02);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime + 0.25);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);
}

// Quick tap sound (for sub-step completion)
export function playQuickTap(options: SoundOptions = {}): void {
  const { volume = 0.2, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  createOscillator(500, 'square', 0.03, volume);
  createOscillator(300, 'triangle', 0.05, volume * 0.5);
}

// Success sound (task completed)
export function playTaskComplete(options: SoundOptions = {}): void {
  const { volume = 0.35, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Ascending two-note success
  createOscillator(400, 'sine', 0.1, volume);
  setTimeout(() => {
    createOscillator(600, 'sine', 0.15, volume);
  }, 80);
  
  // Add the metallic character
  setTimeout(() => {
    createOscillator(800, 'triangle', 0.05, volume * 0.3);
  }, 100);
}

// Heavy door slam (for completing full weeks)
export function playHeavyDoorSlam(options: SoundOptions = {}): void {
  const { volume = 0.5, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Deep bass thud
  createOscillator(50, 'sine', 0.3, volume * 0.8);
  
  // Metallic impact layers
  setTimeout(() => {
    createOscillator(120, 'triangle', 0.2, volume * 0.6);
    createOscillator(180, 'square', 0.1, volume * 0.3);
  }, 10);
  
  // Reverberating ring
  setTimeout(() => {
    createOscillator(300, 'sine', 0.4, volume * 0.2);
    createOscillator(450, 'triangle', 0.3, volume * 0.1);
  }, 50);
  
  // Echo decay
  setTimeout(() => {
    createOscillator(100, 'sine', 0.5, volume * 0.1);
  }, 150);
}

// Key turn/unlock sound (for achievements)
export function playKeyUnlock(options: SoundOptions = {}): void {
  const { volume = 0.4, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Multiple clicks for key mechanism
  const clicks = [0, 40, 100, 150];
  clicks.forEach((delay, i) => {
    setTimeout(() => {
      // Varying click frequencies
      createOscillator(800 + i * 100, 'square', 0.03, volume * 0.4);
      createOscillator(400 - i * 50, 'triangle', 0.05, volume * 0.3);
    }, delay);
  });
  
  // Final unlock "ka-chunk"
  setTimeout(() => {
    createOscillator(200, 'triangle', 0.15, volume * 0.5);
    createOscillator(600, 'square', 0.08, volume * 0.3);
  }, 180);
}

// Yard bell (short industrial tone for weekly completions)
export function playYardBell(options: SoundOptions = {}): void {
  const { volume = 0.35, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  
  // Bell strike with quick decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
  
  // Harmonic overtones
  setTimeout(() => {
    createOscillator(1760, 'sine', 0.2, volume * 0.15);
    createOscillator(2640, 'sine', 0.15, volume * 0.08);
  }, 5);
}

// Stamp slam (for SERVED stamp animation)
export function playStampSlam(options: SoundOptions = {}): void {
  const { volume = 0.4, enabled = true } = options;
  if (!enabled || !audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Impact thud
  createOscillator(100, 'triangle', 0.1, volume * 0.7);
  
  // Paper/surface slap
  setTimeout(() => {
    createOscillator(800, 'square', 0.04, volume * 0.3);
    createOscillator(300, 'triangle', 0.08, volume * 0.4);
  }, 10);
}

// Haptic feedback helper (for mobile)
export function triggerHaptic(pattern: 'light' | 'medium' | 'heavy' | 'double' = 'medium'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  const patterns: Record<string, number | number[]> = {
    light: 30,
    medium: 50,
    heavy: 100,
    double: [50, 30, 80],
  };
  
  navigator.vibrate(patterns[pattern] || 50);
}

// Export all sounds
export const jailSounds = {
  cellDoor: playCellDoorClang,
  chainBreak: playChainBreak,
  whistle: playGuardWhistle,
  tap: playQuickTap,
  complete: playTaskComplete,
  doorSlam: playHeavyDoorSlam,
  keyUnlock: playKeyUnlock,
  yardBell: playYardBell,
  stampSlam: playStampSlam,
  haptic: triggerHaptic,
  getSoundEnabled,
  setSoundEnabled,
};

export default jailSounds;
