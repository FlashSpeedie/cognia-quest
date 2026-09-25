import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SectionHeading, GlassCard } from "@/components/ui/Card";
import { isDemoEnabled } from "@/lib/env";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How Cognia Quest handles student data: minimally, transparently, and without advertising or tracking.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const demo = isDemoEnabled();
  return (
    <div className="app-backdrop min-h-screen">
      <JsonLd data={breadcrumbJsonLd("Privacy", "/privacy")} />
      <PublicNav demoEnabled={demo} />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-24 pt-32">
        <SectionHeading as="h1" kicker="Our commitment" title="Privacy, in plain language" />
        <div className="mt-8 space-y-4">
          {[
            {
              t: "What we collect",
              b: "An email address, a display name, and your learning activity (lessons completed, XP earned, badges). That's the list. No birthdate, no location, no demographics, no advertising IDs.",
            },
            {
              t: "What we never do",
              b: "We never sell data, never show ads, never track you around the web, and never share your individual record. The leaderboard is opt-in and shows only your chosen display name.",
            },
            ...(demo
              ? [{
                  t: "Demo mode",
                  b: "This local demo build uses a shared, clearly-marked sample account with synthetic activity. It represents no real student. Production deployments do not offer demo accounts.",
                }]
              : []),
            {
              t: "Your control",
              b: "Settings let you change theme, motion, sound, notifications, and whether you appear on the leaderboard at all. You can export everything we store about you from Settings, and your data can be removed on request.",
            },
            {
              t: "For schools",
              b: "Cognia Quest practices what it teaches: data minimization and purpose limitation. Only what's needed to run the learning experience is stored.",
            },
          ].map((c) => (
            <GlassCard key={c.t} className="p-6">
              <h2 className="font-display text-lg font-bold text-ink">{c.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{c.b}</p>
            </GlassCard>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
