import { sql } from "@/lib/db/client";

export const dynamic = "force-dynamic"; // don't cache DB reads

async function getStats() {
  const subjectsRows = await sql<{ count: string }>`
    select count(*)::text as count from subjects
  `;
  const unitsRows = await sql<{ count: string }>`
    select count(*)::text as count from units
  `;
  const topicsRows = await sql<{ count: string }>`
    select count(*)::text as count from topics
  `;
  const questionsRows = await sql<{ count: string }>`
    select count(*)::text as count from questions
  `;
  const mentorsRows = await sql<{ count: string }>`
    select count(*)::text as count from mentors
  `;

  return {
    subjects: Number(subjectsRows[0]?.count ?? 0),
    units: Number(unitsRows[0]?.count ?? 0),
    topics: Number(topicsRows[0]?.count ?? 0),
    questions: Number(questionsRows[0]?.count ?? 0),
    mentors: Number(mentorsRows[0]?.count ?? 0),
  };
}

export default async function SmokeTest() {
  const stats = await getStats();

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
        <h2 className="bwu-heading mb-4">Database Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-1">SUBJECTS</div>
            <div className="bwu-mono text-3xl">{stats.subjects}</div>
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-1">UNITS</div>
            <div className="bwu-mono text-3xl">{stats.units}</div>
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-1">TOPICS</div>
            <div className="bwu-mono text-3xl">{stats.topics}</div>
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-1">QUESTIONS</div>
            <div className="bwu-mono text-3xl">{stats.questions}</div>
          </div>
          <div className="bwu-card p-6">
            <div className="text-xs text-ink-dim mb-1">MENTORS</div>
            <div className="bwu-mono text-3xl">{stats.mentors}</div>
          </div>
        </div>
        <p className="mt-4 text-ink-muted text-sm">
          If subjects / units / topics / mentors are non-zero after seeding, the
          DB connection works. Questions will stay at 0 until M1.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="bwu-heading mb-4">Palette (smoke test)</h2>
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-20 rounded bg-primary" />
          <div className="h-10 w-20 rounded bg-success" />
          <div className="h-10 w-20 rounded bg-warning" />
          <div className="h-10 w-20 rounded bg-danger" />
          <div className="h-10 w-20 rounded bg-info" />
          <div className="h-10 w-20 rounded bg-mentor-kael" />
          <div className="h-10 w-20 rounded bg-mentor-nox" />
          <div className="h-10 w-20 rounded bg-mentor-raven" />
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-border-subtle text-ink-dim text-sm">
        M0.5 complete · DB connected · Ready for M1
      </footer>
    </main>
  );
}