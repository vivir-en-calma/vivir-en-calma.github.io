"use client";

import { useState } from "react";

// Niveles y acciones tomados de la cartilla (Elegirme, ejercicio I, edición de noviembre de 2026).
const NIVELES = [
  { id: "rojo", etiqueta: "Frustrado(a) · Enojado(a)", color: "#D7342F", tipo: "enojo" },
  { id: "naranja", etiqueta: "Ansioso(a) · Preocupado(a)", color: "#EF7B2C", tipo: "enojo" },
  { id: "amarillo", etiqueta: "Motivado(a) · Empoderado(a)", color: "#F5C823", tipo: "bien" },
  { id: "verde", etiqueta: "Tranquilo(a) · Contento(a)", color: "#4BB04A", tipo: "bien" },
] as const;

const ACCIONES = {
  enojo: ["Respirar lento", "Cantar", "Caminar suavemente", "Hacer una pausa"],
  bajo: ["Escuchar una canción que te guste", "Recordar un momento agradable", "Moverte un poco", "Hablar con alguien de confianza"],
};

export default function Emociometro() {
  const [nivel, setNivel] = useState<(typeof NIVELES)[number] | null>(null);
  const [senal, setSenal] = useState<"acelerado" | "agotado" | null>(null);

  const acciones =
    senal === "agotado" ? ACCIONES.bajo : nivel?.tipo === "enojo" || senal === "acelerado" ? ACCIONES.enojo : null;

  return (
    <div className="tool emociometro">
      <p className="tool-q">¿Cómo está tu energía hoy?</p>
      <div className="termo" role="radiogroup" aria-label="Nivel de energía">
        {NIVELES.map((n) => (
          <button
            key={n.id}
            type="button"
            role="radio"
            aria-checked={nivel?.id === n.id}
            className={nivel?.id === n.id ? "on" : ""}
            style={{ ["--c" as string]: n.color }}
            onClick={() => {
              setNivel(n);
              setSenal(null);
            }}
          >
            <i aria-hidden="true" />
            {n.etiqueta}
          </button>
        ))}
      </div>

      {nivel && (
        <>
          <p className="tool-q">Pon atención a tu cuerpo: ¿cómo te sientes?</p>
          <div className="chips">
            <button type="button" aria-pressed={senal === "acelerado"} onClick={() => setSenal("acelerado")}>
              Acelerado(a): corazón rápido o respiración corta
            </button>
            <button type="button" aria-pressed={senal === "agotado"} onClick={() => setSenal("agotado")}>
              Agotado(a): pesadez en el cuerpo o poca energía
            </button>
          </div>
        </>
      )}

      {nivel && (acciones || nivel.tipo === "bien") && (
        <div className="tool-out" role="status">
          {acciones ? (
            <>
              <b>{senal === "agotado" ? "Elige una acción que te ayude a activarte con suavidad:" : "Elige una acción que te ayude a calmarte:"}</b>
              <ul>
                {acciones.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          ) : (
            <b>Qué bien. Anota qué te ayudó a sentirte así: eso también se aprende.</b>
          )}
        </div>
      )}
    </div>
  );
}
