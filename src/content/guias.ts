import type { PasoGuia } from "@/components/guia/Guia";

// Textos del recorrido guiado (tutorial interactivo) de cada parte de la herramienta.

export const guiaCartilla = {
  bienvenida: {
    titulo: "Te damos la bienvenida",
    texto: "¿Te muestro en pocos pasos cómo recorrerla y cómo se guarda lo que haces?",
  },
  pasos: [
    {
      objetivo: ".v2-lema",
      titulo: "Vivir en calma",
      texto: "Esta cartilla te ayuda a comprender la hipertensión y la diabetes desde tu cuerpo y tus emociones, con ejercicios para practicar.",
    },
    {
      objetivo: ".v2-momentos-stage",
      titulo: "Tres momentos en cada módulo",
      texto: "Primero lees algo breve, luego lo pones a prueba con un ejercicio y al final te llevas una idea para tu día a día.",
    },
    {
      objetivo: ".lb-titulo",
      titulo: "Tu cartilla",
      texto: "Al final del recorrido se arma tu cartilla. Ábrela y elige un módulo: puedes ir en orden o abrir el que necesites.",
    },
    {
      objetivo: ".c-foot",
      titulo: "Lo tuyo se queda contigo",
      texto: "Lo que escribes y marcas se guarda solo en este celular o computador. No se envía a ninguna parte.",
    },
    {
      objetivo: ".c-ayuda",
      titulo: "Si tienes dudas",
      texto: "Toca este botón cuando quieras volver a ver esta guía.",
    },
  ] satisfies PasoGuia[],
  final: {
    titulo: "¡Lista tu cartilla!",
    texto: "Empieza por el primer módulo o por el que más te llame la atención.",
  },
};

export const guiaModulo = {
  bienvenida: {
    titulo: "Tu primer módulo",
    texto: "¿Te muestro cómo avanzar dentro de un módulo?",
  },
  pasos: [
    {
      objetivo: ".momentos-nav",
      titulo: "Los tres momentos",
      texto: "Toca un momento para ir directo a él: Sabías que, Ponlo a prueba o Llévalo contigo.",
    },
    {
      objetivo: ".momentos-nav .listen",
      titulo: "Escucha el paso",
      texto: "Si prefieres oír en lugar de leer, este botón lee en voz alta lo que está en pantalla.",
    },
    {
      objetivo: ".paso",
      titulo: "Un paso a la vez",
      texto: "Aquí aparece cada parte del módulo. En los ejercicios puedes escribir, marcar o tocar, y queda guardado.",
    },
    {
      objetivo: ".paso-nav",
      titulo: "Avanza a tu ritmo",
      texto: "Usa estos botones para pasar de un paso a otro. Si sales, la próxima vez sigues donde ibas.",
      tarea: { texto: "Toca «Siguiente»", evento: "paso-siguiente" },
    },
    {
      objetivo: ".m-head .back",
      titulo: "Vuelve al mapa",
      texto: "Desde aquí regresas al mapa de la cartilla para elegir otro módulo.",
    },
  ] satisfies PasoGuia[],
  final: {
    titulo: "¡Listo!",
    texto: "Al terminar el último paso, marca el módulo como completado y la libélula avanzará en tu mapa.",
  },
};
