# ASOME Skills — Agent Registry

Skills published at [skills.sh/asomelab/skills](https://www.skills.sh).
Install: `npx skills add asomelab/skills`

## Where the registry lives

**[`README.md`](README.md) is the registry.** It lists every skill with its triggers and what it
does, and it is the file kept in sync when a skill is added or changed.

This file used to carry a second table. It drifted — it listed 14 of 19 skills and pinned a
"Targets" column to `asomelab/asome-portal · Project #6` long after the skills became
project-agnostic. Two registries that disagree are worse than one, so this one now points at the
other.

`skills.sh.json` is the machine-readable grouping used for distribution; add new skills there too.

## Conventions

Per-skill file contract, versioning and the steps to add a skill: see [`CLAUDE.md`](CLAUDE.md).

## Process canon

How an ASOME project's sprints are shaped — the method, the S0 → S1..SN → +90d project shape, the
capacity model, the three-level Definition of Done, the slicing rules, la secuenciación y el modelo
de dependencias, la lista de recorte y la decisión de capacidad — lives in
[`skills/asome-sprint/references/sprint-canon.md`](skills/asome-sprint/references/sprint-canon.md).
`asome-sprint` executes it; `asome-create-issue` and `asome-kickoff` cite it.

## Método de especificación

OpenSpec. Los artefactos de cada cambio viven en `openspec/changes/<name>/` del repositorio de
trabajo, versionados y revisables en el PR. Engram queda como memoria persistente entre sesiones
(R4 de §7.3 del manual), no como artifact store. Ver `skills/asome-sdd/SKILL.md`.

Las skills `sdd-*` fueron retiradas: `/opsx:*` las reemplaza.
