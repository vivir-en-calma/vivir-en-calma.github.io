import type { Metadata } from "next";
import Link from "next/link";
import Rich from "@/components/cartilla/Rich";
import Guia from "@/components/guia/Guia";
import Compartir from "@/components/compartir/Compartir";
import { BotonInstalar } from "@/components/pwa/SinConexion";
import MotionV2 from "@/components/v2/MotionV2";
import { AvanceGeneral, EstadoModulo } from "@/components/v2/Avance";
import { guiaCartilla } from "@/content/guias";
import { COLOR_MODULO, cartilla, ilustracion, modulos } from "@/lib/cartilla";
import "./v2.css";

export const metadata: Metadata = {
  title: "Vivir en calma · Cartilla interactiva Libélula",
  description: "Siete módulos para comprender la hipertensión y la diabetes desde el cuerpo y las emociones, con ejercicios para practicar.",
};

// Posiciones del collage del inicio (en % del escenario), una por módulo.
const COLLAGE = [
  { left: "6%", top: "10%", w: 15 },
  { left: "24%", top: "58%", w: 13 },
  { left: "40%", top: "4%", w: 12 },
  { left: "79%", top: "8%", w: 15 },
  { left: "66%", top: "60%", w: 14 },
  { left: "3%", top: "62%", w: 12 },
  { left: "86%", top: "52%", w: 11 },
];

/** Separa un texto en palabras para que se iluminen una a una al hacer scroll. */
function Palabras({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/\s+/).map((p, i) => (
        <span className="w" key={i}>
          {p}{" "}
        </span>
      ))}
    </>
  );
}

