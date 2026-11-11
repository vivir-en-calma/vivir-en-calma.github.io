import type { Metadata } from "next";
import Link from "next/link";
import { cartilla } from "@/lib/cartilla";

export const metadata: Metadata = {
  title: "Créditos y referencias · Vivir en calma",
  description: "Equipo, instituciones y referencias de la cartilla «Vivir en calma» del Proyecto de Investigación Libélula.",
};

// Separa el enlace del final de cada referencia para poder abrirlo.
function Referencia({ texto }: { texto: string }) {
  const m = texto.match(/^(.*?)(https?:\/\/\S+)$/);
  if (!m) return <li>{texto}</li>;
  return (
    <li>
      {m[1]}
      <a href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[2]}
      </a>
    </li>
  );
}

export default function Creditos() {
  const { creditos, referencias, referentes_visuales } = cartilla;
  return (
    <div className="creditos">
      <Link href="/" className="back">
        ← Inicio de la cartilla
      </Link>
      <h1>Créditos y referencias</h1>
      <p className="c-sub">{cartilla.titulo}</p>

      <section>
        <h2>Proyecto de Investigación Libélula</h2>
        <ul className="cr-inst">
          {creditos.instituciones.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <dl className="cr-lista">
          {creditos.equipo.map(([n, r]) => (
            <div key={n}>
              <dt>{n}</dt>
              <dd>{r}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Edición de la cartilla</h2>
        <dl className="cr-lista">
          {creditos.edicion.map(([r, n]) => (
            <div key={r}>
              <dt>{r}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>
        <p>{creditos.edicion_texto}</p>
        <p className="cr-aviso">{creditos.aviso}</p>
        <p>{creditos.financiacion}</p>
      </section>

      <section>
        <h2>Referencias</h2>
        <ul className="cr-refs">
          {referencias.map((r) => (
            <Referencia key={r} texto={r} />
          ))}
        </ul>
        <h3>Referentes visuales consultados</h3>
        <ul className="cr-refs">
          {referentes_visuales.map((r) => (
            <Referencia key={r} texto={r} />
          ))}
        </ul>
      </section>
    </div>
  );
}
