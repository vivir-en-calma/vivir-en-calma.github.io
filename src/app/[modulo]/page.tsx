import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModuleView from "@/components/cartilla/ModuleView";
import { getModulo, modulos } from "@/lib/cartilla";

// Sitio estático: se genera una página por módulo durante la compilación.
export const dynamicParams = false;

export function generateStaticParams() {
  return modulos.map((m) => ({ modulo: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/[modulo]">): Promise<Metadata> {
  const { modulo } = await params;
  const m = getModulo(modulo);
  return { title: m ? `${m.verbo} · Vivir en calma` : "Vivir en calma" };
}

export default async function ModuloPage({ params }: PageProps<"/[modulo]">) {
  const { modulo } = await params;
  const i = modulos.findIndex((m) => m.id === modulo);
  if (i < 0) notFound();
  const anterior = modulos[i - 1];
  const siguiente = modulos[i + 1];
  return (
    <ModuleView
      modulo={modulos[i]}
      anterior={anterior && { id: anterior.id, verbo: anterior.verbo }}
      siguiente={siguiente && { id: siguiente.id, verbo: siguiente.verbo }}
    />
  );
}
