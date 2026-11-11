"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Bloque, Ejercicio, Figura, Modulo } from "@/lib/cartilla";
import { COLOR_MODULO, INTERACTIVOS, ilustracion } from "@/lib/cartilla";
import Rich from "./Rich";
import Emociometro from "./Emociometro";
import Respiracion from "./Respiracion";
import MapaCorporal from "./MapaCorporal";
import Medicamentos from "./Medicamentos";
import SopaLetras from "./SopaLetras";
import Cuaderno, { tieneCuaderno } from "./Cuaderno";
import Celebracion from "./Celebracion";
import { useLocal, useProgreso } from "./storage";
import Guia, { avisarGuia } from "@/components/guia/Guia";
import { guiaModulo } from "@/content/guias";
import Compartir from "@/components/compartir/Compartir";

type Momento = "sabias" | "prueba" | "lleva";
const MOMENTOS: { id: Momento; nombre: string }[] = [
  { id: "sabias", nombre: "Sabías que…" },
  { id: "prueba", nombre: "Ponlo a prueba…" },
  { id: "lleva", nombre: "Llévalo contigo…" },
];

type Paso =
  | { momento: "sabias"; tipo: "inicio"; modulo: Modulo }
  | { momento: "sabias"; tipo: "intro"; titulo?: string; texto: string }
  | { momento: "sabias"; tipo: "bloque"; bloque: Bloque }
  | { momento: "sabias"; tipo: "sabias"; texto: string; figura?: Figura }
  | {
      momento: "prueba";
      tipo: "ejercicio";
      ejercicio: Ejercicio;
      antes?: string;
    }
  | {
      momento: "lleva";
      tipo: "lleva";
      textos: { texto: string; tipo?: string }[];
      imagen?: string;
    };

/** Arma la secuencia de pasos del módulo en el orden de la cartilla impresa. */
function armarPasos(m: Modulo): Paso[] {
  const pasos: Paso[] = [];
  if (m.que_encontraras)
    pasos.push({ momento: "sabias", tipo: "inicio", modulo: m });
  if (m.intro)
    pasos.push({
      momento: "sabias",
      tipo: "intro",
      titulo: m.subtitulo,
      texto: m.intro,
    });
  for (const b of m.otros_bloques)
    pasos.push({ momento: "sabias", tipo: "bloque", bloque: b });
  for (const s of m.sabias_que)
    pasos.push({
      momento: "sabias",
      tipo: "sabias",
      texto: s.texto,
      figura: s.figura,
    });
  m.ponlo_a_prueba.forEach((e, k) =>
    pasos.push({
      momento: "prueba",
      tipo: "ejercicio",
      ejercicio: e,
      antes: k === 0 ? m.ponlo_a_prueba_intro : undefined,
    }),
  );
  if (m.llevalo_contigo.length)
    pasos.push({
      momento: "lleva",
      tipo: "lleva",
      textos: m.llevalo_contigo,
      imagen: m.llevalo_contigo.find((l) => l.imagen)?.imagen,
    });
  return pasos;
}

function Ilustracion({
  nombre,
  alt = "",
  className = "ilus",
}: {
  nombre: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={ilustracion(nombre)}
      alt={alt}
      loading="lazy"
    />
  );
}

