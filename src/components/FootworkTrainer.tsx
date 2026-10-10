"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import data from "@/content/data/entrenador.json";
import type { Lang } from "@/content/i18n";
import { nextInterval, pickMove, simulate, type Level, type Movement } from "@/lib/footwork";

// Entrenador de pies por voz. Todo ocurre en el navegador: la voz es la del
// propio móvil (speechSynthesis) y no se envía ni se guarda nada. Los
// movimientos, niveles y tiempos salen de content/data/entrenador.json.

type VoiceLang = "es" | "fr" | "en";
type Phase = "idle" | "ready" | "work" | "rest" | "done";

const moves = data.movimientos as Movement[];
const cfg = data.ajustes;
const levels = data.niveles;
const BCP47: Record<VoiceLang, string> = { es: "es-ES", fr: "fr-FR", en: "en-GB" };

const T = {
  es: {
    level: "Nivel",
    language: "Idioma de las órdenes",
    langs: { es: "Español", fr: "Francés", en: "Inglés" } as Record<VoiceLang, string>,
    duration: "Duración de cada ronda",
    rounds: "Rondas",
    rest: "Descanso entre rondas",
    seconds: (s: number) => (s < 60 ? `${s} s` : `${s / 60} min`),
    voice: "Voz y pitidos",
    voiceOn: "Con sonido",
    voiceOff: "Solo pantalla",
    reaction: "Modo reacción",
    reactionHint: "Sin voz: la pantalla cambia de color y cada color es una orden.",
    legend: "Colores",
    start: "Empezar",
    pause: "Pausa",
    resume: "Seguir",
    stop: "Parar",
    again: "Otra vez",
    idleCommand: "Listo para empezar",
    round: (n: number, t: number) => `Ronda ${n} de ${t}`,
    timeLeft: "Tiempo",
    position: "Pista virtual",
    noVoice: "Este navegador no tiene voz para este idioma: verás las órdenes en pantalla y oirás un pitido.",
    track: (p: number) => (p === 0 ? "en el centro" : p > 0 ? `${p} ${p === 1 ? "paso" : "pasos"} adelante` : `${-p} ${p === -1 ? "paso" : "pasos"} atrás`),
    warning: "Calienta antes y despeja el espacio. Los menores, con un adulto cerca.",
    paused: "En pausa",
    settings: "Ajustes",
    min: "min",
  },
  en: {
    level: "Level",
    language: "Language of the commands",
    langs: { es: "Spanish", fr: "French", en: "English" } as Record<VoiceLang, string>,
    duration: "Length of each round",
    rounds: "Rounds",
    rest: "Rest between rounds",
    seconds: (s: number) => (s < 60 ? `${s} s` : `${s / 60} min`),
    voice: "Voice and beeps",
    voiceOn: "With sound",
    voiceOff: "Screen only",
    reaction: "Reaction mode",
    reactionHint: "No voice: the screen changes colour and each colour is a command.",
    legend: "Colours",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    again: "Again",
    idleCommand: "Ready to start",
    round: (n: number, t: number) => `Round ${n} of ${t}`,
    timeLeft: "Time",
    position: "Virtual piste",
    noVoice: "This browser has no voice for this language: you will see the commands on screen and hear a beep.",
    track: (p: number) => (p === 0 ? "in the centre" : p > 0 ? `${p} ${p === 1 ? "step" : "steps"} forward` : `${-p} ${p === -1 ? "step" : "steps"} back`),
    warning: "Warm up first and clear the space. Under-18s with an adult nearby.",
    paused: "Paused",
    settings: "Settings",
    min: "min",
  },
} as const;

declare global {
  interface Window {
    /** Para las pruebas automáticas: genera órdenes sin voz ni relojes. */
    __footwork?: { simulate: (level: string, n: number, colored?: boolean) => { id: string; pos: number }[] };
  }
}

// --- voces del navegador (lista asíncrona) ---------------------------------

function subscribeVoices(cb: () => void) {
  if (typeof speechSynthesis === "undefined") return () => {};
  speechSynthesis.addEventListener("voiceschanged", cb);
  return () => speechSynthesis.removeEventListener("voiceschanged", cb);
}
/** -1 = el navegador no sabe hablar; 0 = aún sin lista; n = voces disponibles. */
const voicesSnapshot = () => (typeof speechSynthesis === "undefined" ? -1 : speechSynthesis.getVoices().length);

function pickVoice(lang: VoiceLang): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const list = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  return list.find((v) => v.lang.toLowerCase() === BCP47[lang].toLowerCase()) ?? list[0] ?? null;
}

