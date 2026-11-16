export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`my-auto w-full rounded-3xl border border-brand-border bg-brand-card p-6 shadow-card sm:p-8 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold" id="modal-title">{title}</h2>
          <button
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-border text-slate-400 transition hover:border-brand-accent hover:text-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
