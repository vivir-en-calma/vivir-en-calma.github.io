"use client";

import { useState } from "react";
import { useLocal } from "./storage";

// Escucharme A (colores por emoción frente a una situación) y B (sensaciones de la
// última semana). Colores y situaciones tomados de la cartilla.
const COLORES = [
  { id: "rojo", nombre: "Rojo", emociones: "rabia, enojo o frustración", hex: "#E5533D" },
  { id: "amarillo", nombre: "Amarillo", emociones: "ansiedad, miedo o preocupación", hex: "#F2C230" },
  { id: "azul", nombre: "Azul", emociones: "tristeza o desánimo", hex: "#4F8FE0" },
  { id: "verde", nombre: "Verde", emociones: "calma, tranquilidad o alivio", hex: "#46B97A" },
];
const SENSACIONES = ["tensión", "cansancio", "dolor", "hormigueo", "calor", "pesadez", "otro cambio"];
const SITUACIONES = [
  "Vas a tu control médico o a tomarte exámenes.",
  "Te restringen un alimento que te gusta mucho.",
  "No te entregan un medicamento en la farmacia.",
];
const ZONAS = [
  { id: "cabeza", nombre: "Cabeza" },
  { id: "garganta", nombre: "Garganta" },
  { id: "hombros", nombre: "Hombros y espalda" },
  { id: "pecho", nombre: "Pecho y corazón" },
  { id: "estomago", nombre: "Estómago" },
  { id: "brazos", nombre: "Brazos y manos" },
  { id: "piernas", nombre: "Piernas y pies" },
];

type Marcas = Record<string, string>;

export default function MapaCorporal({ modo }: { modo: "emociones" | "sensaciones" }) {
  const [situacion, setSituacion] = useState(0);
  const [pincel, setPincel] = useState(modo === "emociones" ? COLORES[0].id : SENSACIONES[0]);
  const [marcas, setMarcas] = useLocal<Marcas>(`mapa-${modo}-${modo === "emociones" ? situacion : "semana"}`, {});

  const tocar = (zona: string) =>
    setMarcas((prev) => {
      const next = { ...prev };
      if (next[zona] === pincel) delete next[zona];
      else next[zona] = pincel;
      return next;
    });

  const colorDe = (zona: string) => {
    const v = marcas[zona];
    if (!v) return "#EEF3FA";
    if (modo === "emociones") return COLORES.find((c) => c.id === v)?.hex ?? "#EEF3FA";
    return "#9BB8E8";
  };

  const zonaProps = (id: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": `${ZONAS.find((z) => z.id === id)?.nombre}${marcas[id] ? `: ${marcas[id]}` : ""}`,
    onClick: () => tocar(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tocar(id);
      }
    },
    fill: colorDe(id),
    className: "zona",
  });

  const resumen = ZONAS.filter((z) => marcas[z.id]).map((z) => `${z.nombre}: ${marcas[z.id]}`);

  return (
    <div className="tool mapa">
      {modo === "emociones" && (
        <div className="chips" role="radiogroup" aria-label="Situación">
          {SITUACIONES.map((s, i) => (
            <button key={s} type="button" role="radio" aria-checked={situacion === i} aria-pressed={situacion === i} onClick={() => setSituacion(i)}>
              Situación {i + 1}: {s}
            </button>
          ))}
        </div>
      )}
      <div className="mapa-grid">
        <svg viewBox="0 0 200 420" className="silueta" aria-label="Silueta del cuerpo: toca una zona para marcarla">
          <g stroke="#9AAEC9" strokeWidth="2">
            <circle cx="100" cy="44" r="30" {...zonaProps("cabeza")} />
            <rect x="86" y="74" width="28" height="22" rx="8" {...zonaProps("garganta")} />
            <path d="M44 112 C70 92 130 92 156 112 L150 134 L50 134 Z" {...zonaProps("hombros")} />
            <path d="M54 134 H146 L142 196 H58 Z" {...zonaProps("pecho")} />
            <path d="M58 196 H142 L138 260 H62 Z" {...zonaProps("estomago")} />
            <path d="M44 116 L22 250 L40 256 L58 142 Z M156 116 L178 250 L160 256 L142 142 Z" {...zonaProps("brazos")} />
            <path d="M64 262 L60 410 L94 410 L98 268 Z M136 262 L140 410 L106 410 L102 268 Z" {...zonaProps("piernas")} />
          </g>
        </svg>
        <div>
          <p className="tool-q">{modo === "emociones" ? "Elige el color de la emoción y toca dónde la sientes:" : "Elige la sensación y toca dónde la sentiste esta semana:"}</p>
          <div className="chips col" role="radiogroup" aria-label={modo === "emociones" ? "Color de la emoción" : "Sensación"}>
            {modo === "emociones"
              ? COLORES.map((c) => (
                  <button key={c.id} type="button" role="radio" aria-checked={pincel === c.id} aria-pressed={pincel === c.id} onClick={() => setPincel(c.id)}>
                    <i className="dot" style={{ background: c.hex }} aria-hidden="true" />
                    <b>{c.nombre}</b> {c.emociones}
                  </button>
                ))
              : SENSACIONES.map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={pincel === s} aria-pressed={pincel === s} onClick={() => setPincel(s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
          </div>
          <div className="tool-out" role="status">
            {resumen.length ? (
              <>
                <b>Lo que marcaste:</b>
                <ul>
                  {resumen.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            ) : (
              "Toca una zona del cuerpo para marcarla."
            )}
          </div>
          {resumen.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => setMarcas({})}>
              Borrar el mapa
            </button>
          )}
        </div>
      </div>
      <p className="tool-note">Lo que marcas se guarda solo en este dispositivo.</p>
    </div>
  );
}
