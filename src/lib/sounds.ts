// Jail-themed sound effects using Web Audio API
// No external audio files needed - generates synthetic prison sounds

interface SoundOptions {
  volume?: number;
  enabled?: boolean;
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

// Export all sounds
export const jailSounds = {
  cellDoor: playCellDoorClang,
  chainBreak: playChainBreak,
  whistle: playGuardWhistle,
  tap: playQuickTap,
  complete: playTaskComplete,
};

export default jailSounds;
