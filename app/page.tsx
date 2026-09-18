import { LinkButton } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main id="main" className="app-backdrop flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-pulse-400">AI Quest</p>
      <h1 className="font-display text-4xl font-bold sm:text-6xl">
        Become an <span className="text-gradient">AI Apprentice</span>
      </h1>
      <p className="max-w-xl text-ink-dim">
        Learn AI. Challenge AI. Use AI Responsibly.
      </p>
      <div className="flex gap-3">
        <LinkButton href="/register" size="lg">Start Your Quest</LinkButton>
        <LinkButton href="/about" variant="secondary" size="lg">Explore AI</LinkButton>
      </div>
    </main>
  );
}
