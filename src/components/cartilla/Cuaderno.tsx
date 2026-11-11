"use client";

import type { ReactNode } from "react";
import { useLocal } from "./storage";

// «Cuaderno digital»: convierte las actividades de escribir, listar o marcar de la
// cartilla en campos que se llenan en pantalla. Lo escrito se guarda solo en el
// dispositivo. Interpreta las distintas formas en que la cartilla describe sus campos
// (tablas, listas, preguntas por momento, casillas, selectores…).

type Valores = Record<string, string | boolean>;
type Item = Record<string, unknown>;

const asArray = (spec: unknown): unknown[] => (Array.isArray(spec) ? spec : spec ? [spec] : []);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export function tieneCuaderno(tipo: string, spec: unknown): boolean {
  if (tipo === "sopa_letras") return false;
  return asArray(spec).length > 0;
}

export default function Cuaderno({ id, tipo, spec }: { id: string; tipo: string; spec: unknown }) {
  const [vals, setVals] = useLocal<Valores>(`cuaderno-${id}`, {});
  const set = (k: string, v: string | boolean) => setVals((p) => ({ ...p, [k]: v }));
  const text = (k: string) => (typeof vals[k] === "string" ? (vals[k] as string) : "");

  const area = (k: string, label: string, placeholder?: string) => (
    <label className="cq-field" key={k}>
      <span>{label}</span>
      <textarea rows={2} value={text(k)} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </label>
  );

  const check = (k: string, label: string) => (
    <label className="cq-check" key={k}>
      <input type="checkbox" checked={vals[k] === true} onChange={(e) => set(k, e.target.checked)} />
      <span>{label}</span>
    </label>
  );

  const tabla = (k: string, columnas: string[], filas: number, ejemplo?: Record<string, string>) => (
    <div className="table-wrap" key={k}>
      <table className="data-table cq-table">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ejemplo && (
            <tr className="ejemplo">
              {columnas.map((c) => (
                <td key={c}>{ejemplo[c] ?? ""}</td>
              ))}
            </tr>
          )}
          {Array.from({ length: filas }, (_, r) => (
            <tr key={r}>
              {columnas.map((c, ci) => (
                <td key={c}>
                  <input aria-label={`${c}, fila ${r + 1}`} value={text(`${k}-${r}-${ci}`)} onChange={(e) => set(`${k}-${r}-${ci}`, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const render = (raw: unknown, i: number): ReactNode => {
    const k = `c${i}`;
    if (typeof raw === "string") return tipo === "checklist" ? check(k, raw) : area(k, raw);
    if (!raw || typeof raw !== "object") return null;
    const it = raw as Item;

    if (Array.isArray(it.columnas)) {
      const filas = typeof it.filas === "number" ? it.filas : 2;
      return (
        <div key={k}>
          {str(it.etiqueta) && <p className="cq-label">{str(it.etiqueta)}</p>}
          {tabla(k, strs(it.columnas), Math.min(Math.max(filas, 2), 4), it.ejemplo as Record<string, string> | undefined)}
        </div>
      );
    }
    if (Array.isArray(it.items)) {
      return (
        <fieldset className="cq-group" key={k}>
          {str(it.grupo) && <legend>{str(it.grupo)}</legend>}
          {strs(it.items).map((t, j) => check(`${k}-${j}`, t))}
        </fieldset>
      );
    }
    if (Array.isArray(it.preguntas)) {
      return (
        <fieldset className="cq-group" key={k}>
          {str(it.momento) && <legend>{str(it.momento)}</legend>}
          {strs(it.preguntas).map((q, j) => area(`${k}-${j}`, q))}
        </fieldset>
      );
    }
    if (it.tipo === "selector") {
      return (
        <div key={k}>
          <p className="cq-label">{str(it.etiqueta)}</p>
          <div className="chips" role="radiogroup" aria-label={str(it.etiqueta)}>
            {strs(it.opciones).map((o) => (
              <button key={o} type="button" role="radio" aria-checked={vals[k] === o} aria-pressed={vals[k] === o} onClick={() => set(k, o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (it.tipo === "lista" && typeof it.renglones === "number") {
      return (
        <fieldset className="cq-group" key={k}>
          <legend>{str(it.etiqueta)}</legend>
          {Array.from({ length: it.renglones }, (_, j) => (
            <input key={j} className="cq-line" aria-label={`${str(it.etiqueta)} ${j + 1}`} value={text(`${k}-${j}`)} onChange={(e) => set(`${k}-${j}`, e.target.value)} />
          ))}
        </fieldset>
      );
    }
    if (it.tipo === "respiracion") {
      return (
        <p className="cq-hint" key={k}>
          Acompaña este ejercicio con la respiración guiada del módulo Elegirme ({str(it.patron)}).
        </p>
      );
    }
    if (Array.isArray(it.campos)) {
      return (
        <fieldset className="cq-group" key={k}>
          {str(it.etiqueta) && <legend>{str(it.etiqueta)}</legend>}
          {strs(it.campos).map((c, j) => area(`${k}-${j}`, c))}
        </fieldset>
      );
    }
    if (str(it.campo)) return area(k, str(it.campo), str(it.ejemplo) ? `Por ejemplo: ${str(it.ejemplo)}` : undefined);
    if (str(it.sentido)) return area(k, str(it.sentido), str(it.texto));
    if (str(it.area)) return area(k, str(it.area), str(it.ejemplo) ? `Por ejemplo: ${str(it.ejemplo)}` : undefined);
    if (typeof it.cantidad === "number") {
      const cats = strs(it.categorias_sugeridas);
      return (
        <fieldset className="cq-group" key={k}>
          <legend>Mis {it.cantidad} cápsulas de bienestar</legend>
          {Array.from({ length: it.cantidad }, (_, j) => (
            <input key={j} className="cq-line" aria-label={`Cápsula ${j + 1}`} placeholder={cats[j] ? `Por ejemplo, ${cats[j]}` : undefined} value={text(`${k}-${j}`)} onChange={(e) => set(`${k}-${j}`, e.target.value)} />
          ))}
        </fieldset>
      );
    }
    if (Array.isArray(it.ejemplos)) return area(k, "Escribe aquí", `Por ejemplo: ${strs(it.ejemplos).join("; ")}`);
    if (str(it.etiqueta)) return area(k, str(it.etiqueta));
    return null;
  };

  const items = asArray(spec);
  const hayAlgo = Object.values(vals).some((v) => v === true || (typeof v === "string" && v.trim()));

  return (
    <div className="tool cuaderno">
      <p className="tool-q">Escríbelo aquí o en tu cuaderno</p>
      {items.map((it, i) => render(it, i))}
      <div className="row-btns">
        {hayAlgo && (
          <button type="button" className="btn ghost" onClick={() => setVals({})}>
            Borrar lo escrito
          </button>
        )}
        <p className="tool-note">Lo que escribes se guarda solo en este dispositivo.</p>
      </div>
    </div>
  );
}
