import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { CAREERS } from "@/content/careers";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export const metadata: Metadata = { title: "AI Careers" };

export default async function CareersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div>
      <SectionHeading
        kicker="Horizons"
        title="AI Career Explorer"
        description="Where these skills lead. No pressure to pick one - just a map of what exists. Every path here started with exactly what you're doing now."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CAREERS.map((c) => (
          <GlassCard key={c.title} className="p-5 transition-transform hover:-translate-y-1">
            <span className="text-3xl" aria-hidden="true">{c.icon}</span>
            <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">{c.what}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {c.skills.map((s) => <Chip key={s} tone="pulse">{s}</Chip>)}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">School subjects that feed it</p>
            <p className="mt-1 text-xs text-ink-dim">{c.subjects.join(" · ")}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
