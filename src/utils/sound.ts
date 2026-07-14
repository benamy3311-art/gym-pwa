// Tiny Web Audio chime for the rest-timer finish — no audio asset needed.
// iOS only allows audio once the AudioContext is unlocked from within a user
// gesture, so unlockAudio() is called when a rest starts (the set is tapped).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext
        || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    return ctx;
}

/** Unlock/resume audio. Must run inside a user gesture (e.g. tapping a set
 *  done) so the finish chime is allowed to play later, especially on iOS. */
export function unlockAudio(): void {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
}

/** Soft two-tone "ding" signalling the rest timer finished. */
export function playRestDoneChime(): void {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});

    const now = c.currentTime;
    // A5 then D6 — a short, pleasant rising bell rather than a harsh buzzer.
    const notes = [
        { freq: 880, at: 0, dur: 0.16 },
        { freq: 1174.66, at: 0.14, dur: 0.24 },
    ];
    for (const n of notes) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = n.freq;
        // Fast attack, smooth exponential release so it reads as a bell, not a click.
        gain.gain.setValueAtTime(0.0001, now + n.at);
        gain.gain.exponentialRampToValueAtTime(0.3, now + n.at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur);
        osc.connect(gain).connect(c.destination);
        osc.start(now + n.at);
        osc.stop(now + n.at + n.dur + 0.02);
    }
}