type Settings = {
  level: string;
  voiceLang: VoiceLang;
  duration: number;
  rounds: number;
  rest: number;
  sound: boolean;
  reaction: boolean;
};

function makeEng() {
  return {
    phase: "idle" as Phase,
    paused: false,
    round: 0,
    left: 0, // ms que quedan de la fase
    next: 0, // ms hasta la siguiente orden
    pos: 0,
    prev: undefined as string | undefined,
    count: 0,
    last: 0,
    timer: 0,
    audio: null as AudioContext | null,
    lock: null as WakeLockSentinel | null,
    // Ajustes con los que arrancó la sesión (cambiarlos a mitad no la altera).
    s: { level: levels[0].id, voiceLang: "es", duration: 60, rounds: 3, rest: 30, sound: true, reaction: false } as Settings,
  };
}
type Eng = ReturnType<typeof makeEng>;

const field =
  "mt-1 block w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const labelCls = "block text-sm font-semibold text-ink";
const btn =
  "inline-flex min-h-14 min-w-32 items-center justify-center rounded-sm px-6 py-3 text-base font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type View = {
  phase: Phase;
  paused: boolean;
  round: number;
  seconds: number;
  command: string;
  color: string;
  pos: number;
  count: number;
};
const IDLE: View = { phase: "idle", paused: false, round: 0, seconds: 0, command: "", color: "", pos: 0, count: 0 };

