import { z } from "zod";
import { json, requireUser, throttle } from "@/server/http";
import { MODULES } from "@/content/modules";
import { MISSIONS } from "@/content/missions";
import { GLOSSARY } from "@/content/glossary";
import { BADGES } from "@/content/badges";
import { DETECTIVE_CASES } from "@/content/detective";

const schema = z.object({ q: z.string().min(1).max(80) });

export interface SearchHit {
  kind: "module" | "lesson" | "mission" | "glossary" | "badge" | "case";
  title: string;
  detail: string;
  href: string;
}

export async function GET(req: Request) {
  const limited = throttle(req, "search", 60);
  if (limited) return limited;
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const url = new URL(req.url);
  const parsed = schema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) return json({ hits: [] });
  const q = parsed.data.q.toLowerCase();

  const hits: SearchHit[] = [];
  const match = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));

  for (const m of MODULES) {
    if (match(m.title, m.tagline, m.description)) {
      hits.push({ kind: "module", title: m.title, detail: "Module", href: `/academy/${m.slug}` });
    }
    for (const l of m.lessons) {
      if (match(l.title, ...l.outcomes)) {
        hits.push({ kind: "lesson", title: l.title, detail: `${m.title} · lesson`, href: `/academy/${m.slug}/${l.slug}` });
      }
    }
  }
  for (const m of MISSIONS) {
    if (match(m.title, m.description)) hits.push({ kind: "mission", title: `Mission ${String(m.order).padStart(2, "0")}: ${m.title}`, detail: `${m.difficulty} · ${m.xp} XP`, href: `/missions/${m.id}` });
  }
  for (const g of GLOSSARY) {
    if (match(g.term, g.definition)) hits.push({ kind: "glossary", title: g.term, detail: g.definition.slice(0, 80), href: `/glossary#${encodeURIComponent(g.term)}` });
  }
  for (const b of BADGES) {
    if (match(b.title, b.description)) hits.push({ kind: "badge", title: b.title, detail: "Badge", href: "/achievements" });
  }
  for (const c of DETECTIVE_CASES) {
    if (match(c.title)) hits.push({ kind: "case", title: `Case #${c.caseNo}: ${c.title}`, detail: "AI Detective", href: `/detective/${c.id}` });
  }

  return json({ hits: hits.slice(0, 12) });
}
