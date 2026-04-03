import "../styles/Modal.css";

export default function Modal({
  title,
  description,
  children,
  footer,
  onClose
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && (
              <p className="modal-desc">{description}</p>
            )}
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
