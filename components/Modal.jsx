'use client';

export default function Modal({ isOpen, title, onClose, onSubmit, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