function BloqueView({ b }: { b: Bloque }) {
  const tabla =
    b.tipo === "tabla"
      ? (b.datos_estructurados as
          { columnas?: string[]; filas?: string[][] } | undefined)
      : undefined;
  // Las imágenes con texto o muy anchas (el plato, el empaque) van debajo del texto, a todo el ancho.
  const ancha = b.tipo === "imagen" || b.id === "porcion";
  return (
    <>
      {b.titulo && <h2 className="paso-t">{b.titulo}</h2>}
      <div className={b.imagen && !ancha ? "con-ilus" : undefined}>
        <div>
          {tabla?.columnas && tabla.filas && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    {tabla.columnas.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabla.filas.map((f, i) => (
                    <tr key={i}>
                      {f.map((c, j) => (
                        <td key={j}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Rich text={b.texto} />
          {typeof b.mini_actividad === "string" && (
            <Rich className="mini" text={b.mini_actividad} />
          )}
          {b.mini_actividad && typeof b.mini_actividad === "object" && (
            <div className="mini">
              <b>Escribe en tu cuaderno:</b>
              {b.mini_actividad.pregunta && <p>{b.mini_actividad.pregunta}</p>}
              {b.mini_actividad.campos && (
                <ul>
                  {b.mini_actividad.campos.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {b.imagen && (
          <Ilustracion
            nombre={b.imagen}
            alt={b.alt}
            className={ancha ? "ilus ancha" : "ilus"}
          />
        )}
      </div>
    </>
  );
}

function EjercicioView({ e, antes }: { e: Ejercicio; antes?: string }) {
  const tipo = INTERACTIVOS[e.id];
  // La sopa de letras y el mapa corporal también traen campos para escribir.
  const cuaderno =
    (!tipo || tipo === "sopa" || tipo === "mapa") &&
    tieneCuaderno(
      e.tipo === "sopa_letras" ? "escritura" : e.tipo,
      e.campos_o_items,
    );
  return (
    <>
      {antes && <p className="pausa-intro">{antes}</p>}
      <div className="momento-cab">
        <Ilustracion nombre="momento-prueba" className="momento-ico" />
        <span className="pill">Ponlo a prueba…</span>
        <span className="pill suave">
          {tipo
            ? "Ejercicio interactivo"
            : cuaderno
              ? "Cuaderno digital"
              : "En tu cuaderno"}
        </span>
      </div>
      <h2 className="paso-t">{e.titulo}</h2>
      <div className={e.imagen ? "con-ilus" : undefined}>
        <details className="instr" open={!tipo || tipo === "sopa"}>
          <summary>
            {tipo && tipo !== "sopa"
              ? "Ver las instrucciones de la cartilla"
              : "Instrucciones"}
          </summary>
          <Rich text={e.instrucciones} />
        </details>
        {e.imagen && <Ilustracion nombre={e.imagen} />}
      </div>
      {tipo === "mapa" && (
        <MapaCorporal
          modo={e.id.endsWith("_b") ? "sensaciones" : "emociones"}
        />
      )}
      {tipo === "medicamentos" && <Medicamentos />}
      {tipo === "respiracion" && <Respiracion />}
      {tipo === "emociometro" && <Emociometro />}
      {tipo === "sopa" && e.sopa && <SopaLetras id={e.id} sopa={e.sopa} />}
      {cuaderno && <Cuaderno id={e.id} tipo={e.tipo} spec={e.campos_o_items} />}
    </>
  );
}

function PasoView({ paso }: { paso: Paso }) {
  switch (paso.tipo) {
    case "inicio": {
      const m = paso.modulo;
      return (
        <div className="con-ilus">
          <div>
            <h2 className="paso-t">Qué encontrarás aquí</h2>
            <Rich className="rich lead" text={m.que_encontraras} />
            {m.en_1_minuto && (
              <div className="minuto">
                <b>En 1 minuto</b>
                <ul>
                  {m.en_1_minuto.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {m.imagen_inicio && <Ilustracion nombre={m.imagen_inicio} />}
        </div>
      );
    }
    case "intro":
      return (
        <>
          {paso.titulo && <h2 className="paso-t">{paso.titulo}</h2>}
          <Rich className="rich lead" text={paso.texto} />
        </>
      );
    case "bloque":
      return <BloqueView b={paso.bloque} />;
    case "sabias":
      return (
        <div className="sabias">
          <div className="momento-cab">
            <Ilustracion nombre="momento-sabias" className="momento-ico" />
            <span className="pill">Sabías que…</span>
          </div>
          <Rich text={paso.texto} />
          {paso.figura && (
            <figure className="figura">
              <img
                src={ilustracion(paso.figura.imagen)}
                alt={paso.figura.alt}
                loading="lazy"
              />
              {paso.figura.pie && <figcaption>{paso.figura.pie}</figcaption>}
            </figure>
          )}
        </div>
      );
    case "ejercicio":
      return <EjercicioView e={paso.ejercicio} antes={paso.antes} />;
    case "lleva": {
      const checks = paso.textos.filter((t) => t.tipo === "check");
      const resto = paso.textos.filter((t) => t.tipo !== "check");
      return (
        <>
          <div className="momento-cab">
            <Ilustracion nombre="momento-lleva" className="momento-ico" />
            <span className="pill">Llévalo contigo…</span>
          </div>
          <div className={paso.imagen ? "con-ilus" : undefined}>
            <div>
              {checks.length > 0 && (
                <ul className="lleva-lista">
                  {checks.map((t) => (
                    <li key={t.texto}>{t.texto}</li>
                  ))}
                </ul>
              )}
              {resto.map((t) => (
                <blockquote className="lleva" key={t.texto}>
                  <Rich text={t.texto} />
                </blockquote>
              ))}
            </div>
            {paso.imagen && <Ilustracion nombre={paso.imagen} />}
          </div>
        </>
      );
    }
  }
}

const sinMovimiento = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Pasa la página: una copia de la página actual gira sobre el lomo y deja ver la nueva. */
function pasarPagina(
  actual: HTMLElement | null,
  hoja: HTMLElement | null,
  adelante: boolean,
) {
  if (!actual || !hoja || sinMovimiento()) return;
  const copia = document.createElement("div");
  copia.className = `lb-vuela ${adelante ? "adelante" : "atras"}`;
  copia.setAttribute("aria-hidden", "true");
  copia.inert = true;
  copia.appendChild(actual.cloneNode(true));
  copia.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  hoja.appendChild(copia);
  copia.addEventListener("animationend", () => copia.remove(), { once: true });
  window.setTimeout(() => copia.remove(), 1200);
}

/** Al entrar a un módulo, la cartilla se arma y se abre (una vez por sesión; se salta con un toque). */
function LibroEntrada({ modulo }: { modulo: Modulo }) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const clave = `libelula:entrada-${modulo.id}`;
    try {
      if (sinMovimiento() || sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");
    } catch {
      /* sin almacenamiento de sesión: se muestra igual */
    }
    setVer(true);
    const t = window.setTimeout(() => setVer(false), 2900);
    return () => window.clearTimeout(t);
  }, [modulo.id]);
  if (!ver) return null;
  return (
    <div
      className="lb-entrada"
      aria-hidden="true"
      onClick={() => setVer(false)}
    >
      <div className="lb-e-libro">
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="lb-e-hoja" style={{ ["--k" as string]: k }} />
        ))}
        <div className="lb-e-hoja lb-e-pagina" style={{ ["--k" as string]: 4 }}>
          <b>Qué encontrarás aquí</b>
          <i />
          <i />
          <i />
          <i />
          {modulo.imagen_inicio && (
            <img src={ilustracion(modulo.imagen_inicio)} alt="" />
          )}
        </div>
        <div className="lb-e-tapa">
          <div className="lb-e-frente">
            <img src={ilustracion(modulo.icono)} alt="" />
            <small>Módulo {modulo.numero}</small>
            <b>{modulo.verbo}</b>
          </div>
          <div className="lb-e-dorso">
            <img src={ilustracion("logo-libelula")} alt="" />
          </div>
        </div>
      </div>
      <p>Toca para saltar</p>
    </div>
  );
}

export default function ModuleView({
  modulo,
  anterior,
  siguiente,
}: {
  modulo: Modulo;
  anterior?: { id: string; verbo: string };
  siguiente?: { id: string; verbo: string };
}) {
  const pasos = useMemo(() => armarPasos(modulo), [modulo]);
  const [guardado, setGuardado] = useLocal<number>(`paso-${modulo.id}`, 0);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hablando, setHablando] = useState(false);
  const [fiesta, setFiesta] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const pagina = useRef<HTMLDivElement>(null);
  const { hechos, marcar } = useProgreso();
  const hecho = hechos.includes(modulo.id);
  const ultimo = pasos.length - 1;

  // Retoma el último paso visitado en este dispositivo.
  useEffect(() => {
    setI(Math.min(guardado, ultimo));
  }, [guardado, ultimo]);

  const ir = useCallback(
    (n: number) => {
      const destino = Math.max(0, Math.min(ultimo, n));
      window.speechSynthesis?.cancel();
      setHablando(false);
      setDir(destino >= i ? 1 : -1);
      if (destino !== i) pasarPagina(area.current, pagina.current, destino > i);
      setI(destino);
      setGuardado(destino);
      if (destino > i) avisarGuia("paso-siguiente");
      area.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [i, ultimo, setGuardado],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (document.documentElement.hasAttribute("data-guia")) return; // la guía usa las flechas
      if (e.key === "ArrowRight") ir(i + 1);
      if (e.key === "ArrowLeft") ir(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, ir]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const escuchar = () => {
    if (!("speechSynthesis" in window) || !area.current) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setHablando(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(area.current.innerText);
    u.lang = "es-CO";
    u.rate = 0.92;
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    setHablando(true);
    window.speechSynthesis.speak(u);
  };

  const terminar = () => {
    marcar(modulo.id);
    setFiesta(true);
  };

  const paso = pasos[i];
  const momentoActual = paso?.momento;

  return (
    <div
      className="modulo lb-mod"
      style={{ ["--m" as string]: COLOR_MODULO[modulo.id] }}
    >
      <LibroEntrada modulo={modulo} />
      <div className="lb-abierto">
        <header className="m-head">
          <Link href="/" className="back">
            ← Inicio de la cartilla
          </Link>
          <div className="m-titulo">
            <img
              className="m-ico"
              src={ilustracion(modulo.icono)}
              alt=""
              width={96}
              height={96}
            />
            <div>
              <p className="m-num">Módulo {modulo.numero} de 7</p>
              <h1>{modulo.verbo}</h1>
              <p className="m-sub">{modulo.contenido}</p>
            </div>
          </div>
          <Compartir
            ruta={`/${modulo.id}/`}
            titulo={`Módulo ${modulo.numero}: ${modulo.verbo}`}
            nombreArchivo={`cartilla-${modulo.id}`}
            etiqueta="Compartir este módulo"
            className="m-compartir"
          />
        </header>

        <div className="stepper">
          <nav className="momentos-nav" aria-label="Momentos del módulo">
            {MOMENTOS.map((mo) => {
              const primero = pasos.findIndex((p) => p.momento === mo.id);
              return (
                <button
                  key={mo.id}
                  type="button"
                  aria-current={momentoActual === mo.id ? "step" : undefined}
                  disabled={primero < 0}
                  onClick={() => ir(primero)}
                >
                  {mo.nombre}
                </button>
              );
            })}
            <button
              type="button"
              className="listen"
              aria-pressed={hablando}
              onClick={escuchar}
            >
              {hablando ? "Detener" : "Escuchar"}
            </button>
          </nav>
          <div className="m-bar" aria-hidden="true">
            <span style={{ width: `${((i + 1) / pasos.length) * 100}%` }} />
          </div>
          <p className="m-count" aria-live="polite">
            Paso {i + 1} de {pasos.length}
          </p>
        </div>

        <div className="lb-der" ref={pagina}>
          <div
            className={`paso ${dir > 0 ? "fwd" : "back"}`}
            key={i}
            ref={area}
          >
            {paso && <PasoView paso={paso} />}
          </div>

          <div className="paso-nav">
            <button
              type="button"
              className="btn ghost"
              onClick={() => ir(i - 1)}
              disabled={i === 0}
            >
              ← Anterior
            </button>
            {i < ultimo ? (
              <button type="button" className="btn" onClick={() => ir(i + 1)}>
                Siguiente →
              </button>
            ) : (
              <button type="button" className="btn fin" onClick={terminar}>
                {hecho ? "Módulo completado ✓" : "Terminé este módulo"}
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="m-nav" aria-label="Otros módulos">
        {anterior ? (
          <Link href={`/${anterior.id}/`}>← {anterior.verbo}</Link>
        ) : (
          <span />
        )}
        {siguiente ? (
          <Link href={`/${siguiente.id}/`}>{siguiente.verbo} →</Link>
        ) : (
          <span />
        )}
      </nav>

      <Guia id="modulo" {...guiaModulo} />
      {fiesta && (
        <Celebracion
          verbo={modulo.verbo}
          siguiente={siguiente}
          onClose={() => setFiesta(false)}
        />
      )}
    </div>
  );
}
