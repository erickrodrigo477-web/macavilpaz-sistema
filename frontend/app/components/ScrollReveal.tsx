"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
}

export default function ScrollReveal({ children, threshold = 0.15, delay = 0 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsVisible(entry.isIntersecting);
      });
    }, { 
      threshold,
      rootMargin: "0px 0px -20px 0px" 
    });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`reveal-hidden ${isVisible ? "reveal-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
