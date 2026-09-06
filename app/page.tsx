const gateState = [
  ["P0.1", "Gate display", "CLOSED"],
  ["P0.2", "Data intake", "LOCKED"],
  ["P1", "Catalog release", "CLOSED"],
] as const;

export default function Home() {
  return (
    <main className="gate-shell">
      <section className="gate-card" aria-labelledby="gate-title">
        <div className="eyebrow">
          <span className="status-dot" aria-hidden="true" />
          PM Cosmetics Hub · deployment gate
        </div>

        <div className="gate-mark" aria-hidden="true">
          <span>!</span>
        </div>

        <h1 id="gate-title">Gate closed</h1>
        <p className="lead">
          The catalog is not available yet. Product data intake must be completed
          and verified before this deployment can open.
        </p>

        <div className="state-list" aria-label="Deployment gate status">
          {gateState.map(([id, label, state]) => (
            <div className="state-row" key={id}>
              <span className="state-id">{id}</span>
              <span className="state-label">{label}</span>
              <span className="state-value">{state}</span>
            </div>
          ))}
        </div>

        <p className="notice">
          No catalog, SKU, price, or inventory data is being served. P1 remains
          closed until an approved source is uploaded.
        </p>
      </section>
    </main>
  );
}
