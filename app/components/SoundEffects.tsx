'use client';

import { useEffect, useRef, useState } from 'react';

export function SoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const crtHumRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (isInitialized || audioContextRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    audioContextRef.current = new AudioContext();
    const ctx = audioContextRef.current;

    // Create CRT Hum (constant low frequency hum)
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(120, ctx.currentTime); // 120Hz hum

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime); // Very quiet

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();

    crtHumRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsInitialized(true);
  };

  useEffect(() => {
    // Start audio on first user interaction
    const handleFirstInteraction = () => {
      initAudioContext();
    };

    // Listen for any user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);

      if (crtHumRef.current) {
        crtHumRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Realistic Cherry MX Blue mechanical keyboard synthesis
  const playTypingSound = (key?: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    const isSpace = key === ' ';

    // Phase 1: CLICK (key press / actuation) - Cherry MX characteristic click
    // Real MX Blue actuates at 2.2mm with distinct click mechanism
    const clickFreq = isSpace ? 180 : 280 + Math.random() * 60; // Lower, sharper
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square'; // Sharp, digital click
    clickOsc.frequency.setValueAtTime(clickFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(clickFreq * 0.5, now + 0.003);
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);
    clickOsc.connect(clickGain).connect(masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.008);

    // Phase 2: CLACK (bottom-out) - Key hitting the base
    const clackFreq = isSpace ? 120 : 180 + Math.random() * 40;
    const clackOsc = ctx.createOscillator();
    const clackGain = ctx.createGain();
    clackOsc.type = 'triangle';
    clackOsc.frequency.setValueAtTime(clackFreq, now + 0.012);
    clackOsc.frequency.exponentialRampToValueAtTime(clackFreq * 0.7, now + 0.035);
    clackGain.gain.setValueAtTime(0.12, now + 0.012);
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.050);
    clackOsc.connect(clackGain).connect(masterGain);
    clackOsc.start(now + 0.012);
    clackOsc.stop(now + 0.050);

    // Phase 3: Spring resonance - Metal spring sound
    const springOsc = ctx.createOscillator();
    const springGain = ctx.createGain();
    springOsc.type = 'sine';
    springOsc.frequency.setValueAtTime(800 + Math.random() * 400, now + 0.005);
    springOsc.frequency.exponentialRampToValueAtTime(400, now + 0.025);
    springGain.gain.setValueAtTime(0.03, now + 0.005);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.030);
    springOsc.connect(springGain).connect(masterGain);
    springOsc.start(now + 0.005);
    springOsc.stop(now + 0.030);

    // Phase 4: Plastic housing resonance
    const housingOsc = ctx.createOscillator();
    const housingGain = ctx.createGain();
    housingOsc.type = 'triangle';
    housingOsc.frequency.setValueAtTime(450 + Math.random() * 150, now + 0.008);
    housingGain.gain.setValueAtTime(0.04, now + 0.008);
    housingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.040);
    housingOsc.connect(housingGain).connect(masterGain);
    housingOsc.start(now + 0.008);
    housingOsc.stop(now + 0.040);

    // Phase 5: Mechanical noise (realistic texture)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2500, now);
    noiseFilter.Q.setValueAtTime(1.5, now);
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
    noise.start(now);

    // Random velocity (typing strength)
    const velocity = 0.65 + Math.random() * 0.35;
    masterGain.gain.setValueAtTime(velocity, now);
  };

  // Realistic mouse click sound - mechanical microswitch
  const playClickSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    // Phase 1: Initial contact - sharp transient (microswitch actuation)
    const contactOsc = ctx.createOscillator();
    const contactGain = ctx.createGain();
    contactOsc.type = 'square';
    contactOsc.frequency.setValueAtTime(350 + Math.random() * 100, now);
    contactOsc.frequency.exponentialRampToValueAtTime(200, now + 0.004);
    contactGain.gain.setValueAtTime(0.18, now);
    contactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
    contactOsc.connect(contactGain).connect(masterGain);
    contactOsc.start(now);
    contactOsc.stop(now + 0.006);

    // Phase 2: Button depression - plastic/housing resonance
    const buttonOsc = ctx.createOscillator();
    const buttonGain = ctx.createGain();
    buttonOsc.type = 'triangle';
    buttonOsc.frequency.setValueAtTime(220 + Math.random() * 50, now + 0.003);
    buttonOsc.frequency.exponentialRampToValueAtTime(150, now + 0.020);
    buttonGain.gain.setValueAtTime(0.10, now + 0.003);
    buttonGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    buttonOsc.connect(buttonGain).connect(masterGain);
    buttonOsc.start(now + 0.003);
    buttonOsc.stop(now + 0.025);

    // Phase 3: Mechanical noise
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
    noise.start(now);

    // Random click strength
    const clickStrength = 0.7 + Math.random() * 0.3;
    masterGain.gain.setValueAtTime(clickStrength, now);
  };

  useEffect(() => {
    // Add typing sound to all text inputs and textareas
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Initialize audio context on first keypress if not already initialized
        if (!isInitialized) {
          initAudioContext();
        }
        // Pass the key to get different sounds for different keys
        playTypingSound(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isInitialized]);

  useEffect(() => {
    // Add click sound to buttons and interactive elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicked element is a button or has button-like attributes
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('neon-glow-btn') ||
        target.classList.contains('cyber-button')
      ) {
        // Initialize audio context on first click if not already initialized
        if (!isInitialized) {
          initAudioContext();
        }
        playClickSound();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isInitialized]);

  return null; // This component doesn't render anything
}
