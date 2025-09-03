import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for psychological UI effects that enhance user engagement
 * and create addictive micro-interactions throughout the application
 */
export const usePsychologicalEffects = () => {
  
  // Dopamine-triggering success celebrations
  const celebrateSuccess = useCallback((message: string, intensity: 'low' | 'medium' | 'high' = 'medium') => {
    const celebrations = {
      low: {
        emoji: '✅',
        description: 'Task completed',
        duration: 1500
      },
      medium: {
        emoji: '🎉',
        description: 'Great job!',
        duration: 2000
      },
      high: {
        emoji: '🚀',
        description: 'Amazing work! You\'re on fire!',
        duration: 3000
      }
    };

    const celebration = celebrations[intensity];
    
    toast.success(`${celebration.emoji} ${message}`, {
      description: celebration.description,
      duration: celebration.duration,
      className: 'success-celebration'
    });

    // Trigger confetti effect for high intensity
    if (intensity === 'high') {
      triggerConfetti();
    }
  }, []);

  // Gentle nudging for user engagement
  const createEngagementNudge = useCallback((message: string, action?: () => void) => {
    toast(`✨ ${message}`, {
      description: 'Tap to continue your automation journey',
      duration: 4000,
      action: action ? {
        label: 'Let\'s Go!',
        onClick: action
      } : undefined,
      className: 'breathe magnetic-hover'
    });
  }, []);

  // Progress milestone celebrations
  const celebrateMilestone = useCallback((milestone: string, progress: number) => {
    const milestoneMessages = [
      'You\'re getting the hang of this! 🌟',
      'Automation master in the making! ⚡',
      'Your productivity is skyrocketing! 🚀',
      'The AI agents bow to your command! 👑'
    ];

    const randomMessage = milestoneMessages[Math.floor(Math.random() * milestoneMessages.length)];
    
    toast.success(`${milestone} Complete!`, {
      description: `${randomMessage} (${progress}% complete)`,
      duration: 3000,
      className: 'level-up'
    });
  }, []);

  // Smooth error handling with encouragement
  const handleErrorGracefully = useCallback((error: string, encouragement?: string) => {
    const defaultEncouragement = 'Don\'t worry, even the best automation masters face challenges!';
    
    toast.error('Oops! Something went wrong', {
      description: encouragement || defaultEncouragement,
      duration: 4000,
      action: {
        label: 'Try Again',
        onClick: () => window.location.reload()
      }
    });
  }, []);

  // Engagement streaks and gamification
  const trackEngagementStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    const streak = parseInt(localStorage.getItem('engagementStreak') || '0');

    if (lastVisit !== today) {
      const newStreak = lastVisit === new Date(Date.now() - 86400000).toDateString() ? streak + 1 : 1;
      
      localStorage.setItem('lastVisit', today);
      localStorage.setItem('engagementStreak', newStreak.toString());

      if (newStreak > 1) {
        toast.success(`🔥 ${newStreak} Day Streak!`, {
          description: 'Your consistency is paying off! Keep building those automation skills.',
          duration: 3000,
          className: 'attention-pulse'
        });
      } else {
        toast(`Welcome back! 👋`, {
          description: 'Ready to automate the world today?',
          duration: 2000,
          className: 'glow-on-hover'
        });
      }
    }
  }, []);

  // Confetti effect for major celebrations
  const triggerConfetti = useCallback(() => {
    // Create confetti particles
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationName = 'confetti-fall';
      confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
      confetti.style.animationTimingFunction = 'linear';
      confetti.style.animationFillMode = 'forwards';
      confettiContainer.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 3000);
  }, []);

  // Breathing animation for waiting states
  const createBreathingIndicator = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    element.classList.add('breathe');
    return () => element.classList.remove('breathe');
  }, []);

  // Magnetic attraction effect for interactive elements
  const addMagneticEffect = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < 100) {
        const strength = (100 - distance) / 100;
        element.style.transform = `translate(${x * strength * 0.1}px, ${y * strength * 0.1}px) scale(${1 + strength * 0.05})`;
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = '';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Initialize engagement tracking on mount
  useEffect(() => {
    trackEngagementStreak();
  }, [trackEngagementStreak]);

  // Add CSS for confetti animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return {
    celebrateSuccess,
    createEngagementNudge,
    celebrateMilestone,
    handleErrorGracefully,
    trackEngagementStreak,
    triggerConfetti,
    createBreathingIndicator,
    addMagneticEffect
  };
};