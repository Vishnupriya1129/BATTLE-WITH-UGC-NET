export default function PaletteTest() {
  return (
    <main className="min-h-dvh p-8 md:p-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          BATTLE WITH <span className="text-primary-glow">UGC-NET</span>
        </h1>
        <p className="mt-2 text-ink-muted">
          Train your mind. Read the battlefield. Defeat the cutoff.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Primary · Battle</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">primary</div>
            <div className="h-12 w-32 rounded bg-primary" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">primary-hover</div>
            <div className="h-12 w-32 rounded bg-primary-hover" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">primary-glow</div>
            <div className="h-12 w-32 rounded bg-primary-glow" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">primary-soft</div>
            <div className="h-12 w-32 rounded bg-primary-soft" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Surfaces</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl p-6 border border-border-subtle bg-bg-base">
            <div className="text-xs text-ink-dim">bg-base</div>
          </div>
          <div className="rounded-xl p-6 border border-border-subtle bg-bg-surface">
            <div className="text-xs text-ink-dim">bg-surface</div>
          </div>
          <div className="rounded-xl p-6 border border-border-subtle bg-bg-surface-2">
            <div className="text-xs text-ink-dim">bg-surface-2</div>
          </div>
          <div className="rounded-xl p-6 border border-border-subtle bg-bg-surface-3">
            <div className="text-xs text-ink-dim">bg-surface-3</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Semantic</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">success</div>
            <div className="h-12 w-24 rounded bg-success" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">warning</div>
            <div className="h-12 w-24 rounded bg-warning" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">danger</div>
            <div className="h-12 w-24 rounded bg-danger" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">info</div>
            <div className="h-12 w-24 rounded bg-info" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Mentors</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-kael" />
            <div className="text-sm font-medium">Kael</div>
          </div>
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-nox" />
            <div className="text-sm font-medium">Nox</div>
          </div>
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-raven" />
            <div className="text-sm font-medium">Raven</div>
          </div>
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-sena" />
            <div className="text-sm font-medium">Sena</div>
          </div>
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-eren" />
            <div className="text-sm font-medium">Eren</div>
          </div>
          <div className="bwu-card p-4">
            <div className="h-16 rounded mb-2 bg-mentor-mira" />
            <div className="text-sm font-medium">Mira</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Realm States</h2>
        <div className="flex flex-wrap gap-4">
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">UNSTABLE</div>
            <div className="h-12 w-32 rounded bg-realm-unstable" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">HOLDING</div>
            <div className="h-12 w-32 rounded bg-realm-holding" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">STABILIZED</div>
            <div className="h-12 w-32 rounded bg-realm-stabilized" />
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-2">CONQUERED</div>
            <div className="h-12 w-32 rounded bg-realm-conquered" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Buttons & Typography</h2>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <button className="bwu-btn-primary">Start Practice</button>
          <button className="bwu-btn-ghost">View Details</button>
        </div>
        <div className="bwu-card p-6 space-y-2">
          <p className="text-ink">Primary text — used for question bodies.</p>
          <p className="text-ink-muted">Secondary text — metadata, labels.</p>
          <p className="text-ink-dim">Muted text — timestamps, hints.</p>
          <p className="bwu-mono text-3xl">142 / 300</p>
          <p className="bwu-mono text-xl text-primary-glow">01:42:18</p>
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-border-subtle text-ink-dim text-sm">
        Theme smoke test · M0.5 · If you see navy, burgundy, and six mentor accents, we're good.
      </footer>
    </main>
  );
}