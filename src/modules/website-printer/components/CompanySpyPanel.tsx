export function CompanySpyPanel() {
  return (
    <section className="wp-panel">
      <div className="wp-section-heading">
        <p>Company Spy</p>
        <span>Provider required</span>
      </div>
      <p className="wp-muted">
        The legacy idea is preserved as a module slot, but lookups are disabled here. Agency OS should wire this to a
        server-side provider so API keys and scraping logic never run in the browser.
      </p>
    </section>
  );
}
