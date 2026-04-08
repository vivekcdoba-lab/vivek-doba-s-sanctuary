import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  emoji?: string;
}

const COLORS = [
  'hsl(36 87% 38%)',   // gold
  'hsl(27 100% 60%)',  // saffron
  'hsl(51 100% 50%)',  // bright gold
  'hsl(340 82% 52%)',  // lotus pink
  'hsl(122 46% 33%)',  // dharma green
  'hsl(231 47% 47%)',  // indigo
];

interface CelebrationProps {
  trigger: boolean;
  emoji?: string;
  type?: 'confetti' | 'stars' | 'fire';
  onComplete?: () => void;
}

const Celebration = ({ trigger, emoji, type = 'confetti', onComplete }: CelebrationProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const emojis = type === 'fire' ? ['🔥', '⚡', '💥'] : type === 'stars' ? ['⭐', '🌟', '✨', '💫'] : ['🎉', '🎊', '✨', '🏆'];
    const chosen = emoji ? [emoji] : emojis;

    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.6,
      size: 14 + Math.random() * 12,
      emoji: chosen[Math.floor(Math.random() * chosen.length)],
    }));

    setParticles(newParticles);
    const t = setTimeout(() => { setParticles([]); onComplete?.(); }, 2800);
    return () => clearTimeout(t);
  }, [trigger, emoji, type, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

export default Celebration;
