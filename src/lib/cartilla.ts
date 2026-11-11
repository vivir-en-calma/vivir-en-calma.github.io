import data from "@/content/cartilla.json";
import { withBase } from "@/lib/paths";

// Tipos del contenido de la cartilla «Vivir en calma» (edición del 7 de noviembre de 2026).
export type Bloque = {
  id?: string;
  tipo?: string;
  titulo?: string;
  texto?: string;
  imagen?: string;
  alt?: string;
  mini_actividad?: string | { tipo?: string; pregunta?: string; campos?: string[] };
  datos_estructurados?: Record<string, unknown>;
};

export type Figura = { imagen: string; alt: string; pie?: string };

export type Sopa = { titulo: string; cuadricula: string[]; palabras: string[] };

export type Ejercicio = {
  id: string;
  titulo: string;
  letra?: string;
  instrucciones: string;
  tipo: string;
  imagen?: string;
  sopa?: Sopa;
  campos_o_items?: unknown;
};

export type Modulo = {
  id: string;
  numero: number;
  verbo: string;
  contenido: string;
  proposito: string;
  icono: string;
  que_encontraras?: string;
  en_1_minuto?: string[];
  imagen_inicio?: string;
  subtitulo?: string;
  intro?: string;
  otros_bloques: Bloque[];
  sabias_que: { texto: string; figura?: Figura }[];
  ponlo_a_prueba_intro?: string;
  ponlo_a_prueba: Ejercicio[];
  llevalo_contigo: { texto: string; tipo?: string; imagen?: string }[];
};

type Cartilla = {
  titulo: string;
  version: string;
  intro: {
    titulo_completo: string;
    frase_celebre: { texto: string; autor: string };
    simbolo_libelula: string;
    bienvenida: string;
    herramienta: string;
    como_recorrer: string;
    motivacion: string;
    recuerda: string;
    momentos: { id: string; nombre: string; descripcion: string; imagen: string }[];
  };
  modulos: Modulo[];
  creditos: {
    instituciones: string[];
    equipo: [string, string][];
    edicion: [string, string][];
    edicion_texto: string;
    aviso: string;
    financiacion: string;
  };
  referencias: string[];
  referentes_visuales: string[];
};

export const cartilla = data as unknown as Cartilla;

export const modulos: Modulo[] = cartilla.modulos;

export function getModulo(id: string): Modulo | undefined {
  return modulos.find((m) => m.id === id);
}

/** Ruta de una ilustración tomada de la cartilla impresa (public/img/cartilla). */
export const ilustracion = (nombre: string) => withBase(`/img/cartilla/${nombre}.webp`);

/** Color de cada módulo, tomado de su ícono en la cartilla impresa. */
export const COLOR_MODULO: Record<string, string> = {
  conocerme: "#197885",
  escucharme: "#4f7f8a",
  acompanarme: "#1f7f9e",
  nutrirme: "#5c66a6",
  moverme_descansar: "#6b5f88",
  elegirme: "#4059a0",
  conectarme: "#2f7ea3",
};

/** Ejercicios que tienen versión interactiva. */
export const INTERACTIVOS: Record<string, "mapa" | "medicamentos" | "respiracion" | "emociometro" | "sopa"> = {
  mapa_corporal_a: "mapa",
  mapa_corporal_b: "mapa",
  lista_medicamentos: "medicamentos",
  A_pausa_respiracion: "respiracion",
  D_sopa_letras: "sopa",
  I_emociometro: "emociometro",
};
