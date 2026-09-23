import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/server/auth/session";
import { ethicsCaseById } from "@/content/ethics";
import { EthicsCourt } from "@/components/ethics/EthicsCourt";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ case: string }> }): Promise<Metadata> {
  const c = ethicsCaseById((await params).case);
  return { title: c ? `${c.title} - Ethics Court` : "Ethics Court" };
}

export default async function CourtCasePage({ params }: { params: Promise<{ case: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const c = ethicsCaseById((await params).case);
  if (!c) notFound();
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/ethics" className="hover:text-ink focus-ring rounded">Ethics Center</Link>
        <span aria-hidden>/</span>
        <Link href="/ethics/court" className="hover:text-ink focus-ring rounded">Ethics Court</Link>
        <span aria-hidden>/</span>
        <span className="text-pulse-700 dark:text-pulse-300">{c.title}</span>
      </nav>
      <EthicsCourt caseData={c} />
    </div>
  );
}
