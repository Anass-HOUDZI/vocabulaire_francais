export function playSound(type: 'success' | 'perfect' | 'levelup' | 'badge') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    const now = ctx.currentTime
    
    if (type === 'success') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'perfect') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.setValueAtTime(600, now + 0.1)
      osc.frequency.setValueAtTime(800, now + 0.2)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    } else if (type === 'levelup') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.setValueAtTime(400, now + 0.1)
      osc.frequency.setValueAtTime(500, now + 0.2)
      osc.frequency.setValueAtTime(600, now + 0.3)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      osc.start(now)
      osc.stop(now + 0.6)
    } else if (type === 'badge') {
      osc.type = 'square'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(880, now + 0.15)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    }
  } catch (e) {
    // Ignore audio errors (e.g. autoplay policies)
  }
}
