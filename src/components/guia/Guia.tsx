"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { withBase } from "@/lib/paths";
import "./guia.css";

// Recorrido guiado (tutorial interactivo): resalta partes de la página una por una y
// SurOcsito explica para qué sirven. Algunos pasos piden hacer algo (una «tarea») y
// avanzan solos cuando la persona lo hace. Se ofrece la primera vez que se visita
// cada página y se puede repetir con el botón de ayuda (evento EVENTO_INICIAR).

export type PasoGuia = {
  /** Selector del elemento a resaltar; si no existe en la página, el paso se omite. */
  objetivo: string;
  titulo: string;
  texto: string;
  /** Algo que la persona debe hacer; el paso avanza cuando se emite `evento`. */
  tarea?: { texto: string; evento: string };
};

export const EVENTO_INICIAR = "libelula-guia";
const EVENTO_TAREA = "libelula-guia-tarea";

/** Avisa a la guía que la persona hizo una tarea (por ejemplo, «pasó de paso»). */
export function avisarGuia(evento: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_TAREA, { detail: evento }));
}

const clave = (id: string) => `libelula:guia-${id}`;

function yaVista(id: string) {
  try {
    return window.localStorage.getItem(clave(id)) !== null;
  } catch {
    return true; // sin almacenamiento no insistimos en cada visita
  }
}

function marcarVista(id: string) {
  try {
    window.localStorage.setItem(clave(id), "1");
  } catch {
    /* modo privado: no pasa nada */
  }
}

function llevarA(el: Element) {
  const r = el.getBoundingClientRect();
  const offset = -Math.max(90, (window.innerHeight - Math.min(r.height, window.innerHeight * 0.5)) / 2 - 60);
  window.scrollTo({ top: window.scrollY + r.top + offset, behavior: "smooth" });
}

type Lado = "arriba" | "abajo" | "izq" | "der" | "ninguno";

