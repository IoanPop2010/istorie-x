import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMap, getUnit, getUnits } from "@/lib/content";
import { parseBody } from "@/lib/markup";
import { Projector } from "@/components/Projector";

export const dynamicParams = false;

export function generateStaticParams() {
  return getUnits().map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const u = getUnit((await params).slug);
  return { title: u ? `Proiecție: ${u.title}` : "Proiecție", robots: { index: false } };
}

export default async function ProjectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const unit = getUnit((await params).slug);
  if (!unit) notFound();
  const map = unit.map ? getMap(unit.map.id) : undefined;
  // Exercițiile pe hărți diferite de harta lecției nu se proiectează.
  const exercises = unit.exercises.filter((e) => e.kind !== "harta" || e.map === unit.map?.id);
  return (
    <Projector
      slug={unit.slug}
      title={unit.title}
      summary={unit.summary}
      sections={parseBody(unit.body)}
      sources={unit.sources}
      scheme={unit.scheme}
      map={map}
      mapCaption={unit.map?.caption}
      highlight={unit.map?.highlight}
      exercises={exercises}
    />
  );
}
