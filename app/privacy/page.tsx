import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/app/page";
import { SectionHeading, GlassCard } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AI Quest handles student data: minimally, transparently, and without tracking.",
};

export default function PrivacyPage() {
  return (
    <div className="app-backdrop min-h-screen">
      <PublicNav />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-24 pt-32">
        <SectionHeading kicker="Our commitment" title="Privacy, in plain language" />
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
            {
              t: "Demo mode",
              b: "The public demo uses a shared, clearly-marked sample account with synthetic activity. It represents no real student.",
            },
            {
              t: "Your control",
              b: "Settings let you change theme, motion, sound, notifications, and whether you appear on the leaderboard at all. Progress data is stored securely and can be removed on request.",
            },
            {
              t: "For schools",
              b: "AI Quest practices what it teaches: data minimization and purpose limitation. Only what's needed to run the learning experience is stored.",
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
