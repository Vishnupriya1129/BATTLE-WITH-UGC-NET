# WORLD.md — Astra Academy Canon

Version: 1.0.0
Frozen: 2026-10-06

This is the canonical reference for the fictional layer of BATTLE WITH UGC-NET. Everything the app says in the voice of a mentor must be consistent with this document.

---

## The Core Philosophy

> You don't defeat the exam by studying everything.
> You defeat it by understanding the battlefield.

The user is **The Challenger**. The exam is **The NET Trial**. The place is **Astra Academy**.

---

## The Challenger

Not a chosen one. Not gifted. The Challenger is here because they decided to finish.

The app never congratulates the Challenger for being smart. It only acknowledges what they did.

---

## The Ten Realms

| Unit code | Realm name | Visual metaphor |
|---|---|---|
| P2-U1 | The Origin Spire | Tower, geometric runes |
| P2-U2 | The Machine Core | Gears, circuits |
| P2-U3 | The Syntax Foundry | Forge, sparks |
| P2-U4 | The Algorithm Forest | Trees, paths |
| P2-U5 | The Kernel Citadel | Fortress, walls |
| P2-U6 | The Database Vault | Vault, lock |
| P2-U7 | The Network Abyss | Ocean, currents |
| P2-U8 | The Logic Archives | Library, shelves |
| P2-U9 | The Cognition Lab | Brain, chambers |
| P2-U10 | The Frontier | Emerging tech, edge of map |
| P1 | The Foundation Realm | Academy grounds |

Realms have states: **UNSTABLE → HOLDING → STABILIZED → CONQUERED**. States derive purely from mastery math. Never assigned by narrative.

---

## The Six Mentors

Each mentor has:
- A **domain** (what kind of problem they respond to)
- A **core question** (the question they always ask)
- **Tone rules** (how they speak)
- **Never-rules** (what they never say)
- A **signature line**

### Kael Varen — The Lazy Strategist
- Domain: Strategy
- Core question: *"What's the smartest move?"*
- Signature: *"A clear strategy always saves more energy."*
- **Never says:** "Study harder."
- **Behavior:** Appears when effort is being wasted. Rare. Speaks briefly.

### Nox Vale — The Deductive Observer
- Domain: Deduction & error analysis
- Core question: *"Why were you wrong?"*
- Signature: *"Every mistake leaves evidence."*
- **Never says:** "The answer is X."
- **Behavior:** Appears after wrong answers. Asks questions. Never gives answers.

### Raven Kai — The Ruthless Competitor
- Domain: Performance
- Core question: *"How far are you from the target?"*
- Signature: *"Intentions don't count. Results do."*
- **Never says:** "It's okay."
- **Behavior:** Appears after mocks and streaks. Always cites numbers.

### Sena Kryn — The Scientific Explorer
- Domain: Concepts
- Core question: *"Do you actually understand it?"*
- Signature: *"If you understand the mechanism, you don't need to memorize the surface."*
- **Never says:** "Just memorize it."
- **Behavior:** Appears on hard-topic open. Breaks ideas into mechanisms.

### Eren Voss — The Discipline Mentor
- Domain: Consistency
- Core question: *"Did you show up?"*
- Signature: *"You don't need three hours. You need to begin."*
- **Never says:** "You should feel bad."
- **Behavior:** Appears on missed days. Never shames. Offers 15-minute recovery.

### Mira Solen — The Sensei
- Domain: Mentorship
- Core question: *"How do we keep moving?"*
- Signature: *"A bad score is information. It isn't your identity."*
- **Never says:** False comfort.
- **Behavior:** Appears after score drops. Reframes without lying.

---

## The Golden Rule

**The anime makes studying emotionally engaging. The data makes studying strategically intelligent. Neither replaces the other.**

Every mentor line must be **computable from the user's DB state**. If a mentor says "You've mastered three topics you're still revising," that comes from a SQL query. If Nox says "You misunderstood normalization," that comes from the mistake pattern. If Raven says "6 marks remain," that's `target_score - latest_mock`.

**No mentor ever speaks un-computed content.**

---

## Ranks

| Rank | Score range |
|---|---|
| Initiate | 0 – 79 |
| Aspirant | 80 – 109 |
| Challenger | 110 – 139 |
| Strategist | 140 – 169 |
| Cognitive Strategist | 170+ |

Rank is derived from latest mock score. It is never announced as praise — it's stated as status.

---

## Voice & Tone Rules (Global)

1. **No hype.** No "Let's go!" No exclamation marks unless from Sena on a genuine breakthrough.
2. **No false comfort.** Mira is warm but never lies.
3. **Numbers over adjectives.** "6 marks remain" not "you're so close."
4. **Brevity over warmth.** Kael's best lines are 6 words.
5. **The user is the protagonist.** Mentors advise; they don't perform.

---

## What the Anime Layer Does NOT Do

- It does not gate learning behind story progression.
- It does not lock content behind rank.
- It does not replace raw data views (users can always see plain tables).
- It does not use AI before M10 (dialogue is templated and deterministic).
- It does not make claims the database can't verify.

The story serves the engine. The engine never serves the story.