"use client";

import { useProgreso } from "@/components/cartilla/storage";

/** Barra de avance general de la cartilla (se lee del dispositivo). */
export function AvanceGeneral({ total }: { total: number }) {
  const { hechos } = useProgreso();
  const listos = Math.min(hechos.length, total);
  return (
    <div className="v2-avance" aria-label={`Avance: ${listos} de ${total} módulos`}>
      <div className="v2-avance-barra">
        <span style={{ width: `${(listos / total) * 100}%` }} />
      </div>
      <p>{listos === total ? "¡Completaste toda la cartilla!" : `${listos} de ${total} módulos completados`}</p>
    </div>
  );
}

/** Sello de «Completado» en la tarjeta de un módulo. */
export function EstadoModulo({ id }: { id: string }) {
  const { hechos } = useProgreso();
  if (!hechos.includes(id)) return null;
  return <span className="v2-hecho">✓ Completado</span>;
}