export default function Guia({
  id,
  pasos,
  bienvenida,
  final,
  oscuro = false,
}: {
  id: string;
  pasos: PasoGuia[];
  bienvenida: { titulo: string; texto: string };
  final: { titulo: string; texto: string; accion?: { texto: string; href: string } };
  /** La página es de fondo oscuro (cambia el borde del resalte). */
  oscuro?: boolean;
}) {
  const [fase, setFase] = useState<"cerrada" | "invitacion" | "paso" | "final">("cerrada");
  const [lista, setLista] = useState<PasoGuia[]>([]);
  const [i, setI] = useState(0);
  const [hecha, setHecha] = useState(false);
  const [visible, setVisible] = useState(false);
  const [senalar, setSenalar] = useState(false);
  const finSenal = useCallback(() => setSenalar(false), []);
  const foco = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const flecha = useRef<HTMLSpanElement>(null);
  const siguienteBtn = useRef<HTMLButtonElement>(null);

  const paso = fase === "paso" ? lista[i] : undefined;

  // Invitación automática en la primera visita.
  useEffect(() => {
    if (yaVista(id)) return;
    // Si la cartilla se está armando (entrada del módulo), espera a que termine.
    let t = 0;
    const invitar = () => {
      t = window.setTimeout(() => (document.querySelector(".lb-entrada") ? invitar() : setFase("invitacion")), 1400);
    };
    invitar();
    return () => window.clearTimeout(t);
  }, [id]);

  const empezar = useCallback(() => {
    marcarVista(id);
    setLista(pasos.filter((p) => document.querySelector(p.objetivo)));
    setI(0);
    setFase("paso");
  }, [id, pasos]);

  const cerrar = useCallback(
    (terminada: boolean) => {
      marcarVista(id);
      setVisible(false);
      setFase(terminada ? "final" : "cerrada");
    },
    [id],
  );

  // Botón de ayuda: repetir la guía.
  useEffect(() => {
    const onIniciar = () => setFase("invitacion");
    window.addEventListener(EVENTO_INICIAR, onIniciar);
    return () => window.removeEventListener(EVENTO_INICIAR, onIniciar);
  }, []);

  // Mientras la guía está abierta, otras teclas de la página (flechas) no actúan.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-guia", fase !== "cerrada");
    return () => document.documentElement.removeAttribute("data-guia");
  }, [fase]);

  const ir = useCallback(
    (n: number) => {
      if (n < 0) return;
      if (n >= lista.length) return cerrar(true);
      setVisible(false);
      setHecha(false);
      setI(n);
    },
    [lista.length, cerrar],
  );

  // Ubica el resalte y la tarjeta junto al elemento.
  const ubicar = useCallback(() => {
    if (!paso || !foco.current || !tarjeta.current || !flecha.current) return;
    const el = document.querySelector(paso.objetivo);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 10;
    Object.assign(foco.current.style, {
      left: `${r.left - pad}px`,
      top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`,
      height: `${r.height + pad * 2}px`,
    });
    const cw = tarjeta.current.offsetWidth;
    const ch = tarjeta.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = 16;
    const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
    let x: number;
    let y: number;
    let lado: Lado;
    if (vw < 640) {
      x = m;
      if (r.bottom + ch + 30 < vh) [y, lado] = [r.bottom + 22, "arriba"];
      else if (r.top - ch - 30 > 0) [y, lado] = [r.top - ch - 22, "abajo"];
      else [y, lado] = [vh - ch - m, "ninguno"];
    } else if (r.right + cw + 40 < vw) {
      [x, y, lado] = [r.right + 26, limitar(r.top + r.height / 2 - ch / 2, m, vh - ch - m), "izq"];
    } else if (r.left - cw - 40 > 0) {
      [x, y, lado] = [r.left - cw - 26, limitar(r.top + r.height / 2 - ch / 2, m, vh - ch - m), "der"];
    } else if (r.bottom + ch + 30 < vh) {
      [x, y, lado] = [limitar(r.left + r.width / 2 - cw / 2, m, vw - cw - m), r.bottom + 24, "arriba"];
    } else if (r.top - ch - 30 > 0) {
      [x, y, lado] = [limitar(r.left + r.width / 2 - cw / 2, m, vw - cw - m), r.top - ch - 24, "abajo"];
    } else {
      [x, y, lado] = [limitar(r.left + r.width / 2 - cw / 2, m, vw - cw - m), vh - ch - m, "ninguno"];
    }
    tarjeta.current.style.left = `${x}px`;
    tarjeta.current.style.top = `${y}px`;
    const a = flecha.current.style;
    a.display = lado === "ninguno" ? "none" : "block";
    a.left = a.top = "";
    if (lado === "izq" || lado === "der") {
      a.left = lado === "izq" ? "-8px" : `${cw - 10}px`;
      a.top = `${limitar(r.top + r.height / 2 - y - 9, 20, ch - 30)}px`;
    } else if (lado !== "ninguno") {
      a.top = lado === "arriba" ? "-8px" : `${ch - 10}px`;
      a.left = `${limitar(r.left + r.width / 2 - x - 9, 20, cw - 30)}px`;
    }
  }, [paso]);

  // Al cambiar de paso: llevar el elemento a la vista y mostrar la tarjeta.
  useEffect(() => {
    if (!paso) return;
    const el = document.querySelector(paso.objetivo);
    if (el) llevarA(el);
    const t = window.setTimeout(() => {
      ubicar();
      setVisible(true);
      siguienteBtn.current?.focus({ preventScroll: true });
    }, 650);
    return () => window.clearTimeout(t);
  }, [paso, ubicar]);

  useLayoutEffect(() => {
    if (!paso) return;
    window.addEventListener("scroll", ubicar, { passive: true });
    window.addEventListener("resize", ubicar);
    return () => {
      window.removeEventListener("scroll", ubicar);
      window.removeEventListener("resize", ubicar);
    };
  }, [paso, ubicar]);

  // Tareas: cuando la persona hace lo pedido, se celebra y se avanza.
  useEffect(() => {
    if (!paso?.tarea) return;
    const evento = paso.tarea.evento;
    let t = 0;
    const onTarea = (e: Event) => {
      if ((e as CustomEvent).detail !== evento) return;
      setHecha(true);
      t = window.setTimeout(() => ir(i + 1), 1400);
    };
    window.addEventListener(EVENTO_TAREA, onTarea);
    return () => {
      window.removeEventListener(EVENTO_TAREA, onTarea);
      window.clearTimeout(t);
    };
  }, [paso, i, ir]);

  useEffect(() => {
    if (fase === "cerrada") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar(false);
      if (fase !== "paso") return;
      if (e.key === "ArrowRight" && (!paso?.tarea || hecha)) ir(i + 1);
      if (e.key === "ArrowLeft") ir(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fase, paso, hecha, i, ir, cerrar]);

  if (fase === "cerrada") return senalar ? <SenalarAyuda onFin={finSenal} /> : null;

  const oso = <img src={withBase("/img/oso.png")} alt="" width={720} height={482} />;

  if (fase === "invitacion" || fase === "final") {
    const inv = fase === "invitacion";
    const c = inv ? bienvenida : final;
    return (
      <div className="g-modal" role="dialog" aria-modal="true" aria-labelledby="g-modal-t">
        <div className="g-modal-card">
          {oso}
          <h2 id="g-modal-t">{c.titulo}</h2>
          <p>{c.texto}</p>
          <div className="g-modal-btns">
            {inv ? (
              <>
                <button type="button" className="g-btn" onClick={empezar} autoFocus>
                  Sí, muéstrame
                </button>
                <button
                  type="button"
                  className="g-btn ghost"
                  onClick={() => {
                    cerrar(false);
                    setSenalar(true);
                  }}
                >
                  Prefiero explorar por mi cuenta
                </button>
              </>
            ) : (
              <>
                {final.accion && (
                  <a className="g-btn" href={withBase(final.accion.href)}>
                    {final.accion.texto}
                  </a>
                )}
                <button type="button" className={`g-btn${final.accion ? " ghost" : ""}`} onClick={() => setFase("cerrada")} autoFocus={!final.accion}>
                  Seguir explorando
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!paso) return null;
  const bloqueado = !!paso.tarea && !hecha;

  return (
    <>
      {!paso.tarea && <div className="g-bloqueo" onClick={() => ir(i + 1)} aria-hidden="true" />}
      <div ref={foco} className={`g-foco${visible ? " on" : ""}${oscuro ? " oscuro" : ""}`} aria-hidden="true" />
      <div ref={tarjeta} className={`g-tarjeta${visible ? " on" : ""}`} role="dialog" aria-label="Recorrido guiado" aria-live="polite">
        <span ref={flecha} className="g-flecha" />
        <div className="g-cab">
          <span className="g-av">
            <img src={withBase("/img/oso-cara.png")} alt="" width={240} height={240} />
          </span>
          <div>
            <span className="g-num">
              Paso {i + 1} de {lista.length}
            </span>
            <h3>{paso.titulo}</h3>
          </div>
        </div>
        <p>{paso.texto}</p>
        {paso.tarea && (
          <div className={`g-tarea${hecha ? " ok" : ""}`}>
            <i aria-hidden="true">✓</i>
            <span>{hecha ? "¡Muy bien!" : paso.tarea.texto}</span>
          </div>
        )}
        <div className="g-pie">
          <div className="g-puntos" aria-hidden="true">
            {lista.map((_, k) => (
              <span key={k} className={k === i ? "on" : ""} />
            ))}
          </div>
          <button type="button" className="g-saltar" onClick={() => cerrar(false)}>
            Saltar
          </button>
          {i > 0 && (
            <button type="button" className="g-atras" aria-label="Paso anterior" onClick={() => ir(i - 1)}>
              ←
            </button>
          )}
          <button ref={siguienteBtn} type="button" className="g-sig" disabled={bloqueado} onClick={() => ir(i + 1)}>
            {i === lista.length - 1 ? "Terminar" : "Siguiente"}
          </button>
        </div>
      </div>
    </>
  );
}

/** Botón para volver a ver la guía de la página. */
/**
 * Cuando la persona prefiere explorar sola, SurOcsito vuela hasta el botón de ayuda y
 * lo señala tres veces, para que sepa dónde volver a encontrar la guía.
 */
function SenalarAyuda({ onFin }: { onFin: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const boton = document.querySelector<HTMLElement>(".c-ayuda");
    if (!boton) return onFin();
    const ubicar = () => {
      const r = boton.getBoundingClientRect();
      setPos({ top: r.bottom + 10, left: Math.min(r.left + r.width / 2, window.innerWidth - 24) });
    };
    ubicar();
    boton.classList.add("g-senalado");
    const fin = window.setTimeout(onFin, 5200);
    const salir = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      onFin();
    };
    window.addEventListener("resize", ubicar);
    window.addEventListener("keydown", salir);
    window.addEventListener("pointerdown", salir);
    return () => {
      boton.classList.remove("g-senalado");
      window.clearTimeout(fin);
      window.removeEventListener("resize", ubicar);
      window.removeEventListener("keydown", salir);
      window.removeEventListener("pointerdown", salir);
    };
  }, [onFin]);

  if (!pos) return null;
  return (
    <div className="g-senal" style={{ top: pos.top, left: pos.left }} role="status">
      <span className="g-senal-flecha" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M12 3 L4 12 H9 V21 H15 V12 H20 Z" fill="currentColor" />
        </svg>
      </span>
      <div className="g-senal-caja">
        <img src={withBase("/img/oso-cara.png")} alt="" width={64} height={64} />
        <p>
          Si me necesitas, aquí estoy: toca <b>«¿Cómo funciona?»</b>
        </p>
      </div>
    </div>
  );
}

export function BotonGuia({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      title="Ver la guía de uso"
      aria-label="Ver la guía de uso"
      onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_INICIAR))}
    >
      {children ?? "?"}
    </button>
  );
}
