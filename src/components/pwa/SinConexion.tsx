"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/paths";
import "./pwa.css";

// Uso sin conexión: registra el service worker (solo en la versión compilada) y avisa
// cuando se está viendo la copia guardada porque no hay internet.

export default function SinConexion() {
  const [enLinea, setEnLinea] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") }).catch(() => {
        /* sin service worker la herramienta funciona igual, solo que no sin conexión */
      });
    }
    const actualizar = () => setEnLinea(navigator.onLine);
    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  if (enLinea) return null;
  return (
    <div className="sin-conexion" role="status">
      Sin conexión: estás usando la copia guardada en este dispositivo.
    </div>
  );
}

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Botón para instalar la herramienta en el celular (o la indicación en iPhone). */
export function BotonInstalar() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [iphone, setIphone] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    setIphone(!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const onInstalada = () => {
      setInstalada(true);
      setEvento(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalada);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalada);
    };
  }, []);

  if (instalada) return null;
  if (evento) {
    return (
      <button
        type="button"
        className="btn instalar"
        onClick={async () => {
          await evento.prompt();
          await evento.userChoice;
          setEvento(null);
        }}
      >
        Instalar en mi celular
      </button>
    );
  }
  if (iphone) {
    return (
      <p className="instalar-ios">
        Para tenerla en tu iPhone: toca <b>Compartir</b> y luego <b>Agregar a inicio</b>.
      </p>
    );
  }
  return null;
}
