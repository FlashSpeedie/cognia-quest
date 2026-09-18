import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/Card";
import { GlossaryBrowser } from "@/components/app/GlossaryBrowser";
import { GLOSSARY } from "@/content/glossary";

export const metadata: Metadata = { title: "Glossary", description: "Searchable AI vocabulary for apprentices." };

export default function GlossaryPage() {
  return (
    <div>
      <SectionHeading
        kicker="Reference"
        title="AI Glossary"
        description="The vocabulary that unlocks everything else. Searchable, example-first, jargon-free."
      />
      <GlossaryBrowser terms={GLOSSARY} />
    </div>
  );
}
