import { useEffect, useState } from 'react';

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      const portrait = window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setIsPortrait(portrait);

      // Add mobile-specific classes to body
      if (mobile && portrait) {
        document.body.classList.add('mobile-portrait');
      } else {
        document.body.classList.remove('mobile-portrait');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { isMobile, isPortrait };
};

// Mobile-specific CSS enhancements
const mobileStyles = `
  /* Mobile Portrait Optimizations */
  @media (max-width: 767px) and (orientation: portrait) {
    body.mobile-portrait {
      overflow-x: hidden;
    }

    body.mobile-portrait * {
      -webkit-tap-highlight-color: transparent;
    }

    /* Optimize touch targets */
    body.mobile-portrait button,
    body.mobile-portrait a,
    body.mobile-portrait [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }

    /* Prevent text size adjust */
    body.mobile-portrait {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    /* Smoother scrolling on mobile */
    body.mobile-portrait {
      -webkit-overflow-scrolling: touch;
    }

    /* Award-winning mobile animations */
    body.mobile-portrait .award-button {
      transform: scale(1);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    body.mobile-portrait .award-button:active {
      transform: scale(0.95);
    }

    /* Mobile-specific dopamine triggers */
    body.mobile-portrait .dopamine-trigger:active {
      animation: dopamine-pop 0.3s ease-in-out;
    }
  }

  /* Landscape mobile adjustments */
  @media (max-width: 767px) and (orientation: landscape) {
    /* Reduce vertical spacing in landscape */
    .mobile-portrait h1 {
      font-size: clamp(2rem, 8vw, 3rem) !important;
    }

    .mobile-portrait .py-20 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = mobileStyles;
  document.head.appendChild(styleTag);
}

export default useMobileOptimization;