export default function EmptyState({ icon: Icon, title, text, actionLabel, onAction }) {
  return (
    <div className="empty">
      {Icon && <Icon size={32} />}
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}