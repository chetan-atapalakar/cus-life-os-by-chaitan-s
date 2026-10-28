import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo.jsx";

const QUOTES = [
  "Small steps, taken daily, build the life you imagine.",
  "Clarity first. Then action.",
  "Organise the day, and the day will reward you.",
  "What you measure, you can improve.",
  "Calm mind, clear list, steady progress.",
  "Today is a quiet chance to begin again.",
];

export default function Splash({ onDone }) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <Logo size={46} />
      <motion.p
        className="quote"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
      >
        “{quote}”
      </motion.p>
      <div className="load">
        <motion.span
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        className="load-text"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        Loading your workspace
      </motion.div>
    </motion.div>
  );
}