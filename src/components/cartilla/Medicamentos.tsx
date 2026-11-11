"use client";

import { useState } from "react";
import { useLocal } from "./storage";

// Acompañarme B: lista de medicamentos imprimible. Une la tabla de la cartilla
// (medicamento, para qué sirve, observaciones, preguntas) con los momentos del día
// del formato ISMP que trae la cartilla.
const MOMENTOS = ["Al levantarme", "Desayuno", "Almuerzo", "Por la tarde", "Cena", "Al acostarme"];

type Med = { nombre: string; para: string; momentos: boolean[]; observaciones: string; preguntas: string };
type Lista = { meds: Med[]; alergias: string; suplementos: string };

const VACIA: Lista = { meds: [], alergias: "", suplementos: "" };

export default function Medicamentos() {
  const [lista, setLista] = useLocal<Lista>("medicamentos", VACIA);
  const [nombre, setNombre] = useState("");
  const [para, setPara] = useState("");

  const agregar = () => {
    if (!nombre.trim()) return;
    setLista((l) => ({
      ...l,
      meds: [...l.meds, { nombre: nombre.trim(), para: para.trim(), momentos: MOMENTOS.map(() => false), observaciones: "", preguntas: "" }],
    }));
    setNombre("");
    setPara("");
  };

  const editar = (i: number, patch: Partial<Med>) =>
    setLista((l) => ({ ...l, meds: l.meds.map((m, j) => (j === i ? { ...m, ...patch } : m)) }));

  return (
    <div className="tool meds">
      <div className="meds-add">
        <label>
          Medicamento y dosis
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Losartán 50 mg" />
        </label>
        <label>
          ¿Para qué sirve?
          <input value={para} onChange={(e) => setPara(e.target.value)} placeholder="Ej.: controlar la presión" />
        </label>
        <button type="button" className="btn" onClick={agregar}>
          Agregar
        </button>
      </div>

      <div className="table-wrap">
        <table className="meds-table">
          <thead>
            <tr>
              <th scope="col">Medicamento</th>
              {MOMENTOS.map((m) => (
                <th scope="col" key={m}>
                  {m}
                </th>
              ))}
              <th scope="col">Duración / observaciones</th>
              <th scope="col">Preguntas para mi equipo de salud</th>
              <th scope="col" className="no-print">
                <span className="sr-only">Quitar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lista.meds.length === 0 && (
              <tr>
                <td colSpan={MOMENTOS.length + 4} className="empty">
                  Agrega tu primer medicamento. No te preocupes si no recuerdas toda la información.
                </td>
              </tr>
            )}
            {lista.meds.map((m, i) => (
              <tr key={i}>
                <th scope="row">
                  {m.nombre}
                  {m.para && <small>{m.para}</small>}
                </th>
                {MOMENTOS.map((mo, j) => (
                  <td key={mo}>
                    <input
                      type="checkbox"
                      aria-label={`${m.nombre}: ${mo}`}
                      checked={m.momentos[j]}
                      onChange={(e) => editar(i, { momentos: m.momentos.map((v, k) => (k === j ? e.target.checked : v)) })}
                    />
                  </td>
                ))}
                <td>
                  <input aria-label={`Observaciones de ${m.nombre}`} value={m.observaciones} onChange={(e) => editar(i, { observaciones: e.target.value })} />
                </td>
                <td>
                  <input aria-label={`Preguntas sobre ${m.nombre}`} value={m.preguntas} onChange={(e) => editar(i, { preguntas: e.target.value })} />
                </td>
                <td className="no-print">
                  <button type="button" className="x" aria-label={`Quitar ${m.nombre}`} onClick={() => setLista((l) => ({ ...l, meds: l.meds.filter((_, k) => k !== i) }))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="meds-extra">
        <label>
          Alergias que conozco
          <textarea rows={2} value={lista.alergias} onChange={(e) => setLista((l) => ({ ...l, alergias: e.target.value }))} />
        </label>
        <label>
          Suplementos, vitaminas o plantas medicinales
          <textarea rows={2} value={lista.suplementos} onChange={(e) => setLista((l) => ({ ...l, suplementos: e.target.value }))} />
        </label>
      </div>
      <div className="row-btns no-print">
        <button type="button" className="btn" onClick={() => window.print()}>
          Imprimir o guardar en PDF
        </button>
        <p className="tool-note">Lleva esta lista a tu próxima consulta. Se guarda solo en este dispositivo.</p>
      </div>
    </div>
  );
}
