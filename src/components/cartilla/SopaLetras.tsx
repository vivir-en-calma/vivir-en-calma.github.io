"use client";

import { useMemo, useState } from "react";
import type { Sopa } from "@/lib/cartilla";
import { useLocal } from "./storage";

// Elegirme D: sopa de letras de la cartilla. Se toca la primera y la última letra de una
// palabra (en cualquier dirección); si coincide con una de la lista, queda marcada.
type Celda = [number, number];
type Hallazgo = { palabra: string; celdas: Celda[] };

function recorrido(a: Celda, b: Celda): Celda[] | null {
  const dr = Math.sign(b[0] - a[0]);
  const dc = Math.sign(b[1] - a[1]);
  const largo = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  // Solo filas, columnas o diagonales exactas.
  if (a[0] !== b[0] && a[1] !== b[1] && Math.abs(b[0] - a[0]) !== Math.abs(b[1] - a[1])) return null;
  return Array.from({ length: largo + 1 }, (_, i) => [a[0] + dr * i, a[1] + dc * i] as Celda);
}

export default function SopaLetras({ id, sopa }: { id: string; sopa: Sopa }) {
  const [hallazgos, setHallazgos] = useLocal<Hallazgo[]>(`sopa-${id}`, []);
  const [inicio, setInicio] = useState<Celda | null>(null);
  const [aviso, setAviso] = useState("");
  const filas = sopa.cuadricula;

  const marcadas = useMemo(() => {
    const s = new Set<string>();
    for (const h of hallazgos) for (const [r, c] of h.celdas) s.add(`${r}-${c}`);
    return s;
  }, [hallazgos]);
  const encontradas = new Set(hallazgos.map((h) => h.palabra));

  const tocar = (celda: Celda) => {
    if (!inicio) {
      setInicio(celda);
      setAviso(`Primera letra: ${filas[celda[0]][celda[1]]}. Ahora toca la última letra de la palabra.`);
      return;
    }
    const camino = recorrido(inicio, celda);
    setInicio(null);
    if (!camino || camino.length < 2) {
      setAviso("Toca la primera y la última letra de una palabra en línea recta.");
      return;
    }
    const letras = camino.map(([r, c]) => filas[r][c]).join("");
    const palabra = sopa.palabras.find((p) => p === letras || p === [...letras].reverse().join(""));
    if (!palabra) {
      setAviso(`«${letras}» no está en la lista. Intenta de nuevo.`);
      return;
    }
    if (encontradas.has(palabra)) {
      setAviso(`Ya habías encontrado ${palabra}.`);
      return;
    }
    setHallazgos((h) => [...h, { palabra, celdas: camino }]);
    setAviso(
      encontradas.size + 1 === sopa.palabras.length ? "¡Encontraste todas las palabras!" : `¡Encontraste ${palabra}!`,
    );
  };

  return (
    <div className="tool sopa">
      <p className="tool-q">{sopa.titulo}</p>
      <p className="tool-note">Toca la primera letra de una palabra y luego la última. Pueden estar en horizontal, vertical o diagonal.</p>
      <div className="sopa-wrap">
        <div className="sopa-grid" role="grid" aria-label="Sopa de letras" style={{ ["--cols" as string]: filas[0].length }}>
          {filas.map((fila, r) => (
            <div role="row" key={r} className="sopa-fila">
              {[...fila].map((letra, c) => {
                const k = `${r}-${c}`;
                const esInicio = inicio?.[0] === r && inicio?.[1] === c;
                return (
                  <button
                    key={k}
                    type="button"
                    role="gridcell"
                    className={`${marcadas.has(k) ? "ok" : ""}${esInicio ? " ini" : ""}`}
                    aria-label={`${letra}, fila ${r + 1}, columna ${c + 1}`}
                    aria-pressed={esInicio}
                    onClick={() => tocar([r, c])}
                  >
                    {letra}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <ul className="sopa-palabras" aria-label="Palabras para buscar">
          {sopa.palabras.map((p) => (
            <li key={p} className={encontradas.has(p) ? "ok" : ""}>
              {encontradas.has(p) ? "✓ " : ""}
              {p}
            </li>
          ))}
        </ul>
      </div>
      <p className="sopa-aviso" role="status" aria-live="polite">
        {aviso || `${encontradas.size} de ${sopa.palabras.length} palabras`}
      </p>
      {hallazgos.length > 0 && (
        <button type="button" className="btn ghost" onClick={() => setHallazgos([])}>
          Empezar de nuevo
        </button>
      )}
    </div>
  );
}
