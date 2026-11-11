"use client";

import { descargarQr, useQr } from "./Compartir";

type Recurso = { ruta: string; titulo: string; detalle: string; archivo: string };

function Tarjeta({ r }: { r: Recurso }) {
  const { svg, url } = useQr(r.ruta);
  return (
    <li className="qr-item">
      <div className="qr-codigo" role="img" aria-label={`Código QR de ${r.titulo}`} dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="qr-texto">
        <b>{r.titulo}</b>
        {r.detalle && <span>{r.detalle}</span>}
        <small>{url.replace(/^https?:\/\//, "")}</small>
        <button type="button" className="btn ghost no-print" onClick={() => descargarQr(url, r.archivo)}>
          Descargar
        </button>
      </div>
    </li>
  );
}

export default function HojaQr({ recursos }: { recursos: Recurso[] }) {
  return (
    <>
      <div className="row-btns no-print">
        <button type="button" className="btn" onClick={() => window.print()}>
          Imprimir la hoja
        </button>
      </div>
      <ul className="qr-lista">
        {recursos.map((r) => (
          <Tarjeta r={r} key={r.ruta} />
        ))}
      </ul>
    </>
  );
}
