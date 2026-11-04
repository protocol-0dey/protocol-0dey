export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <p className="eyebrow">Project management for fast teams</p>
        <h1>Plan, track and ship work without the busywork</h1>
        <p className="hero__lead">
          Launchpad keeps tasks, timelines and decisions in one place, so your team always knows
          what is next. Free for small teams, simple pricing as you grow.
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn--lg" onClick={onStart}>
            Start free trial
          </button>
          <a className="btn btn--lg btn--ghost" href="#pricing">
            See pricing
          </a>
        </div>
        <p className="hero__note">No credit card needed. Set up in under two minutes.</p>
      </div>
    </section>
  );
}
