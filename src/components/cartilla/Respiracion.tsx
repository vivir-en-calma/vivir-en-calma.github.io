"use client";

import { useEffect, useRef, useState } from "react";

// Elegirme A: «Cuenta lentamente hasta cinco mientras respiras suave: inhalas por la
// nariz y exhalas por la boca». También ofrece el ritmo 4-4 del ejercicio E.
const RITMOS = {
  cinco: { nombre: "Contar hasta 5", inhala: 5, exhala: 5 },
  cuatro: { nombre: "Ritmo 4-4", inhala: 4, exhala: 4 },
} as const;
const CICLOS = 5;

export default function Respiracion() {
  const [ritmo, setRitmo] = useState<keyof typeof RITMOS>("cinco");
  const [fase, setFase] = useState<"listo" | "inhala" | "exhala" | "fin">("listo");
  const [cuenta, setCuenta] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const parar = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => parar, []);

  const empezar = () => {
    parar();
    const r = RITMOS[ritmo];
    let ciclo = 0;
    let f: "inhala" | "exhala" = "inhala";
    let n = 1;
    setFase("inhala");
    setCuenta(1);
    timer.current = setInterval(() => {
      const limite = f === "inhala" ? r.inhala : r.exhala;
      if (n < limite) {
        n += 1;
        setCuenta(n);
        return;
      }
      if (f === "inhala") {
        f = "exhala";
      } else {
        f = "inhala";
        ciclo += 1;
        if (ciclo >= CICLOS) {
          parar();
          setFase("fin");
          return;
        }
      }
      n = 1;
      setFase(f);
      setCuenta(1);
    }, 1000);
  };

  const enCurso = fase === "inhala" || fase === "exhala";
  const r = RITMOS[ritmo];

  return (
    <div className="tool respiracion">
      <div className="chips" role="radiogroup" aria-label="Ritmo de respiración">
        {(Object.keys(RITMOS) as Array<keyof typeof RITMOS>).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={ritmo === k} aria-pressed={ritmo === k} disabled={enCurso} onClick={() => setRitmo(k)}>
            {RITMOS[k].nombre}
          </button>
        ))}
      </div>
      <div className="breath-stage" aria-live="polite">
        <div
          className={`breath-circle ${fase}`}
          style={{ transitionDuration: `${fase === "inhala" ? r.inhala : r.exhala}s` }}
        >
          {fase === "listo" && "Listo"}
          {enCurso && (
            <>
              <b>{cuenta}</b>
              <span>{fase === "inhala" ? "Inhala por la nariz" : "Exhala por la boca"}</span>
            </>
          )}
          {fase === "fin" && "¡Muy bien!"}
        </div>
      </div>
      <button type="button" className="btn" onClick={enCurso ? () => { parar(); setFase("listo"); } : empezar}>
        {enCurso ? "Detener" : fase === "fin" ? "Respirar otra vez" : `Empezar (${CICLOS} respiraciones)`}
      </button>
      <p className="tool-note">La idea no es «borrar» la emoción, sino darte unos segundos para tener serenidad y elegir qué hacer.</p>
    </div>
  );
}
