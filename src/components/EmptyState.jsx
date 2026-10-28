import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, text, actionLabel, onAction }) {
  return (
    <div className="empty">
      {Icon && (
        <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={34} />
        </motion.div>
      )}
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}