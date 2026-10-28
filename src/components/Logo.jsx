import { motion } from "framer-motion";

const LETTERS = ["C", "ü", "S"];

export default function Logo({ size = 44 }) {
  return (
    <div className="logo" style={{ fontSize: size }} aria-label="CüS Life">
      <div className="logo-orb">
        <motion.span
          className="logo-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
        <div className="logo-word">
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              className="logo-letter"
              initial={{ y: 40, opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 + i * 0.15 }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
      <motion.div
        className="logo-sub"
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.6em" }}
        transition={{ delay: 0.9, duration: 1 }}
      >
        LIFE
      </motion.div>
    </div>
  );
}