"use client";

import Link from "next/link";
import { useProgreso } from "./storage";
import { ilustracion } from "@/lib/cartilla";

type Item = { id: string; numero: number; verbo: string; descripcion?: string; icono: string; color: string };

const PASO = 128; // separación vertical entre módulos (px)
const TOP = 70;
const X = (i: number) => (i % 2 === 0 ? 24 : 76); // posición horizontal en %

/** Mapa de la cartilla como un camino: la libélula marca el módulo que sigue. */
export default function MapaVuelo({ items }: { items: Item[] }) {
  const { hechos } = useProgreso();
  const total = items.length;
  const listos = items.filter((m) => hechos.includes(m.id)).length;
  const actual = items.findIndex((m) => !hechos.includes(m.id));
  const alto = TOP * 2 + PASO * (total - 1);

  // Camino en coordenadas 0-100 (ancho) x alto (px).
  let d = `M ${X(0)} ${TOP}`;
  for (let i = 1; i < total; i++) {
    const y0 = TOP + PASO * (i - 1);
    const y1 = TOP + PASO * i;
    const mid = (y0 + y1) / 2;
    d += ` C ${X(i - 1)} ${mid}, ${X(i)} ${mid}, ${X(i)} ${y1}`;
  }
  // Tramo recorrido: hasta el módulo actual (o todo, si ya terminó).
  const hasta = actual < 0 ? total - 1 : actual;
  let dHecho = `M ${X(0)} ${TOP}`;
  for (let i = 1; i <= hasta; i++) {
    const y0 = TOP + PASO * (i - 1);
    const y1 = TOP + PASO * i;
    const mid = (y0 + y1) / 2;
    dHecho += ` C ${X(i - 1)} ${mid}, ${X(i)} ${mid}, ${X(i)} ${y1}`;
  }

  return (
    <>
      <div className="progress" aria-label={`Avance: ${listos} de ${total} módulos`}>
        <div className="bar">
          <span style={{ width: `${(listos / total) * 100}%` }} />
        </div>
        <p>
          {listos === total ? "¡Completaste toda la cartilla!" : `${listos} de ${total} módulos completados`}
        </p>
      </div>

      <div className="mapa-vuelo" style={{ height: alto }}>
        <svg className="camino" viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} className="c-base" vectorEffect="non-scaling-stroke" />
          {(listos > 0 || actual > 0) && <path d={dHecho} className="c-hecho" vectorEffect="non-scaling-stroke" />}
        </svg>
        <ol>
          {items.map((m, i) => {
            const hecho = hechos.includes(m.id);
            const esActual = i === actual;
            const izq = i % 2 === 0;
            return (
              <li
                key={m.id}
                className={`nodo ${izq ? "izq" : "der"}${hecho ? " hecho" : ""}${esActual ? " actual" : ""}`}
                style={{ top: TOP + PASO * i, left: `${X(i)}%`, ["--m" as string]: m.color }}
              >
                <Link href={`/${m.id}/`} aria-label={`Módulo ${m.numero}: ${m.verbo}${hecho ? ", completado" : esActual ? ", sigue aquí" : ""}`}>
                  <span className="punto" aria-hidden="true">
                    <img src={ilustracion(m.icono)} alt="" />
                    <i>{hecho ? "✓" : m.numero}</i>
                  </span>
                  <span className="etiqueta">
                    <b>{m.verbo}</b>
                    <small>{esActual ? "Sigue aquí" : hecho ? "Completado" : m.descripcion}</small>
                  </span>
                </Link>
                {esActual && (
                  <img className="libelula" src={ilustracion("libelula")} alt="" width={56} height={53} />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
