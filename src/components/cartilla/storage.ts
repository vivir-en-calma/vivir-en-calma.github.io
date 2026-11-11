"use client";

import { useCallback, useEffect, useState } from "react";

// Todo lo que la persona registra se guarda solo en su dispositivo (localStorage):
// no hay registro de usuarios ni datos de salud en servidores.
const PREFIX = "libelula:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("libelula-storage", { detail: key }));
  } catch {
    /* almacenamiento no disponible (modo privado): la herramienta sigue funcionando */
  }
}

/** Estado persistente en el dispositivo, sincronizado entre componentes. */
export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(read(key, fallback));
    };
    window.addEventListener("libelula-storage", onChange);
    return () => window.removeEventListener("libelula-storage", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

/** Módulos completados de la cartilla. */
export function useProgreso() {
  const [hechos, setHechos] = useLocal<string[]>("completados", []);
  const marcar = (id: string) => setHechos((prev) => (prev.includes(id) ? prev : [...prev, id]));
  return { hechos, marcar };
}
