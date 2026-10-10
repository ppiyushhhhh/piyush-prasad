import { useEffect, useState } from "react";
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
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const checkInteractiveTarget = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], label, summary, [data-cursor="pointer"], .cursor-pointer'
      );
      setIsHovered(Boolean(interactive));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", checkInteractiveTarget, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", checkInteractiveTarget);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

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
          borderColor: isHovered ? "rgba(18, 19, 22, 0.45)" : "rgba(18, 19, 22, 0.22)",
          backgroundColor: isHovered ? "rgba(18, 19, 22, 0.05)" : "rgba(18, 19, 22, 0.02)",
        }}
        animate={{
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Center Deep Carbon (#121316) Precision Dot */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#121316] shadow-[0_0_4px_rgba(18,19,22,0.3)]"
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
