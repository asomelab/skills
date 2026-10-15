---
name: asome-create-skill
description: >
  Create a new ASOME skill following repo conventions — generates SKILL.md and metadata.json,
  adds its row to README.md (the registry) and its name to skills.sh.json.
  Trigger: "create skill", "nueva skill", "add skill", "agregar skill", "new asome skill",
  or when the user describes a reusable workflow to encode as a skill.
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — Create Skill

Creates a fully structured ASOME skill with `SKILL.md`, `metadata.json`, a row in `README.md`
and an entry in `skills.sh.json`. Must be run from the root of the **asome-skills** repo.

**Executes directly — no preview step.**

---

## Repo structure

```
asome-skills/
├── skills/<name>/
│   ├── SKILL.md          # Required — skill instructions read by the agent
│   ├── metadata.json     # Required — version, org, abstract, references
│   ├── references/       # Optional — local doc pointers
│   └── assets/           # Optional — templates, schemas, examples
├── README.md             # Registry — one row per skill (AGENTS.md says so)
├── skills.sh.json        # Distribution groups — add skill name here
└── CLAUDE.md
```

---

## Information to gather

Before creating, confirm or infer from context:

| Field | How to resolve |
|---|---|
| Skill name | `asome-<verb>` or `asome-<noun>` — lowercase, hyphens |
| Description (one-line) | What it does + trigger keywords |
| Group | Pick from existing groups in `skills.sh.json` or propose new one |
| Abstract | 2-3 sentence summary for `metadata.json` |
| Author | Always `"asome"` |

---

## Naming conventions

| Pattern | Examples |
|---|---|
| `asome-<action>` | `asome-commit`, `asome-deploy`, `asome-review` |
| `asome-<domain>-<action>` | `asome-infra-setup`, `asome-infra-audit` |
| `design-system-<project>` | `design-system-asome-lab` |

---

## SKILL.md template

```markdown
---
name: {skill-name}
description: >
  {One-line description}.
  Trigger: "{trigger phrase 1}", "{trigger phrase 2}", ...
license: Apache-2.0
metadata:
  author: asome
  version: "1.0"
---

# ASOME — {Skill Title}

{2-3 sentence intro. What it does, when it runs, any prerequisite.}

**Executes directly — no preview step.**

> **Prerequisite**: `.asome/config.json` must exist. If missing, run `/asome-setup` first.

---

## {Main section}

{Instructions, commands, decision tables.}

---

## Known gotchas

- {Gotcha 1}
- {Gotcha 2}
```

---

## metadata.json template

```json
{
  "version": "1.0.0",
  "organization": "ASOME Lab",
  "date": "{Month YYYY}",
  "abstract": "{2-3 sentences describing what this skill does, its inputs, and outputs.}",
  "references": []
}
```

---

## Execution steps

### Step 1 — create skill directory

```bash
SKILL_NAME="asome-<name>"
mkdir -p "skills/$SKILL_NAME"
```

### Step 2 — write SKILL.md

Write `skills/$SKILL_NAME/SKILL.md` using the template above.
Fill in: name, description, trigger phrases, intro, sections, gotchas.

### Step 3 — write metadata.json

Write `skills/$SKILL_NAME/metadata.json` using the template above.
Fill in: abstract matching the skill's actual behavior.

### Step 4 — add the row to README.md

`README.md` is the registry. Add one row to its **Skills** table, next to the skills of the same
group:

```markdown
| `asome-<name>` | `trigger 1`, `trigger 2` | What it does, in one line |
```

If the skill adds a step to a daily flow, add its line to **Dev flow** too.

### Step 5 — register in skills.sh.json

Open `skills.sh.json` and add the skill name to the correct group's `"skills"` array:

```json
{
  "title": "<Group>",
  "skills": [
    "existing-skill",
    "asome-<name>"    ← add here
  ]
}
```

If no group fits, propose a new one to the user and add it.

### Step 6 — confirm

Print:
```
✓ skills/<name>/SKILL.md
✓ skills/<name>/metadata.json
✓ README.md — row added to Skills
✓ skills.sh.json — added to "<Group>" group
```

---

## Quality checklist

- [ ] Skill name follows `asome-*` convention
- [ ] `description` block includes trigger keywords (for autocomplete)
- [ ] `SKILL.md` has a prerequisite note if it reads `.asome/config.json`
- [ ] `metadata.json` abstract is 2-3 sentences
- [ ] Row in `README.md`'s Skills table — the registry
- [ ] Registered in `skills.sh.json` under the right group
- [ ] No web URLs in `references/` — local paths only

---

## Known gotchas

- `README.md` is the registry; `skills.sh.json` drives distribution and autocomplete — skip it and
  the skill won't appear. Update both: two lists that disagree are worse than one (`AGENTS.md`).
- ASOME skills are **project-agnostic**: never hardcode repo names or IDs. Always read from `.asome/config.json`.
- If the skill needs `.asome/config.json`, add the prerequisite note — user must run `/asome-setup` first.
- Author is always `"asome"`, not `"gentleman-programming"` (that's the generic skill-creator default).
