import React, { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  play: boolean;
  onPlay?: () => void;
}

export default function NotificationSound({ play, onPlay }: NotificationSoundProps) {
  useEffect(() => {
    if (play) {
      const playSound = async () => {
        try {
          const audioContext = new AudioContext();
          
          // Premier "ding"
          const oscillator1 = audioContext.createOscillator();
          const gainNode1 = audioContext.createGain();
          
          oscillator1.connect(gainNode1);
          gainNode1.connect(audioContext.destination);
          
          oscillator1.type = 'sine';
          oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime); // Fréquence plus aiguë
          gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
          gainNode1.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
          
          oscillator1.start(audioContext.currentTime);
          oscillator1.stop(audioContext.currentTime + 0.2);
          
          // Deuxième "ding" après un court délai
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.type = 'sine';
          oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2); // Fréquence légèrement plus aiguë
          gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
          gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.21);
          gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
          
          oscillator2.start(audioContext.currentTime + 0.2);
          oscillator2.stop(audioContext.currentTime + 0.4);
          
          // Nettoyer après la lecture
          setTimeout(() => {
            audioContext.close();
            onPlay?.();
          }, 500);
        } catch (error) {
          console.error('Erreur lors de la lecture du son:', error);
        }
      };

      playSound();
    }
  }, [play, onPlay]);

  return null;
}