export default function Inicio() {
  const { intro } = cartilla;
  const bienvenida = intro.bienvenida.split(/\n\s*\n/);
  const cierre = bienvenida.pop() ?? "";
  const herramienta = intro.herramienta.split(/\n\s*\n/);
  const empezar = herramienta.pop() ?? "";

  return (
    <div className="v2">
      {/* Activa las escenas antes de pintar, para que no se vea un salto al cargar. */}
      <script
        dangerouslySetInnerHTML={{
          __html: 'if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("v2-anim")',
        }}
      />
      <MotionV2 />

      {/* 1. Inicio: lema, collage de los módulos y portada que se abre */}
      <section className="v2-hero v2-full" id="inicio">
        <div className="v2-stage">
          <h1 className="v2-lema" aria-label="Una guía para cuidar mi cuerpo, mis emociones y mi bienestar">
            <span className="line">
              <span>Una guía para cuidar</span>
            </span>
            <span className="line">
              <span>
                mi <em>cuerpo</em>,
              </span>
            </span>
            <span className="line">
              <span>
                mis <em>emociones</em>
              </span>
            </span>
            <span className="line">
              <span>
                y mi <em>bienestar</em>
              </span>
            </span>
          </h1>
          <p className="v2-baja" aria-hidden="true">
            Desliza para empezar
          </p>

          <div className="v2-collage" aria-hidden="true">
            {modulos.map((m, i) => (
              <span
                key={m.id}
                className="v2-tesela"
                style={{
                  left: COLLAGE[i].left,
                  top: COLLAGE[i].top,
                  width: `${COLLAGE[i].w}%`,
                  ["--m" as string]: COLOR_MODULO[m.id],
                }}
              >
                <img src={ilustracion(m.icono)} alt="" />
              </span>
            ))}
          </div>

          <div className="v2-portada" style={{ ["--fondo" as string]: `url(${ilustracion("fondo-portada")})` }}>
            <div className="v2-portada-txt">
              <p className="eyebrow">Cartilla interactiva · Proyecto Libélula</p>
              <h2 className="v2-titulo">Vivir en calma</h2>
              <p className="c-sub">Una guía para cuidar mi cuerpo, mis emociones y mi bienestar</p>
              <div className="c-hero-acciones">
                <Compartir ruta="/" titulo="Vivir en calma · Cartilla interactiva" nombreArchivo="vivir-en-calma" etiqueta="Compartir la cartilla" />
                <BotonInstalar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vuelo de la libélula a lo largo de la página */}
      <svg className="v2-vuelo" id="vuelo" aria-hidden="true">
        <defs>
          <linearGradient id="estela" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#197885" />
            <stop offset=".5" stopColor="#8a6fb0" />
            <stop offset="1" stopColor="#4059a0" />
          </linearGradient>
        </defs>
        <path className="guia-trazo" id="trazo-base" />
        <path className="estela" id="trazo" />
      </svg>
      <img className="v2-libelula" id="libelula" src={ilustracion("libelula")} alt="" aria-hidden="true" width={84} height={79} />

      {/* 2. La frase */}
      <section className="v2-cita v2-full" aria-label="Frase">
        <blockquote className="v2-wrap">
          <p className="v2-ilumina">
            <Palabras texto={intro.frase_celebre.texto} />
          </p>
          <cite>{intro.frase_celebre.autor}</cite>
        </blockquote>
      </section>

      {/* 3. Un espacio para ti */}
      <section className="v2-espacio v2-full" id="espacio" aria-labelledby="espacio-t">
        <div className="v2-wrap v2-dos">
          <h2 id="espacio-t" className="v2-grande fx">
            Un espacio
            <br />
            para ti
          </h2>
          <div className="fx">
            <Rich text={bienvenida.join("\n\n")} />
          </div>
        </div>
        <p className="v2-wrap v2-frase-llena v2-ilumina">
          <Palabras texto={cierre} />
        </p>
      </section>

      {/* 4. La libélula, símbolo de transformación */}
      <section className="v2-simbolo v2-full" aria-labelledby="simbolo-t">
        <div className="v2-wrap v2-dos">
          <div className="v2-logo">
            <img src={ilustracion("logo-libelula")} alt="Logo del Proyecto Libélula" width={563} height={438} />
          </div>
          <div className="fx">
            <p className="eyebrow">El símbolo</p>
            <h2 id="simbolo-t">La libélula, un símbolo de transformación</h2>
            <Rich text={intro.simbolo_libelula} />
          </div>
        </div>
      </section>

      {/* 5. Una herramienta para acompañarte */}
      <section className="v2-herramienta v2-full" aria-labelledby="herr-t">
        <div className="v2-wrap">
          <p className="eyebrow fx">Una herramienta para acompañarte</p>
          <h2 id="herr-t" className="v2-grande fx">
            Tienes un papel activo en el cuidado de tu salud.
          </h2>
          <div className="v2-col fx">
            <Rich text={herramienta.filter((p) => !p.startsWith("Tienes un papel")).join("\n\n")} />
            <p className="v2-empezar">{empezar}</p>
          </div>
        </div>
      </section>

      {/* 6. ¿Cómo usarla? Tres momentos en cada módulo */}
      <section className="v2-como v2-full" id="como" aria-labelledby="como-t">
        <div className="v2-wrap v2-como-intro">
          <h2 id="como-t" className="v2-grande fx">¿Cómo usarla?</h2>
          <div className="fx">
            <Rich text={intro.como_recorrer} />
          </div>
        </div>
        <div className="v2-momentos">
          <div className="v2-momentos-stage v2-wrap">
            <p className="v2-contador" aria-hidden="true">
              <b id="mom-n">01</b> / {String(intro.momentos.length).padStart(2, "0")}
            </p>
            {intro.momentos.map((m, i) => (
              <article className="v2-mom" key={m.id} data-i={i}>
                <div className="v2-mom-txt">
                  <h3>{m.nombre}</h3>
                  <p>{m.descripcion}</p>
                </div>
                <img src={ilustracion(m.imagen)} alt="" width={330} height={309} />
              </article>
            ))}
            <ol className="v2-mom-indice" aria-hidden="true">
              {intro.momentos.map((m, i) => (
                <li key={m.id} data-i={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span> {m.nombre}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 7. Recuerda que… */}
      <section className="v2-recuerda v2-full" aria-labelledby="recuerda-t">
        <div className="v2-wrap">
          <div className="v2-col fx">
            <Rich text={intro.motivacion} />
          </div>
          <h2 id="recuerda-t" className="v2-gigante">
            <span className="v2-relleno" data-texto="Recuerda que…">
              Recuerda que…
            </span>
          </h2>
          <p className="v2-ilumina v2-frase-llena">
            <Palabras texto={intro.recuerda} />
          </p>
          <div className="v2-final fx">
            <Compartir ruta="/" titulo="Vivir en calma · Cartilla interactiva" nombreArchivo="vivir-en-calma" etiqueta="Compartir la cartilla" />
          </div>
        </div>
      </section>

      {/* 8. La cartilla: se arma en 3D al bajar y se abre en el índice */}
      <section className="lb-seccion v2-full" id="recorrido" aria-labelledby="modulos-t">
        <div className="lb-stage">
          <div className="v2-wrap lb-cab">
            <p className="eyebrow">Tu cartilla</p>
            <h2 id="modulos-t" className="v2-grande lb-titulo">
              Ábrela y empieza
            </h2>
          </div>
          <div className="lb-escena">
            <div className="lb-libro">
              <div className="lb-contra" aria-hidden="true" />
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="lb-hoja" style={{ ["--k" as string]: k }} aria-hidden="true" />
              ))}
              <nav className="lb-indice lb-papel" aria-label="Módulos de la cartilla">
                <p className="lb-indice-t">Contenido</p>
                <ol>
                  {modulos.map((m) => (
                    <li key={m.id} style={{ ["--m" as string]: COLOR_MODULO[m.id] }}>
                      <Link href={`/${m.id}/`} aria-label={`Módulo ${m.numero}: ${m.verbo}. ${m.contenido}`}>
                        <img src={ilustracion(m.icono)} alt="" />
                        <span className="lb-num">{m.numero}.</span>
                        <span className="lb-verbo">
                          {m.verbo}
                          <small>{m.contenido}</small>
                        </span>
                        <EstadoModulo id={m.id} />
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="lb-tapa">
                <div className="lb-cara lb-frente" aria-hidden="true" style={{ ["--fondo" as string]: `url(${ilustracion("fondo-portada")})` }}>
                  <img src={ilustracion("libelula")} alt="" width={64} height={60} />
                  <b>Vivir en calma</b>
                  <span>Una guía para cuidar mi cuerpo, mis emociones y mi bienestar</span>
                </div>
                <div className="lb-cara lb-dorso lb-papel">
                  <img src={ilustracion("logo-libelula")} alt="Proyecto Libélula" width={563} height={438} />
                  <p>Siete acciones que pueden acompañarte en el cuidado de tu salud y tu bienestar. Puedes ir en orden o abrir la que necesites.</p>
                  <AvanceGeneral total={modulos.length} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Guia id="cartilla" {...guiaCartilla} />
    </div>
  );
}
