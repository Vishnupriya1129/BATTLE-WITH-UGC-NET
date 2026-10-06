# DATA.md — Tagging & Metadata Rules

Version: 1.0.0
Frozen: 2026-10-06

This document defines how questions enter the database, how they're tagged, and what "verified" means.

---

## 1. Question Code Format

`YYYY-Sn-Pn-UNIT-TOPIC-NNN`

Examples:
- `2024-S2-P2-OS-DL-017` — 2024, Shift 2, Paper II, Operating Systems, Deadlocks, question 17
- `2019-S1-P1-RS-ME-004` — 2019, Shift 1, Paper I, Research, Meaning & Types, question 4

**UNIT and TOPIC are 2–4 letter codes derived from taxonomy.json.** Never freeform.

**NNN is the question's position in that paper's sequence**, padded to 3 digits. Not a global counter.

Codes are assigned **once** at import and never change.

---

## 2. Status Lifecycle

- **draft** — extracted, not yet human-reviewed. Not visible to students.
- **reviewed** — human has confirmed text, options, correct answer, and metadata.
- **verified** — passed a second pass (sanity check + spot verification). Visible to students.
- **flagged** — reviewer unsure; needs second pass.
- **rejected** — invalid, duplicate, or unsalvageable.

**Only `verified` questions ever surface to students.**

---

## 3. Tagging Rules

### Unit
Every question belongs to exactly one unit. Use the taxonomy code, not free text.

### Topic
Every question belongs to exactly one topic within that unit.

### Subtopic
Optional. Use only when the subtopic is clearly identifiable and adds signal. If unsure, leave null. **Never guess.**

### Question Type
Assign the most specific applicable type from `question_types.json`. Use `unknown` if genuinely unclear. **Do not force a type.**

### Difficulty
Assign using this rubric:
- **easy** — factual recall, definition, one-step logic
- **medium** — requires understanding or 2-step reasoning
- **hard** — multi-step reasoning, calculation, or requires integrating multiple concepts

**Default to medium if unsure.** Difficulty can be recalibrated later from user attempt data (a question attempted by 100 people with 30% accuracy is empirically hard).

---

## 4. The Three Confidence Tiers

### Tier 1 — Answer present in source
Most common. Extract, spot-check, approve.

### Tier 2 — Answer missing from source
Reviewer **solves the question themselves** and records the answer. This is studying, not just data cleaning. Mark `reviewer_notes = 'solved-by-reviewer'`.

### Tier 3 — Answer disputed or clearly wrong
Flag it. Do not attempt to fix in the pipeline. Handle individually.

---

## 5. What "Verified" Requires

A question reaches `verified` only when ALL of these are true:

- [ ] Question text is clean (no OCR garbage, no broken line breaks)
- [ ] All four options present and readable
- [ ] Correct option is set and correct
- [ ] Unit and topic are set and correct
- [ ] Difficulty is set
- [ ] Question type is set (can be `unknown`)
- [ ] No duplicate exists in DB (checked by code + trigram similarity)

Verified questions may still lack explanations. That's acceptable for v1.

---

## 6. Deduplication

Questions can appear multiple times across years/shifts. **We do not deduplicate across papers** — the same question appearing in 2019 and 2023 is stored twice, because:
- Year/shift metadata differs
- Analytics needs per-year frequency
- Students may benefit from seeing repeats

We **do** deduplicate within a single paper (extraction error).

Dedup check at insert time:
1. Exact `question_code` match → reject
2. Trigram similarity > 0.95 on `question_text` within same paper → reject

---

## 7. Extraction Rules

- Preserve original question wording, including grammatical quirks. Do not "fix" phrasing.
- Normalize whitespace but not punctuation.
- If a question contains an image, set `difficulty` and move on; mark for manual handling later. **Do not attempt to describe images in text.**
- If options are labelled A/B/C/D in the source, preserve labels. If unlabelled, assign A/B/C/D in source order.
- If the correct answer is not clearly marked, it goes into Tier 2.

---

## 8. What We Do NOT Do

- We do not rewrite questions.
- We do not invent explanations.
- We do not guess sub-topics.
- We do not silently fix answers.
- We do not import from non-official sources.

If a question is problematic, it stays `flagged` until resolved.