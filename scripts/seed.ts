import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";

// Load .env.local manually — scripts don't run through Next.js
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: false, // local dev only — flip for production
});

/**
 * Tagged-template helper that mimics postgres.js's `sql\`...\`` syntax,
 * but uses pg's parameterized queries under the hood.
 *
 * Usage:
 *   const rows = await sql`select * from subjects where code = ${code}`;
 */
async function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const text = strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  const result = await pool.query<T>(text, values as never[]);
  return result.rows;
}

const DATA_DIR = join(process.cwd(), "data");

// ---------------------------------------------------------------------------
// JSON shapes
// ---------------------------------------------------------------------------
type TaxonomyJSON = {
  subjects: {
    code: string;
    name: string;
    realm: string;
    units: {
      code: string;
      name: string;
      topics: {
        code: string;
        name: string;
        subtopics: string[];
      }[];
    }[];
  }[];
};

type QuestionTypesJSON = {
  types: { code: string; name: string; description: string }[];
};

type MentorsJSON = {
  mentors: {
    code: string;
    name: string;
    title: string;
    role: string;
    accent_hex: string;
    avatar_key: string;
    domain: string;
    core_question: string;
    cooldown_minutes: number;
    priority_weight: number;
  }[];
};

function loadJSON<T>(filename: string): T {
  const path = join(DATA_DIR, filename);
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Seed: subjects, units, topics, subtopics
// ---------------------------------------------------------------------------
async function seedTaxonomy() {
  const taxonomy = loadJSON<TaxonomyJSON>("taxonomy.json");

  let subjectCount = 0;
  let unitCount = 0;
  let topicCount = 0;
  let subtopicCount = 0;

  for (const [sIdx, subject] of taxonomy.subjects.entries()) {
    await sql`
      insert into subjects (code, name, realm_key, order_index)
      values (${subject.code}, ${subject.name}, ${subject.realm}, ${sIdx})
      on conflict (code) do update set
        name = excluded.name,
        realm_key = excluded.realm_key,
        order_index = excluded.order_index
    `;
    subjectCount++;

    for (const [uIdx, unit] of subject.units.entries()) {
      await sql`
        insert into units (code, subject_code, name, order_index)
        values (${unit.code}, ${subject.code}, ${unit.name}, ${uIdx})
        on conflict (code) do update set
          subject_code = excluded.subject_code,
          name = excluded.name,
          order_index = excluded.order_index
      `;
      unitCount++;

      for (const [tIdx, topic] of unit.topics.entries()) {
        await sql`
          insert into topics (code, unit_code, name, order_index)
          values (${topic.code}, ${unit.code}, ${topic.name}, ${tIdx})
          on conflict (code) do update set
            unit_code = excluded.unit_code,
            name = excluded.name,
            order_index = excluded.order_index
        `;
        topicCount++;

        for (const [stIdx, subtopicName] of topic.subtopics.entries()) {
          const subtopicCode = `${topic.code}-${slugify(subtopicName)}`;
          await sql`
            insert into subtopics (code, topic_code, name, order_index)
            values (${subtopicCode}, ${topic.code}, ${subtopicName}, ${stIdx})
            on conflict (code) do update set
              topic_code = excluded.topic_code,
              name = excluded.name,
              order_index = excluded.order_index
          `;
          subtopicCount++;
        }
      }
    }
  }

  console.log(
    `  subjects: ${subjectCount}, units: ${unitCount}, topics: ${topicCount}, subtopics: ${subtopicCount}`
  );
}

// ---------------------------------------------------------------------------
// Seed: question_types
// ---------------------------------------------------------------------------
async function seedQuestionTypes() {
  const data = loadJSON<QuestionTypesJSON>("question_types.json");
  for (const t of data.types) {
    await sql`
      insert into question_types (code, name, description)
      values (${t.code}, ${t.name}, ${t.description})
      on conflict (code) do update set
        name = excluded.name,
        description = excluded.description
    `;
  }
  console.log(`  question_types: ${data.types.length}`);
}

// ---------------------------------------------------------------------------
// Seed: mentors
// ---------------------------------------------------------------------------
async function seedMentors() {
  const data = loadJSON<MentorsJSON>("mentors.json");
  for (const m of data.mentors) {
    await sql`
      insert into mentors (code, name, title, role, accent_hex, avatar_key,
                           domain, core_question, cooldown_minutes, priority_weight)
      values (${m.code}, ${m.name}, ${m.title}, ${m.role}, ${m.accent_hex},
              ${m.avatar_key}, ${m.domain}, ${m.core_question},
              ${m.cooldown_minutes}, ${m.priority_weight})
      on conflict (code) do update set
        name = excluded.name,
        title = excluded.title,
        role = excluded.role,
        accent_hex = excluded.accent_hex,
        avatar_key = excluded.avatar_key,
        domain = excluded.domain,
        core_question = excluded.core_question,
        cooldown_minutes = excluded.cooldown_minutes,
        priority_weight = excluded.priority_weight
    `;
  }
  console.log(`  mentors: ${data.mentors.length}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database...");
  try {
    await seedTaxonomy();
    await seedQuestionTypes();
    await seedMentors();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();