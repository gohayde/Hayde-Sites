import type { SavedWebsitePrint } from "../types";

interface SavedPrintsProps {
  prints: SavedWebsitePrint[];
  onLoadPrint: (print: SavedWebsitePrint) => void;
}

export function SavedPrints({ prints, onLoadPrint }: SavedPrintsProps) {
  return (
    <section className="wp-panel">
      <div className="wp-section-heading">
        <p>Saved Prints</p>
        <span>{prints.length} saved</span>
      </div>
      {prints.length === 0 ? (
        <p className="wp-empty">Saved prompt builds will appear here.</p>
      ) : (
        <div className="wp-saved-list">
          {prints.map((print) => (
            <button key={print.id} onClick={() => onLoadPrint(print)} type="button">
              <strong>{print.name}</strong>
              <span>
                {print.niche} · {print.location}
              </span>
              <small>{new Date(print.createdAt).toLocaleString()}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
