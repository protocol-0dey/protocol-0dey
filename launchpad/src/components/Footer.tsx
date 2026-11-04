export function Footer({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="cta">
        <div className="container cta__inner">
          <h2>Ready to get your team on the same page?</h2>
          <button type="button" className="btn btn--lg" onClick={onStart}>
            Start free trial
          </button>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <p>© 2026 Launchpad. Concept project: the product, plans and prices are fictional.</p>
        </div>
      </footer>
    </>
  );
}
