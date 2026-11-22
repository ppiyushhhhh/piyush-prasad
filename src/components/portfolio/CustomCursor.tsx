import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Theme-Aware High-Precision Custom Pointer
 * - Theme-reactive: Uses contrast text tokens with a crisp contrast outline
 *   so it stays distinct on dark surfaces, light surfaces, badge tiles, and teal buttons.
 * - Interactive target expansion: Expands to 36px ring with accent border over links, buttons, cards.
 * - Text inputs: Hides over text fields to reveal native text selection I-beam.
 * - Touch & Accessibility: Automatically disabled on touch screens; respects prefers-reduced-motion.
 */
export function CustomCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Direct pointer coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for trailing halo ring (bypassed if reduced motion is requested)
  const springConfig = { damping: 28, stiffness: 320, mass: 0.35 };
  const ringSpringX = useSpring(cursorX, springConfig);
  const ringSpringY = useSpring(cursorY, springConfig);

  const ringX = shouldReduceMotion ? cursorX : ringSpringX;
  const ringY = shouldReduceMotion ? cursorY : ringSpringY;

  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only render on devices with a fine pointer and real hover support
    const mediaHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mediaHover.matches || "ontouchstart" in window) {
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
        // Detect text inputs where native I-beam cursor must be shown
        const isInput = Boolean(
          target.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]')
        );
        setIsTextInput(isInput);

        // Detect clickable / interactive elements for ring expansion
        const interactive = Boolean(
          target.closest(
            'a, button, [role="button"], label, summary, [data-cursor="pointer"], .cursor-pointer, [role="tab"]'
          )
        );
        setIsHovered(interactive && !isInput);
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

  // Disable completely on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-150"
      style={{ opacity: isVisible && !isTextInput ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Outer Halo Ring (1.5px border, expands to 36px on hover with accent tint) */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color] duration-150 ease-out"
        style={{
          x: ringX,
          y: ringY,
          width: isHovered ? 36 : 24,
          height: isHovered ? 36 : 24,
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: isHovered ? "var(--color-accent)" : "var(--color-text)",
          backgroundColor: isHovered ? "var(--color-accent-soft)" : "transparent",
          boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-background) 80%, transparent)",
        }}
        animate={{
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Center Precision Dot (6px, text contrast color with thin boundary outline) */}
      <motion.div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          width: 6,
          height: 6,
          backgroundColor: isHovered ? "var(--color-accent)" : "var(--color-text)",
          boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-background) 90%, transparent)",
        }}
        animate={{
          scale: isClicked ? 0.75 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
