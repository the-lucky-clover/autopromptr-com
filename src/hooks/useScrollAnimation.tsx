
import { useEffect } from 'react';

export const useScrollAnimation = () => {
  useEffect(() => {
    console.log("useScrollAnimation hook initializing...");

    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      console.warn("IntersectionObserver not supported, skipping scroll animations");
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          console.log("Element animated:", entry.target.className);
        }
      });
    }, observerOptions);

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        // Observe all elements with animate-on-scroll class
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        console.log("Found", animateElements.length, "elements to animate");
        
        animateElements.forEach((el) => {
          try {
            observer.observe(el);
          } catch (error) {
            console.error("Error observing element:", error);
          }
        });
      } catch (error) {
        console.error("Error in scroll animation setup:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      try {
        observer.disconnect();
        console.log("Scroll animation observer disconnected");
      } catch (error) {
        console.error("Error disconnecting observer:", error);
      }
    };
  }, []);
};
