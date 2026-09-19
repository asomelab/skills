#!/usr/bin/env python3
"""Collect everything /asome-sprint-demo needs. Read-only.

Reads .asome/config.json, the GitHub Project board (gh project item-list), the repo's
milestones, releases and the PRs merged during the sprint, plus the product doc set, and
writes ONE JSON bundle. It changes nothing on GitHub and nothing in the repo; the only file
it writes is the bundle, in the system temp dir unless --out says otherwise.

Usage (from the project root):
  python3 collect_sprint_data.py                 # sprint that contains today
  python3 collect_sprint_data.py --sprint 5      # a specific sprint ("5", "Sprint 5", exact title)
  python3 collect_sprint_data.py --sprint +90d   # the +90-day comparative measurement

Exit codes: 0 ok (warnings may exist) · 2 no config · 3 sprint not resolved · 4 board unreadable
Standard library only. Needs `gh` authenticated with the read:project scope.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import date, datetime, timedelta, timezone

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "vendor", ".venv", "coverage", ".turbo"}
CONTEXT_CHARS = 450
INTERNAL_KINDS = {"setup", "research", "docs", "infra", "spike"}


# ── helpers ──────────────────────────────────────────────────────────────────────────────

def sh(args, timeout=120):
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    except FileNotFoundError:
        return False, "", "%s: command not found" % args[0]
    except subprocess.TimeoutExpired:
        return False, "", "timeout running %s" % " ".join(args[:3])
    return p.returncode == 0, p.stdout, p.stderr


def gh_json(args):
    ok, out, err = sh(["gh"] + args)
    if not ok:
        return None, (err or out).strip()[:400]
    try:
        return json.loads(out or "null"), None
    except json.JSONDecodeError as e:
        return None, "gh %s returned invalid JSON: %s" % (" ".join(args[:2]), e)


def norm(key):
    return re.sub(r"[\s_\-]", "", str(key)).lower()


def pick(d, *names, default=None):
    """Case- and space-insensitive lookup. gh lowercases the first letter of board field
    names ("Status" -> "status", "Story Points" -> "story Points"); older scripts read the
    capitalized form. Accept both, and "Stage" boards too."""
    if not isinstance(d, dict):
        return default
    index = {norm(k): k for k in d}
    for n in names:
        k = index.get(norm(n))
        if k is not None and d[k] not in (None, "", []):
            return d[k]
    return default


def parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def iso(d):
    return d.isoformat() if isinstance(d, (date, datetime)) else d


def add_business_days(start, n):
    """Weekends only. Holidays are NOT discounted — the SKILL tells the agent to check."""
    d, left = start, n
    while left > 0:
        d += timedelta(days=1)
        if d.weekday() < 5:
            left -= 1
    return d


def sprint_number(title):
    m = re.search(r"(\d+)", title or "")
    return int(m.group(1)) if m else None


def hito_code(title):
    m = re.search(r"\(([^)]+)\)", title or "")
    return m.group(1).strip() if m else None


def strip_comments(text):
    return re.sub(r"<!--.*?-->", "", text or "", flags=re.S)


def md_section(text, heading_regex, max_chars=None):
    """Text under the first heading matching heading_regex, until the next heading of the
    same or higher level."""
    out, level, capturing = [], None, False
    for line in strip_comments(text).splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)", line)
        if m:
            lvl = len(m.group(1))
            if capturing and lvl <= level:
                break
            if not capturing and re.search(heading_regex, m.group(2), re.I):
                capturing, level = True, lvl
                continue
        if capturing:
            out.append(line)
    s = "\n".join(out).strip()
    if max_chars and len(s) > max_chars:
        s = s[:max_chars].rstrip() + "…"
    return s or None


def frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---", text or "", re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        k, sep, v = line.partition(":")
        if sep and k.strip():
            out[k.strip()] = v.strip().strip('"')
    return out


def all_sections(text, heading_regex, max_chars):
    """Every section whose heading matches — an acta can have "## Acta (actualización …)"."""
    parts, rest = [], text
    while True:
        m = re.search(r"^(#{1,6})\s+(.*)$", rest, re.M)
        if not m:
            break
        if re.search(heading_regex, m.group(2), re.I):
            body = md_section(rest[m.start():], heading_regex)
            if body:
                parts.append("%s %s\n%s" % (m.group(1), m.group(2), body))
        rest = rest[m.end():]
    s = "\n\n".join(parts)
    return (s[:max_chars] + "…" if len(s) > max_chars else s) or None


def read(path, limit=None):
    try:
        with open(path, encoding="utf-8") as fh:
            s = fh.read()
    except (OSError, UnicodeDecodeError):
        return None
    return s[:limit] if limit else s


def find_file(root, name, prefer=("docs/product", "docs/product/demos", "docs")):
    """Preferred locations first, then a pruned walk (older repos kept docs elsewhere,
    e.g. de-wall's dewall-docs/roadmap/)."""
    for sub in prefer:
        p = os.path.join(root, sub, name)
        if os.path.isfile(p):
            return p
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        if dirpath[len(root):].count(os.sep) > 5:
            dirnames[:] = []
            continue
        if name in filenames:
            return os.path.join(dirpath, name)
    return None


def find_glob(root, pattern):
    rx = re.compile(pattern, re.I)
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        if dirpath[len(root):].count(os.sep) > 5:
            dirnames[:] = []
            continue
        for f in filenames:
            if rx.search(f):
                return os.path.join(dirpath, f)
    return None


# ── board items ──────────────────────────────────────────────────────────────────────────

def item_iteration(item):
    it = pick(item, "Sprint", "Iteration")
    if isinstance(it, dict) and it.get("title"):
        return it
    for v in item.values():
        if isinstance(v, dict) and "startDate" in v and "title" in v:
            return v
    return None


def status_bucket(status):
    s = (status or "").strip().lower()
    for bucket, rx in (("done", r"^done$"), ("cancelled", r"^cancell?ed$"),
                       ("in_progress", r"^in ?progress$"), ("in_review", r"^in ?review$"),
                       ("blocked", r"^blocked$"), ("todo", r"^to ?do$")):
        if re.match(rx, s):
            return bucket
    return "backlog"


def kind_of(item, labels, title):
    k = pick(item, "Kind")
    if k:
        return str(k)
    for l in labels:
        if l.startswith("type:"):
            return l.split(":", 1)[1].capitalize()
    m = re.match(r"^\s*(Bug|Infra|Spike|Docs|Setup)\s+—", title or "")
    return m.group(1) if m else None


def open_type(bucket, needs, kind):
    """Proposal only — the agent confirms with the team."""
    if "needs:client" in needs:
        return "Depende de ustedes"
    if "needs:third-party" in needs:
        return "Depende de terceros"
    if (kind or "").lower() == "bug":
        return "Corrección pendiente"
    if bucket in ("in_progress", "in_review"):
        return "En curso"
    if bucket == "blocked":
        return "Bloqueado (motivo a confirmar)"
    return "No arrancó"


def normalize(item):
    content = item.get("content") or {}
    labels = [l.get("name") if isinstance(l, dict) else l for l in (pick(item, "Labels", default=[]) or [])]
    labels = [l for l in labels if l]
    assignees = [a.get("login") if isinstance(a, dict) else a for a in (pick(item, "Assignees", default=[]) or [])]
    title = content.get("title") or item.get("title") or ""
    body = content.get("body") or ""
    it = item_iteration(item)
    milestone = pick(item, "Milestone")
    if isinstance(milestone, dict):
        milestone = milestone.get("title")
    sp = pick(item, "Story Points", "Estimate", "Points", "SP")
    try:
        sp = float(sp) if sp is not None else None
    except (TypeError, ValueError):
        sp = None
    status = pick(item, "Status", "Stage") or "Backlog"
    kind = kind_of(item, labels, title)
    needs = [l for l in labels if l.startswith("needs:")]
    bucket = status_bucket(status)
    hu = re.search(r"\bHU-\d+", title)
    internal = (kind or "").lower() in INTERNAL_KINDS or "area:infra" in labels
    return {
        "number": content.get("number") or item.get("number"),
        "content_type": content.get("type") or "Issue",
        "title": title,
        "url": content.get("url"),
        "status": status,
        "bucket": bucket,
        "sprint": it.get("title") if it else None,
        "story_points": sp,
        "kind": kind,
        "area": pick(item, "Area"),
        "priority": pick(item, "Priority"),
        "labels": labels,
        "assignees": assignees,
        "milestone": milestone,
        "track": "ux" if ("track:ux" in labels or title.lstrip().startswith("[UX]")) else "dev",
        "needs": needs,
        "scope": [l for l in labels if l.startswith("scope:")],
        "hu": hu.group(0) if hu else None,
        "client_facing_hint": not internal,
        "open_type_hint": open_type(bucket, needs, kind) if bucket not in ("done", "cancelled") else None,
        "context": None if internal else md_section(body, r"^context(o)?\b", CONTEXT_CHARS),
        "linked_prs": pick(item, "Linked pull requests", default=[]) or [],
    }


def collect_iterations(cfg, raw_items):
    found = {}
    sprint_field = pick(pick(cfg, "fields", default={}) or {}, "Sprint", "Iteration", default={}) or {}
    for it in sprint_field.get("iterations", []) or []:
        t, s, e = it.get("title"), parse_date(it.get("start")), parse_date(it.get("end"))
        if t and s:
            found[t] = {"title": t, "start": s, "end": e or s + timedelta(days=13)}
    for item in raw_items:
        it = item_iteration(item)
        if not it:
            continue
        t, s = it.get("title"), parse_date(it.get("startDate"))
        if not (t and s):
            continue
        try:
            dur = int(it.get("duration") or 14)
        except (TypeError, ValueError):
            dur = 14
        found.setdefault(t, {"title": t, "start": s, "end": s + timedelta(days=dur - 1)})
    out = sorted(found.values(), key=lambda x: x["start"])
    for it in out:
        it["number"], it["hito"] = sprint_number(it["title"]), hito_code(it["title"])
    return out


def choose_sprint(iterations, arg, today):
    if arg:
        m = re.fullmatch(r"\s*(?:sprint\s*)?0*(\d+)\s*", arg, re.I)
        if m:
            n = int(m.group(1))
            for it in iterations:
                if it["number"] == n:
                    return it
        for it in iterations:
            if it["title"].strip().lower() == arg.strip().lower():
                return it
        return None
    for it in iterations:
        if it["start"] <= today <= it["end"]:
            return it
    past = [it for it in iterations if it["start"] <= today]
    return past[-1] if past else (iterations[0] if iterations else None)


# ── docs ─────────────────────────────────────────────────────────────────────────────────

def field(block, label):
    m = re.search(r"\*\*" + label + r"\s*:?\s*\*\*\s*:?\s*(.+)", block, re.I)
    return m.group(1).strip() if m else None


def baseline_pending(value):
    """`M-NN` alone, or a value tagged as estimated/unmeasured, is not a baseline yet.
    "12 min (observado en relevamiento — M-01)" IS one: the tag cites where it came from."""
    if not value:
        return True
    if re.search(r"sin medir|estimad|pendiente|a definir", value, re.I):
        return True
    return not re.search(r"\d", re.sub(r"`?M-\d+`?", "", value))


def parse_metricas(text):
    inds = []
    for m in re.finditer(r"^###\s+(.+?)\s*$(.*?)(?=^#{2,3}\s|\Z)", text, re.M | re.S):
        name, block = m.group(1), m.group(2)
        vp, meta = field(block, "Valor de partida"), field(block, "Meta")
        if vp is None and meta is None:
            continue
        inds.append({
            "nombre": re.sub(r"^[\d.]+\s*", "", name).strip(),
            "que_mide": field(block, "Qué mide"),
            "fuente": field(block, "De dónde sale el dato"),
            "valor_de_partida": vp,
            "meta": meta,
            "linea_de_base_pendiente": baseline_pending(vp),
        })
    return inds


def parse_register(text, section_rx, id_prefix):
    sec = md_section(text, section_rx) or ""
    out = []
    for m in re.finditer(r"^###\s+(%s-\d+)\s*[·\-—:]\s*(.+)$" % id_prefix, sec, re.M):
        start = m.end()
        nxt = re.search(r"^###\s", sec[start:], re.M)
        block = sec[start:start + nxt.start()] if nxt else sec[start:]
        out.append({"id": m.group(1), "titulo": m.group(2).strip(),
                    "bloquea": field(block, "Bloquea")})
    return out


def parse_epicas(text):
    hu_to_epic, current = {}, None
    for line in text.splitlines():
        h = re.match(r"^##\s+(E\d+\s*[·\-—:]\s*.+)$", line)
        if h:
            current = h.group(1).strip()
            continue
        row = re.match(r"^\|\s*(HU-\d+)\s*\|", line)
        if row and current:
            hu_to_epic[row.group(1)] = current
    return hu_to_epic


def parse_validation_days(*texts):
    for t in texts:
        if not t:
            continue
        m = re.search(r"(\d+)\s+d[ií]as\s+h[aá]biles", t, re.I)
        if m:
            return int(m.group(1))
    return None


# ── main ─────────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sprint", help='"5", "Sprint 5", exact iteration title, or "+90d"')
    ap.add_argument("--config", default=".asome/config.json")
    ap.add_argument("--root", default=".")
    ap.add_argument("--today", help="YYYY-MM-DD (tests)")
    ap.add_argument("--limit", type=int, default=1000)
    ap.add_argument("--out")
    a = ap.parse_args()

    root = os.path.abspath(a.root)
    today = parse_date(a.today) or date.today()
    warnings, errors = [], []

    cfg_path = os.path.join(root, a.config)
    try:
        with open(cfg_path, encoding="utf-8") as fh:
            cfg = json.load(fh)
    except (OSError, json.JSONDecodeError) as e:
        print("✗ No pude leer %s (%s). Corré /asome-setup primero." % (a.config, e))
        return 2

    repo = cfg.get("repo")
    project_num = cfg.get("project_num")
    owner = (repo or "/").split("/")[0]
    if not (repo and project_num):
        print("✗ .asome/config.json no tiene repo o project_num. Corré /asome-setup.")
        return 2

    board, err = gh_json(["project", "item-list", str(project_num), "--owner", owner,
                          "--format", "json", "--limit", str(a.limit)])
    if board is None:
        hint = ""
        if "scope" in (err or "").lower() or "read:project" in (err or ""):
            hint = " → corré: gh auth refresh -s read:project"
        print("✗ No pude leer el board #%s de %s: %s%s" % (project_num, owner, err, hint))
        return 4
    raw_items = board.get("items", []) if isinstance(board, dict) else []
    if isinstance(board, dict) and board.get("totalCount", 0) > len(raw_items):
        warnings.append("El board tiene %s ítems y se leyeron %s: subí --limit." % (board["totalCount"], len(raw_items)))

    iterations = collect_iterations(cfg, raw_items)
    is_90d = bool(a.sprint and a.sprint.strip().lower() in ("+90d", "90d", "+90"))
    sprint = None if is_90d else choose_sprint(iterations, a.sprint, today)
    if not is_90d and not sprint:
        print("✗ No encontré el sprint %r. Iteraciones disponibles:" % (a.sprint or "de hoy"))
        for it in iterations:
            print("   %s  %s → %s" % (it["title"], it["start"], it["end"]))
        return 3

    items = [normalize(i) for i in raw_items]
    items = [i for i in items if i["content_type"] != "PullRequest"]

    idx = iterations.index(sprint) if sprint else len(iterations)
    prev_it = iterations[idx - 1] if sprint and idx > 0 else None
    next_it = iterations[idx + 1] if sprint and idx + 1 < len(iterations) else None

    in_sprint = [i for i in items if sprint and i["sprint"] == sprint["title"]]
    in_next = [i for i in items if next_it and i["sprint"] == next_it["title"]]

    # milestones — commitment to the client; sprint iterations are the team's commitment
    milestones, err = gh_json(["api", "repos/%s/milestones?state=all&per_page=100" % repo])
    if milestones is None:
        warnings.append("No pude leer milestones: %s" % err)
        milestones = []
    ms = [{"title": m.get("title"), "state": m.get("state"), "due": (m.get("due_on") or "")[:10] or None,
           "description": (m.get("description") or "")[:300] or None,
           "open": m.get("open_issues"), "closed": m.get("closed_issues")} for m in milestones]

    def milestone_for(it):
        if not it:
            return None
        rx = re.compile(r"^\s*S0*%s\b" % it["number"], re.I)
        for m in ms:
            if m["title"] and rx.search(m["title"]):
                return m
        names = [i["milestone"] for i in items if i["sprint"] == it["title"] and i["milestone"]]
        if names:
            top = max(set(names), key=names.count)
            return next((m for m in ms if m["title"] == top), {"title": top})
        return None

    m90 = next((m for m in ms if m["title"] and "+90" in m["title"]), None)

    # releases and promotions inside the sprint window
    releases, promotions = [], {}
    if sprint:
        win_start, win_end = sprint["start"], sprint["end"] + timedelta(days=1)
        rel, err = gh_json(["api", "repos/%s/releases?per_page=30" % repo])
        if rel is None:
            warnings.append("No pude leer releases: %s" % err)
        for r in rel or []:
            pub = parse_date(r.get("published_at"))
            if pub and win_start <= pub <= win_end and not r.get("draft"):
                releases.append({"tag": r.get("tag_name"), "name": r.get("name"), "published": iso(pub),
                                 "prerelease": r.get("prerelease")})
        prs, err = gh_json(["pr", "list", "--repo", repo, "--state", "merged", "--limit", "300",
                            "--search", "merged:%s..%s" % (win_start, sprint["end"]),
                            "--json", "number,title,baseRefName,headRefName,mergedAt"])
        if prs is None:
            warnings.append("No pude leer PRs mergeados: %s" % err)
        for p in prs or []:
            base = p.get("baseRefName") or "?"
            slot = promotions.setdefault(base, {"merged": 0, "last_merge": None})
            slot["merged"] += 1
            if p.get("mergedAt") and (slot["last_merge"] is None or p["mergedAt"] > slot["last_merge"]):
                slot["last_merge"] = p["mergedAt"]
        dev = next((b for b in ("dev", "develop") if b in promotions), None)
        if dev and (promotions.get("staging") is None or
                    promotions[dev]["last_merge"] > (promotions["staging"]["last_merge"] or "")):
            warnings.append("Hay merges en %s posteriores a la última promoción a staging: lo último del "
                            "sprint puede no estar en el entorno de la demo (→ /asome-deploy staging)." % dev)

    main_branch = next((b for b in ("main", "master") if b in promotions), None)
    if sprint and not main_branch and (next_it is None or (sprint["hito"] and next_it and next_it["hito"]
                                                            and sprint["hito"] != next_it["hito"])):
        warnings.append("El sprint cierra hito y no hubo promoción a main en la ventana: el DoD de hito "
                        "(Nivel 3) pide deploy a producción (→ /asome-deploy main).")

    # docs
    nn = "%02d" % sprint["number"] if sprint and sprint["number"] is not None else None
    prev_nn = "%02d" % prev_it["number"] if prev_it and prev_it["number"] is not None else None
    names = {
        "plan_sprint": "sprint-%s-plan.md" % nn if nn else None,
        "plan_sprint_siguiente": ("sprint-%02d-plan.md" % next_it["number"]) if next_it and next_it["number"] else None,
        "plan_de_sprints": "11-plan-de-sprints.md",
        "metricas": "10-metricas.md",
        "mediciones": "mediciones-pendientes.md",
        "decisiones": "decisiones.md",
        "epicas": "06-epicas.md",
        "dominio": "04-modelo-de-dominio.md",
        "usuarios": "01-usuarios.md",
        "vision": "00-vision.md",
        "demo_anterior": "sprint-%s-demo.md" % prev_nn if prev_nn else None,
        "demo_actual": "sprint-%s-demo.md" % nn if nn else None,
    }
    paths = {k: (find_file(root, v) if v else None) for k, v in names.items()}
    paths["mapa_operativo"] = find_glob(root, r"mapa.?operativo.*\.md$")
    texts = {k: read(p) for k, p in paths.items() if p}

    plan = texts.get("plan_sprint") or ""
    docs = {
        "found": {k: os.path.relpath(p, root) for k, p in paths.items() if p},
        "missing": [names[k] for k, p in paths.items() if not p and names.get(k) and k != "demo_actual"],
        "objetivo": md_section(plan, r"objetivo", 600),
        "dependencias_cliente": md_section(plan, r"dependencias", 900),
        "demo_y_validacion": md_section(plan, r"demo", 900),
        "moscow_sprint": md_section(plan, r"backlog del sprint", 1500),
        "moscow_siguiente": md_section(texts.get("plan_sprint_siguiente") or "", r"backlog del sprint", 1500),
        "objetivo_siguiente": md_section(texts.get("plan_sprint_siguiente") or "", r"objetivo", 600),
        "validation_days": parse_validation_days(plan, texts.get("plan_de_sprints")),
        "indicadores": parse_metricas(texts.get("metricas") or ""),
        "mediciones_pendientes": parse_register(texts.get("mediciones") or "", r"^pendientes", "M"),
        "decisiones_abiertas": parse_register(texts.get("decisiones") or "", r"^abiertas", "D"),
        "hu_a_epica": parse_epicas(texts.get("epicas") or ""),
        "palabras_prohibidas": (re.search(r"\*\*Palabras prohibidas\*\*[^\n]*", texts.get("dominio") or "") or [None])[0],
        "usuarios": (texts.get("usuarios") or "")[:1500] or None,
        "vision": (strip_comments(texts.get("vision") or "")[:1200]).strip() or None,
        "demo_anterior_frontmatter": frontmatter(texts.get("demo_anterior") or ""),
        "mapa_operativo": (texts.get("mapa_operativo") or "")[:2500] or None,
        "demo_anterior_ficha": md_section(texts.get("demo_anterior") or "", r"^ficha$", 2500),
        "demo_anterior_acta": all_sections(texts.get("demo_anterior") or "", r"^acta\b", 4000),
        "demo_actual_existe": bool(paths.get("demo_actual")),
    }
    if sprint and not docs["objetivo"]:
        warnings.append("Sin objetivo en sprint-%s-plan.md: hay que pedirlo." % nn)
    if docs["validation_days"] is None:
        warnings.append("No encontré los días hábiles de validación (sprint plan / 11-plan-de-sprints.md).")
    pending = [i["nombre"] for i in docs["indicadores"] if i["linea_de_base_pendiente"]]
    if not docs["indicadores"]:
        warnings.append("Sin indicadores en 10-metricas.md: la lámina del indicador sale como PENDIENTE.")
    elif pending:
        warnings.append("Indicadores sin línea de base: %s." % ", ".join(pending))

    # dates
    dates = {}
    if sprint:
        demo_date = sprint["end"]
        dates["demo"] = iso(demo_date)
        if docs["validation_days"]:
            dates["validacion_hasta"] = iso(add_business_days(demo_date, docs["validation_days"]))
        if next_it:
            dates["proxima_demo"] = iso(next_it["end"])

    # internal numbers — never on a slide
    def sp(lst):
        return sum(i["story_points"] or 0 for i in lst)
    done = [i for i in in_sprint if i["bucket"] == "done"]
    stats = {
        "items_sprint": len(in_sprint), "done": len(done),
        "sp_comprometidos": sp([i for i in in_sprint if i["bucket"] != "cancelled"]),
        "sp_hechos": sp(done),
        "sp_hechos_por_carril": {t: sp([i for i in done if i["track"] == t]) for t in ("dev", "ux")},
        "sp_siguiente": sp(in_next),
        "capacity": cfg.get("capacity"),
    }
    if in_next and stats["sp_hechos"] and stats["sp_siguiente"] > stats["sp_hechos"] * 1.15:
        warnings.append("El sprint siguiente suma %.0f SP contra %.0f SP hechos en este: revisar compromiso "
                        "con /asome-sprint plan antes de mostrarlo." % (stats["sp_siguiente"], stats["sp_hechos"]))

    def it_out(it):
        if not it:
            return None
        return {"title": it["title"], "number": it["number"], "hito": it["hito"],
                "start": iso(it["start"]), "end": iso(it["end"]), "milestone": milestone_for(it)}

    type_hint = "+90d" if is_90d else "modulo"
    closes_hito = False
    if sprint:
        closes_hito = (next_it is None) or (sprint["hito"] and next_it["hito"] and sprint["hito"] != next_it["hito"])
        if sprint["number"] == 1:
            type_hint = "s1-fundaciones"
        elif next_it is None:
            type_hint = "sn-cierre (confirmar: puede ser sólo la última iteración creada)"
        elif closes_hito:
            type_hint = "cierre-de-hito"

    bundle = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "today": iso(today), "repo": repo, "project_num": project_num,
        "type_hint": type_hint,
        "sprint": dict(it_out(sprint), closes_hito=bool(closes_hito)) if sprint else None,
        "prev_sprint": it_out(prev_it), "next_sprint": it_out(next_it),
        "roadmap": [it_out(it) for it in iterations],
        "milestone_90d": m90,
        "items": {
            "done": done,
            "open": [i for i in in_sprint if i["bucket"] not in ("done", "cancelled")],
            "cancelled": [i for i in in_sprint if i["bucket"] == "cancelled"],
            "next": in_next,
            "needs_client_anywhere": [{"number": i["number"], "title": i["title"], "sprint": i["sprint"]}
                                      for i in items if "needs:client" in i["needs"] and i["bucket"] != "done"],
        },
        "releases": releases, "promotions": promotions,
        "team": cfg.get("team") or [],
        "docs": docs, "dates": dates, "stats_internal": stats,
        "warnings": warnings, "errors": errors,
    }

    out = a.out or os.path.join(tempfile.gettempdir(), "asome-sprint-demo",
                                "sprint-%s.json" % (nn or "90d"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(bundle, fh, ensure_ascii=False, indent=1, default=iso)

    s = bundle["sprint"]
    print("✓ %s · %s" % (repo, s["title"] if s else "+90d · medición comparativa"))
    if s:
        print("  %s → %s · tipo sugerido: %s" % (s["start"], s["end"], type_hint))
        print("  ítems: %d hechos · %d abiertos · %d cancelados · %d en el sprint siguiente" % (
            len(bundle["items"]["done"]), len(bundle["items"]["open"]),
            len(bundle["items"]["cancelled"]), len(bundle["items"]["next"])))
        print("  demo: %s · validación hasta: %s · próxima demo: %s" % (
            dates.get("demo"), dates.get("validacion_hasta", "⟨sin dato⟩"), dates.get("proxima_demo", "⟨sin dato⟩")))
    print("  docs: %d encontrados · faltan: %s" % (len(docs["found"]), ", ".join(docs["missing"]) or "ninguno"))
    for w in warnings:
        print("  ⚠ %s" % w)
    print("  bundle: %s" % out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
