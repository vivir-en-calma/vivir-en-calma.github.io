"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Animaciones de la portada (v2): desplazamiento suave, collage que se abre en la
 * portada, palabras que se iluminan, momentos fijos, tarjetas apiladas y el vuelo de
 * la libélula sobre toda la página. Trabaja sobre el HTML de page.tsx; sin JavaScript
 * o con «reducir movimiento» el contenido se ve completo y quieto.
 */
export default function MotionV2() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("v2-anim");
    const $ = <T extends Element = HTMLElement>(s: string) =>
      document.querySelector<T>(s);
    const $$ = <T extends Element = HTMLElement>(s: string) =>
      Array.from(document.querySelectorAll<T>(s));

    // ---------- desplazamiento suave ----------
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const gctx = gsap.context(() => {
      // ---------- inicio: el lema entra línea por línea ----------
      gsap.from(".v2-lema .line > span", {
        yPercent: 110,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.12,
        delay: 0.15,
      });
      gsap.from(".v2-baja", { opacity: 0, y: 12, duration: 1, delay: 1 });

      // collage → portada que se abre a toda la pantalla
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".v2-hero",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl.to(
        ".v2-lema",
        { yPercent: -30, opacity: 0, ease: "power1.in", duration: 0.3 },
        0,
      )
        .to(".v2-baja", { opacity: 0, duration: 0.1 }, 0)
        .from(
          ".v2-tesela",
          {
            y: () => window.innerHeight * 0.8,
            opacity: 0,
            stagger: 0.03,
            duration: 0.3,
            ease: "power2.out",
          },
          0.05,
        )
        .fromTo(
          ".v2-portada",
          { clipPath: "inset(50% 50% 50% 50% round 28px)" },
          {
            clipPath: "inset(34% 33% 34% 33% round 28px)",
            duration: 0.25,
            ease: "power2.out",
          },
          0.1,
        )
        .to(
          ".v2-portada",
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 0.4,
            ease: "power2.inOut",
          },
          0.4,
        )
        .to(
          ".v2-tesela",
          {
            x: (i: number, el: HTMLElement) =>
              (el.offsetLeft + el.offsetWidth / 2 < window.innerWidth / 2
                ? -1
                : 1) *
              window.innerWidth *
              0.35,
            scale: 0.6,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
          },
          0.4,
        )
        .from(
          ".v2-portada-txt > *",
          { y: 40, opacity: 0, stagger: 0.05, duration: 0.2 },
          0.72,
        );

      // ---------- palabras que se iluminan ----------
      $$(".v2-ilumina").forEach((el) => {
        gsap.to(el.querySelectorAll(".w"), {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        });
      });

      // apariciones
      $$(".v2 .fx").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // el logo de la libélula se acerca y gira con el scroll
      gsap.fromTo(
        ".v2-logo img",
        { scale: 0.7, rotate: -12, opacity: 0.2 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".v2-simbolo",
            start: "top 85%",
            end: "center center",
            scrub: true,
          },
        },
      );

      // ---------- tres momentos: escena fija con contador ----------
      const moms = $$(".v2-mom");
      const indice = $$(".v2-mom-indice li");
      const num = $("#mom-n");
      const activar = (n: number) => {
        moms.forEach((m, i) => m.classList.toggle("activo", i === n));
        indice.forEach((m, i) => m.classList.toggle("activo", i === n));
        if (num) num.textContent = String(n + 1).padStart(2, "0");
      };
      activar(0);
      ScrollTrigger.create({
        trigger: ".v2-momentos",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) =>
          activar(
            Math.min(moms.length - 1, Math.floor(st.progress * moms.length)),
          ),
      });

      // ---------- la cartilla se arma en 3D y se abre en el índice ----------
      const ancho = () => window.innerWidth;
      const alto = () => window.innerHeight;
      const lb = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: ".lb-seccion",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      lb.fromTo(
          ".lb-libro",
          { rotateX: 58, rotateZ: -16, scale: 0.78, x: 0 },
          {
            rotateX: 0,
            rotateZ: 0,
            scale: 1,
            duration: 0.55,
            ease: "power1.inOut",
          },
          0,
        )
        .from(
          ".lb-contra",
          { y: () => alto() * 0.9, rotateX: 40, opacity: 0, duration: 0.14 },
          0.02,
        )
        .from(
          ".lb-hoja",
          {
            x: (i: number) =>
              (i % 2 ? 1 : -1) * ancho() * (0.35 + (i % 3) * 0.1),
            y: (i: number) => (i < 3 ? -1 : 1) * alto() * 0.6,
            rotateZ: (i: number) => (i % 2 ? 1 : -1) * (25 + i * 6),
            rotateY: (i: number) => (i % 2 ? -50 : 50),
            opacity: 0,
            stagger: 0.035,
            duration: 0.16,
          },
          0.08,
        )
        .from(
          ".lb-indice",
          { y: () => -alto() * 0.7, rotateZ: 12, opacity: 0, duration: 0.14 },
          0.3,
        )
        .from(
          ".lb-tapa",
          { y: () => -alto() * 0.9, rotateX: -50, opacity: 0, duration: 0.16 },
          0.4,
        )
        // la tapa se abre y el libro abierto queda centrado (en celular se ve la página del índice)
        .to(
          ".lb-tapa",
          { rotateY: -180, duration: 0.25, ease: "power2.inOut" },
          0.62,
        )
        .to(
          ".lb-libro",
          {
            x: () =>
              ancho() < 760
                ? 0
                : (document.querySelector(".lb-libro") as HTMLElement)
                    .offsetWidth / 2,
            duration: 0.25,
            ease: "power2.inOut",
          },
          0.62,
        );

      // ---------- «Recuerda que…» se llena de color ----------
      gsap.fromTo(
        ".v2-relleno",
        { "--lleno": "0%" },
        {
          "--lleno": "100%",
          ease: "none",
          scrollTrigger: {
            trigger: ".v2-recuerda h2",
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        },
      );
    });

    // ---------- el vuelo de la libélula ----------
    const svg = $<SVGSVGElement>("#vuelo");
    const trazo = $<SVGPathElement>("#trazo");
    const base = $<SVGPathElement>("#trazo-base");
    const fly = $("#libelula");
    const inicio = $("#espacio");
    let lut: Array<[number, number, number]> = [];
    let total = 0;
    let y0 = 0;
    const construir = () => {
      if (!svg || !trazo || !base || !inicio) return;
      svg.style.height = "0px";
      const H = root.scrollHeight;
      const W = root.clientWidth;
      const vh = window.innerHeight;
      y0 = inicio.getBoundingClientRect().top + window.scrollY;
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));
      svg.style.height = `${H}px`;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const fin = H - vh * 0.6;
      const n = Math.max(6, Math.round((fin - y0) / (vh * 0.9)));
      const m = 0.06;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= n; i++) {
        const y = y0 + (fin - y0) * (i / n);
        // En celular vuela por el borde derecho para no cruzar los textos.
        if (W < 760) pts.push([W * (i % 2 ? 0.95 : 0.86), y]);
        else
          pts.push([
            W * (i % 2 ? 1 - m : m) +
              (i % 3 === 0 ? W * 0.1 * (i % 2 ? -1 : 1) : 0),
            y,
          ]);
      }
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        const my = (a[1] + b[1]) / 2;
        d += ` C ${a[0]} ${my - 20}, ${b[0]} ${my + 20}, ${b[0]} ${b[1]}`;
      }
      trazo.setAttribute("d", d);
      base.setAttribute("d", d);
      total = trazo.getTotalLength();
      lut = [];
      for (let s = 0; s <= 600; s++) {
        const l = (total * s) / 600;
        const p = trazo.getPointAtLength(l);
        lut.push([l, p.x, p.y]);
      }
      trazo.style.strokeDasharray = String(total);
    };
    const enY = (y: number): [number, number] => {
      let lo = 0;
      let hi = lut.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (lut[mid][2] < y) lo = mid;
        else hi = mid;
      }
      const A = lut[lo];
      const B = lut[hi];
      const t = B[2] - A[2] ? (y - A[2]) / (B[2] - A[2]) : 0;
      return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    };
    let curX = 0;
    let mira = 1;
    let primero = true;
    const mover = (t: number) => {
      if (!lut.length || !trazo || !fly) return;
      const y = window.scrollY + window.innerHeight * 0.5;
      const r = enY(Math.min(Math.max(y, lut[0][2]), lut[lut.length - 1][2]));
      trazo.style.strokeDashoffset = String(total - r[0]);
      if (primero) {
        curX = r[1];
        primero = false;
      }
      const dx = (r[1] - curX) * 0.12;
      curX += dx;
      // La libélula de la cartilla mira a la izquierda: se voltea cuando vuela a la derecha.
      if (Math.abs(dx) > 0.6) mira = dx > 0 ? -1 : 1;
      const visible = y > y0 - window.innerHeight * 0.1;
      const bob = Math.sin(t * 3) * 6;
      fly.style.opacity = visible ? "1" : "0";
      fly.style.transform = `translate(${curX}px, ${y + bob}px) translate(-50%, -50%) rotate(${dx * -0.8}deg) scaleX(${mira})`;
    };
    gsap.ticker.add(mover);

    ScrollTrigger.addEventListener("refresh", construir);
    construir();

    // Con teclado, al llegar al índice baja hasta donde el libro ya está abierto.
    const seccionLibro = $(".lb-seccion");
    const alEnfocar = () => {
      if (!seccionLibro) return;
      const fin = seccionLibro.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      if (window.scrollY < fin - 4) lenis.scrollTo(fin, { immediate: true });
    };
    $(".lb-indice")?.addEventListener("focusin", alEnfocar);

    const alCargar = () => ScrollTrigger.refresh();
    window.addEventListener("load", alCargar);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("load", alCargar);
      $(".lb-indice")?.removeEventListener("focusin", alEnfocar);
      gsap.ticker.remove(mover);
      ScrollTrigger.removeEventListener("refresh", construir);
      gsap.ticker.remove(tick);
      lenis.destroy();
      gctx.revert();
      root.classList.remove("v2-anim");
    };
  }, []);

  return null;
}