export function FootworkTrainer({ lang = "es" }: { lang?: Lang }) {
  const t = T[lang];
  const [level, setLevel] = useState(levels[0].id);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>(lang);
  const [duration, setDuration] = useState<number>(cfg.duracionPorDefecto);
  const [rounds, setRounds] = useState<number>(cfg.rondas.porDefecto);
  const [rest, setRest] = useState<number>(cfg.descansoPorDefecto);
  const [sound, setSound] = useState(true);
  const [reaction, setReaction] = useState(false);
  const [view, setView] = useState<View>(IDLE);
  const voices = useSyncExternalStore(subscribeVoices, voicesSnapshot, () => 0);

  // Estado del motor (relojes y posición): no hace falta repintar por cada cambio.
  const eng = useRef<Eng>(null as unknown as Eng);
  if (eng.current === null) eng.current = makeEng();

  const voiceMissing = sound && !reaction && (voices === -1 || (voices > 0 && !pickVoice(voiceLang)));

  useEffect(() => {
    window.__footwork = {
      simulate: (lv, n, colored = false) => simulate(moves, lv, cfg.limitePista, n, Math.random, colored),
    };
    return () => {
      delete window.__footwork;
    };
  }, []);

  useEffect(() => {
    const e = eng.current;
    return () => {
      window.clearInterval(e.timer);
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      void e.lock?.release().catch(() => undefined);
      void e.audio?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    // La pantalla se apaga sola al cambiar de pestaña: se vuelve a pedir al volver.
    const onVisible = () => {
      const e = eng.current;
      if (document.visibilityState === "visible" && e.phase !== "idle" && e.phase !== "done") void acquireLock(e);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  async function acquireLock(e: Eng) {
    try {
      if ("wakeLock" in navigator && !e.lock) {
        e.lock = await navigator.wakeLock.request("screen");
        e.lock.addEventListener("release", () => {
          e.lock = null;
        });
      }
    } catch {
      /* sin Wake Lock: la pantalla puede apagarse */
    }
  }

  function beep(freq = 880, ms = 110) {
    const e = eng.current;
    if (!e.s.sound) return;
    try {
      const ctx = e.audio;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1000);
    } catch {
      /* sin audio */
    }
  }

  /** Dice el texto con la voz del móvil; si no hay voz, un pitido corto. */
  function say(text: string) {
    const e = eng.current;
    if (!e.s.sound || e.s.reaction) return;
    const voice = pickVoice(e.s.voiceLang);
    if (typeof speechSynthesis === "undefined" || !voice) {
      beep();
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = cfg.velocidadVoz;
    speechSynthesis.speak(u);
  }

  const texts = () => data.textos[eng.current.s.voiceLang];
  const levelOf = (): Level => levels.find((l) => l.id === eng.current.s.level) ?? levels[0];

  function publish(patch: Partial<View> = {}) {
    const e = eng.current;
    setView((v) => {
      const nv: View = {
        ...v,
        phase: e.phase,
        paused: e.paused,
        round: e.round,
        seconds: Math.max(0, Math.ceil(e.left / 1000)),
        pos: e.pos,
        count: e.count,
        ...patch,
      };
      return Object.keys(nv).every((k) => nv[k as keyof View] === v[k as keyof View]) ? v : nv;
    });
  }

  function issue(m: Movement) {
    const e = eng.current;
    e.pos += m.paso;
    e.prev = m.id;
    const text = m[e.s.voiceLang];
    say(text);
    // Intervalo mínimo entre cambios: nunca más de `cambiosPorSegundoMax` por segundo.
    e.next = nextInterval(levelOf(), Math.random, 1 / cfg.cambiosPorSegundoMax) * 1000;
    publish({ command: text, color: e.s.reaction ? (m.color ?? "") : "" });
  }

  function finishRound() {
    const e = eng.current;
    say(texts().alto);
    if (e.round < e.s.rounds) {
      e.phase = "rest";
      e.left = e.s.rest * 1000;
      publish({ command: texts().descanso, color: "" });
    } else {
      e.phase = "done";
      window.clearInterval(e.timer);
      say(texts().fin);
      void e.lock?.release().catch(() => undefined);
      publish({ command: texts().fin, color: "" });
    }
  }

  function beginCountdown() {
    const e = eng.current;
    e.phase = "ready";
    e.left = cfg.cuentaAtras * 1000;
    e.count = cfg.cuentaAtras;
    say(texts().preparados);
    publish({ command: texts().preparados, color: "" });
  }

  function tick() {
    const e = eng.current;
    const now = performance.now();
    const dt = now - e.last;
    e.last = now;
    if (e.paused || e.phase === "idle" || e.phase === "done") return;
    e.left -= dt;
    if (e.phase === "ready") {
      const c = Math.max(1, Math.ceil(e.left / 1000));
      if (e.left <= 0) {
        e.phase = "work";
        e.round += 1;
        e.left = e.s.duration * 1000;
        e.pos = 0;
        e.prev = undefined;
        e.next = 900;
        say(texts().ya);
        beep(1175, 220);
        publish({ command: texts().ya, color: "" });
        return;
      }
      if (c !== e.count) {
        e.count = c;
        beep(660, 90);
      }
      publish();
    } else if (e.phase === "work") {
      e.next -= dt;
      if (e.left <= 0) {
        finishRound();
        return;
      }
      if (e.next <= 0) {
        const first = e.prev === undefined;
        const m = first
          ? moves.find((x) => x.id === data.primera)
          : pickMove(moves, e.s.level, e.pos, cfg.limitePista, Math.random, e.prev, e.s.reaction);
        if (m) issue(m);
        else e.next = 1000;
      }
      publish();
    } else if (e.phase === "rest") {
      if (e.left <= 0) beginCountdown();
      else publish();
    }
  }

  function start() {
    const e = eng.current;
    e.s = { level, voiceLang, duration, rounds, rest, sound, reaction };
    e.paused = false;
    e.round = 0;
    e.pos = 0;
    e.prev = undefined;
    e.last = performance.now();
    try {
      if (!e.audio) e.audio = new AudioContext();
      void e.audio.resume();
    } catch {
      e.audio = null;
    }
    // En algunos móviles la voz solo se activa dentro de un gesto del usuario.
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    void acquireLock(e);
    window.clearInterval(e.timer);
    e.timer = window.setInterval(tick, 100);
    beginCountdown();
  }

  function stop() {
    const e = eng.current;
    window.clearInterval(e.timer);
    e.phase = "idle";
    e.paused = false;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    void e.lock?.release().catch(() => undefined);
    setView(IDLE);
  }

  function togglePause() {
    const e = eng.current;
    e.paused = !e.paused;
    e.last = performance.now();
    if (e.paused && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    publish();
  }

  const running = view.phase !== "idle" && view.phase !== "done";
  const legend = moves.filter((m) => m.color && m.niveles.includes(level));
  const limit = cfg.limitePista;
  const shown = view.phase === "idle" ? t.idleCommand : view.paused ? t.paused : view.command;
  const mm = Math.floor(view.seconds / 60);
  const ss = String(view.seconds % 60).padStart(2, "0");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="order-1">
        <div
          className="flex min-h-[18rem] flex-col items-center justify-center rounded-sm border border-line bg-ink px-4 py-8 text-center text-paper motion-safe:transition-colors motion-safe:duration-500 sm:min-h-[22rem]"
          style={view.color ? { backgroundColor: view.color } : undefined}
        >
          {running && (
            <p className="font-mono text-sm uppercase tracking-[0.16em] opacity-90">
              {view.phase === "work" ? t.round(view.round, rounds) : view.phase === "rest" ? data.textos[voiceLang].descanso : ""}
            </p>
          )}
          <p
            aria-live="assertive"
            aria-atomic="true"
            className="mt-2 break-words text-4xl font-bold uppercase leading-tight tracking-tight sm:text-6xl"
          >
            {view.phase === "ready" ? `${view.count}` : shown}
          </p>
          {running && (
            <p className="tabular mt-4 text-3xl font-bold sm:text-4xl" aria-label={`${t.timeLeft}: ${mm} ${t.min} ${ss} s`}>
              {mm}:{ss}
            </p>
          )}
          {running && (
            <div className="mt-5 w-full max-w-md" role="img" aria-label={`${t.position}: ${t.track(view.pos)}`}>
              <div className="flex gap-0.5">
                {Array.from({ length: limit * 2 + 1 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 flex-1 rounded-sm ${i - limit === view.pos ? "bg-paper" : "bg-paper/25"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {!running && (
            <button type="button" onClick={start} className={`${btn} bg-accent text-white hover:bg-accent-dark`}>
              {view.phase === "done" ? t.again : t.start}
            </button>
          )}
          {running && (
            <>
              <button type="button" onClick={togglePause} className={`${btn} border border-accent text-accent-dark hover:bg-accent-soft`}>
                {view.paused ? t.resume : t.pause}
              </button>
              <button type="button" onClick={stop} className={`${btn} bg-ink text-paper hover:bg-ink/85`}>
                {t.stop}
              </button>
            </>
          )}
        </div>

        {reaction && (
          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{t.legend}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {legend.map((m) => (
                <li key={m.id} className="flex items-center gap-2 rounded-sm border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink">
                  <span aria-hidden className="inline-block h-4 w-4 rounded-sm" style={{ backgroundColor: m.color }} />
                  {m[voiceLang]}
                </li>
              ))}
            </ul>
          </div>
        )}
        {voiceMissing && <p className="mt-4 text-sm text-ink-soft">{t.noVoice}</p>}
        <p className="mt-4 text-sm font-semibold text-ink">{t.warning}</p>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="order-2 space-y-5 rounded-sm border border-line bg-paper-raised p-5"
        aria-label={t.settings}
      >
        <fieldset disabled={running} className="space-y-5 disabled:opacity-60">
          <fieldset>
            <legend className={labelCls}>{t.level}</legend>
            <div className="mt-2 grid gap-2" role="radiogroup" aria-label={t.level}>
              {levels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={level === l.id}
                  onClick={() => setLevel(l.id)}
                  className={`rounded-sm border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    level === l.id ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink hover:border-accent"
                  }`}
                >
                  <span className="block text-sm font-bold">{(lang === "en" && l.nombre_en) || l.nombre}</span>
                  <span className={`mt-0.5 block text-xs ${level === l.id ? "text-white/90" : "text-ink-soft"}`}>
                    {(lang === "en" && l.descripcion_en) || l.descripcion}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="ft-lang" className={labelCls}>{t.language}</label>
            <select id="ft-lang" className={field} value={voiceLang} onChange={(e) => setVoiceLang(e.target.value as VoiceLang)}>
              {(Object.keys(t.langs) as VoiceLang[]).map((k) => (
                <option key={k} value={k}>{t.langs[k]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ft-dur" className={labelCls}>{t.duration}</label>
              <select id="ft-dur" className={field} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {cfg.duraciones.map((d) => (
                  <option key={d} value={d}>{t.seconds(d)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ft-rounds" className={labelCls}>{t.rounds}</label>
              <select id="ft-rounds" className={field} value={rounds} onChange={(e) => setRounds(Number(e.target.value))}>
                {Array.from({ length: cfg.rondas.max - cfg.rondas.min + 1 }, (_, i) => cfg.rondas.min + i).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ft-rest" className={labelCls}>{t.rest}</label>
            <select id="ft-rest" className={field} value={rest} onChange={(e) => setRest(Number(e.target.value))}>
              {cfg.descansos.map((d) => (
                <option key={d} value={d}>{t.seconds(d)}</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
            <span>
              <span className="font-semibold">{t.voice}</span>
              <span className="block text-xs text-ink-soft">{sound ? t.voiceOn : t.voiceOff}</span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={reaction} onChange={(e) => setReaction(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
            <span>
              <span className="font-semibold">{t.reaction}</span>
              <span className="block text-xs text-ink-soft">{t.reactionHint}</span>
            </span>
          </label>
        </fieldset>
      </form>
    </div>
  );
}
