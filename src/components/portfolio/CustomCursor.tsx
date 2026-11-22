import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Minimalist Deep Carbon (#121316) Custom Pointer
 * High-performance GPU-accelerated cursor with spring trailing halo,
 * interactive target expansion, and automatic touch-screen deactivation.
 */
export function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Exact coordinates for direct dot (instant response, zero lag)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring-damped coordinates for smooth trailing ring
  const springConfig = { damping: 28, stiffness: 320, mass: 0.4 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const visibleRef = useRef(false);

  useEffect(() => {
    // Check if the device uses touch/coarse pointer
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    if (isCoarse) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, textarea, select, [role="button"], label, summary, [data-cursor="pointer"], .cursor-pointer'
        );
        setIsHovered(Boolean(interactive));
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnter = () => {
      visibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  // Disable on touch screens or when user prefers reduced motion
  if (isTouchDevice || shouldReduceMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Outer Spring Trailing Ring */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,background-color,border-color] duration-200 ease-out"
        style={{
          x: ringX,
          y: ringY,
          width: isHovered ? 42 : 26,
          height: isHovered ? 42 : 26,
          borderColor: isHovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-accent) 40%, transparent)",
          backgroundColor: isHovered ? "var(--color-accent-soft)" : "transparent",
        }}
        animate={{
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Center Teal Ops Accent Precision Dot */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          width: isHovered ? 8 : 6,
          height: isHovered ? 8 : 6,
          scale: isClicked ? 0.75 : 1,
        }}
        transition={{ duration: 0.12 }}
      />
    </div>
  );
}
