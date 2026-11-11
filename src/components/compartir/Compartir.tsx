"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/paths";
import "./compartir.css";

// Compartir un recurso: código QR (para mostrar o descargar), copiar el enlace y,
// en el celular, el menú de compartir del sistema. El enlace se arma con la dirección
// desde donde se abre la herramienta, así funciona igual en pruebas y ya publicada.

const COLOR_QR = { dark: "#1c1c3a", light: "#ffffff" };

export function enlaceCompleto(ruta: string) {
  return new URL(withBase(ruta), window.location.origin).toString();
}

export function useQr(ruta: string) {
  const [svg, setSvg] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = enlaceCompleto(ruta);
    setUrl(u);
    QRCode.toString(u, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: COLOR_QR }).then(setSvg);
  }, [ruta]);
  return { svg, url };
}

export async function descargarQr(url: string, nombre: string) {
  const data = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: COLOR_QR });
  const a = document.createElement("a");
  a.href = data;
  a.download = `qr-${nombre}.png`;
  a.click();
}

export default function Compartir({
  ruta,
  titulo,
  nombreArchivo,
  className = "",
  etiqueta = "Compartir",
}: {
  /** Ruta dentro de la herramienta, por ejemplo «/conocerme/». */
  ruta: string;
  titulo: string;
  nombreArchivo: string;
  className?: string;
  etiqueta?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const { svg, url } = useQr(ruta);
  const cerrarBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => setPuedeCompartir(typeof navigator.share === "function"), []);

  useEffect(() => {
    if (!abierto) return;
    cerrarBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin permiso para copiar: el enlace queda visible para copiarlo a mano */
    }
  };

  const compartir = async () => {
    try {
      await navigator.share({ title: titulo, text: `${titulo} · Proyecto Libélula`, url });
    } catch {
      /* la persona canceló */
    }
  };

  return (
    <>
      <button type="button" className={`sh-abrir ${className}`} onClick={() => setAbierto(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {etiqueta}
      </button>
      {abierto && (
        <div className="sh-fondo" role="presentation" onClick={() => setAbierto(false)}>
          <div className="sh-panel" role="dialog" aria-modal="true" aria-labelledby="sh-t" onClick={(e) => e.stopPropagation()}>
            <button ref={cerrarBtn} type="button" className="sh-cerrar" aria-label="Cerrar" onClick={() => setAbierto(false)}>
              ×
            </button>
            <p className="sh-eyebrow">Compartir</p>
            <h2 id="sh-t">{titulo}</h2>
            <p className="sh-ayuda">Muestra este código para que otra persona lo escanee con la cámara de su celular.</p>
            <div className="sh-qr" role="img" aria-label={`Código QR de ${titulo}`} dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="sh-enlace">
              <input readOnly value={url} aria-label="Enlace" onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={copiar}>
                {copiado ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="sh-acciones">
              {puedeCompartir && (
                <button type="button" className="sh-btn" onClick={compartir}>
                  Enviar…
                </button>
              )}
              <button type="button" className={`sh-btn${puedeCompartir ? " ghost" : ""}`} onClick={() => descargarQr(url, nombreArchivo)}>
                Descargar el código QR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
