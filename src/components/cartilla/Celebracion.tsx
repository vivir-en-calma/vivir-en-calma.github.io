"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const COLORES = ["#1BA19A", "#50BFDE", "#FBEC4A", "#1E95D4"];

/** Celebración al terminar un módulo: una bandada de libélulas y el siguiente paso. */
export default function Celebracion({
  verbo,
  siguiente,
  onClose,
}: {
  verbo: string;
  siguiente?: { id: string; verbo: string };
  onClose: () => void;
}) {
  const primero = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    primero.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="celebra" role="dialog" aria-modal="true" aria-labelledby="celebra-t">
      <div className="bandada" aria-hidden="true">
        {Array.from({ length: 14 }, (_, k) => {
          const a = (k / 14) * Math.PI * 2;
          const r = 220 + (k % 3) * 70;
          return (
            <svg
              key={k}
              viewBox="0 0 40 40"
              width="34"
              height="34"
              style={{
                ["--x" as string]: `${Math.cos(a) * r}px`,
                ["--y" as string]: `${Math.sin(a) * r}px`,
                ["--r" as string]: `${(k * 47) % 360}deg`,
              }}
            >
              <ellipse cx="11" cy="14" rx="10" ry="4" transform="rotate(-25 11 14)" fill={COLORES[k % 4]} />
              <ellipse cx="29" cy="14" rx="10" ry="4" transform="rotate(25 29 14)" fill="#28265B" />
              <rect x="18.5" y="10" width="3" height="24" rx="1.5" fill="#1D4285" />
            </svg>
          );
        })}
      </div>
      <div className="celebra-card">
        <p className="eyebrow">Módulo completado</p>
        <h2 id="celebra-t">¡Terminaste {verbo}!</h2>
        <p>Cada paso cuenta. Sigue el vuelo de la libélula.</p>
        <div className="celebra-btns">
          {siguiente ? (
            <Link ref={primero} className="btn" href={`/${siguiente.id}/`}>
              Seguir con {siguiente.verbo} →
            </Link>
          ) : (
            <Link ref={primero} className="btn" href="/">
              Ver mi recorrido completo
            </Link>
          )}
          <Link className="btn ghost" href="/">
            Volver al mapa
          </Link>
        </div>
      </div>
    </div>
  );
}
