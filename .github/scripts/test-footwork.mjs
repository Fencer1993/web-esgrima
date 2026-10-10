// Prueba de la lógica del entrenador de pies con los datos reales de
// src/content/data/entrenador.json. Uso:
//   node --experimental-strip-types .github/scripts/test-footwork.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  SESSION_LIMITS, clubSession, customMoves, decodeSession, encodeSession, nextInterval, normalizeSession, pickMove, simulate,
} from "../../src/lib/footwork.ts";

const data = JSON.parse(readFileSync(new URL("../../src/content/data/entrenador.json", import.meta.url), "utf8"));
const { movimientos, niveles, ajustes, primera } = data;
const limit = ajustes.limitePista;

// Generador pseudoaleatorio con semilla (para que la prueba sea repetible).
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

for (const lvl of niveles) {
  for (const seed of [1, 7, 42]) {
    const run = simulate(movimientos, lvl.id, limit, 200, seeded(seed));
    assert.equal(run.length, 200, `${lvl.id}: se generaron 200 órdenes`);
    const worst = Math.max(...run.map((r) => Math.abs(r.pos)));
    assert.ok(worst <= limit, `${lvl.id}: posición máxima ${worst} > ${limit}`);
    const ids = new Set(run.map((r) => r.id));
    const allowed = new Set(movimientos.filter((m) => m.niveles.includes(lvl.id) && m.peso > 0).map((m) => m.id));
    for (const id of ids) assert.ok(allowed.has(id), `${lvl.id}: «${id}» no es de este nivel`);
    assert.ok(ids.size >= Math.min(4, allowed.size), `${lvl.id}: poca variedad (${ids.size})`);
    assert.ok(!run.some((r, i) => i > 0 && r.id === run[i - 1].id), `${lvl.id}: orden repetida seguida`);
  }
  console.log("ok - nivel", lvl.id);
}

// En el límite se fuerza la orden contraria.
assert.ok(pickMove(movimientos, "iniciacion", limit, limit, () => 0.5).paso < 0);
assert.ok(pickMove(movimientos, "iniciacion", -limit, limit, () => 0.5).paso > 0);
console.log("ok - límite de la pista fuerza la orden contraria");

// Modo reacción: solo movimientos con color.
const react = simulate(movimientos, "competicion", limit, 200, seeded(3), true);
assert.ok(react.every((r) => movimientos.find((m) => m.id === r.id).color), "reacción: solo órdenes con color");
assert.ok(Math.max(...react.map((r) => Math.abs(r.pos))) <= limit);
console.log("ok - modo reacción");

// Intervalos dentro del rango del nivel y con mínimo para evitar destellos.
for (const lvl of niveles) {
  for (let i = 0; i < 200; i++) {
    const s = nextInterval(lvl, Math.random, 1 / ajustes.cambiosPorSegundoMax);
    assert.ok(s >= lvl.min - 1e-9 && s <= lvl.max + 1e-9 && s >= 0.5);
  }
}
assert.ok(movimientos.some((m) => m.id === primera), "existe la orden inicial");
for (const m of movimientos) for (const l of ["es", "fr", "en"]) assert.ok(m[l], `${m.id} sin texto ${l}`);
console.log("ok - intervalos y textos en es/fr/en");

// --- sesiones para compartir ---------------------------------------------
const cfg1 = {
  name: "Sofía ñ — prueba", lang: "fr", mode: "colores", duration: 90, rounds: 4, rest: 45, min: 1.1, max: 2.3,
  moves: [{ id: "avance", f: 2 }, { id: "retroceso", f: 0.5 }, { id: "fondo", f: 1 }],
};
const enc = encodeSession(cfg1, movimientos);
assert.ok(enc.ok && /^[A-Za-z0-9_-]+$/.test(enc.code), "codifica en base64url");
const dec = decodeSession(enc.code, movimientos);
assert.ok(dec.ok);
assert.deepEqual(dec.config, cfg1, "redondo: lo decodificado es lo codificado");
console.log("ok - sesión: codificar y decodificar (redondo)");

// Datos corruptos: error controlado, nunca una excepción.
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const bad = [
  "", "%%%", "abc", "a".repeat(50), enc.code.slice(0, -7), enc.code + "!!", b64("no es json"), b64("null"), b64("[1,2]"),
  b64({ v: 2, w: [["avance", 1]] }), b64({ v: 1 }), b64({ v: 1, w: [] }), b64({ v: 1, w: "avance" }), b64({ v: 1, w: [[5, 1]] }),
];
for (const code of bad) {
  let r;
  assert.doesNotThrow(() => (r = decodeSession(code, movimientos)), `no lanza con «${code.slice(0, 12)}»`);
  assert.equal(r.ok, false, `error controlado con «${code.slice(0, 12)}»`);
}
assert.equal(decodeSession(b64({ v: 2, w: [["avance", 1]] }), movimientos).error, "version");
console.log("ok - sesión: datos corruptos dan error controlado");

// Tamaño máximo.
const huge = decodeSession("a".repeat(SESSION_LIMITS.maxEncoded + 1), movimientos);
assert.deepEqual(huge, { ok: false, error: "largo" });
const longName = encodeSession({ ...cfg1, name: "x".repeat(500) }, movimientos);
assert.ok(longName.ok && decodeSession(longName.code, movimientos).config.name.length === SESSION_LIMITS.maxName, "nombre recortado");
const padded = b64({ v: 1, n: "x", w: [["avance", 1]], extra: "y".repeat(SESSION_LIMITS.maxEncoded) });
assert.equal(decodeSession(padded, movimientos).error, "largo");
console.log("ok - sesión: tamaño máximo");

// Movimientos desconocidos (o que nunca salen al azar) se rechazan.
assert.equal(decodeSession(b64({ v: 1, w: [["avance", 1], ["inventado", 1]] }), movimientos).error, "movimientos");
assert.equal(decodeSession(b64({ v: 1, w: [["guardia", 1]] }), movimientos).error, "movimientos");
assert.equal(encodeSession({ ...cfg1, moves: [{ id: "inventado", f: 1 }] }, movimientos).ok, false);
console.log("ok - sesión: movimientos desconocidos rechazados");

// Números acotados; duplicados fusionados.
const wild = normalizeSession(
  { v: 1, n: "t", d: 99999, r: -5, t: 1e9, p: [100, -3], l: "xx", m: "z", w: [["avance", 1e9], ["avance", 1], ["fondo", "mucha"]] },
  movimientos,
);
assert.ok(wild.ok);
const c = wild.config;
assert.ok(c.duration === SESSION_LIMITS.duration[1] && c.rounds === SESSION_LIMITS.rounds[0] && c.rest === SESSION_LIMITS.rest[1]);
assert.ok(c.min <= c.max && c.max <= SESSION_LIMITS.paceMax && c.min >= SESSION_LIMITS.paceMin);
assert.equal(c.lang, "es");
assert.equal(c.mode, "voz");
assert.deepEqual(c.moves, [{ id: "avance", f: SESSION_LIMITS.factor[1] }, { id: "fondo", f: 1 }]);
console.log("ok - sesión: números acotados");

// La sesión a medida solo saca sus movimientos y respeta la pista.
const pool = customMoves(cfg1, movimientos);
const custom = simulate(pool, "custom", limit, 200, seeded(5), true);
assert.equal(custom.length, 200);
assert.ok(custom.every((r) => ["avance", "retroceso", "fondo"].includes(r.id)));
assert.ok(Math.max(...custom.map((r) => Math.abs(r.pos))) <= limit);
console.log("ok - sesión a medida");

// Sesiones del club, por edad y ritmos del json.
assert.ok(data.sesiones.length >= 3, "al menos 3 sesiones del club de ejemplo");
for (const s of data.sesiones) assert.ok(clubSession(s, movimientos).ok, `sesión del club «${s.nombre}» válida`);
for (const a of data.porEdad) {
  assert.ok(niveles.some((l) => l.id === a.nivel), `por edad «${a.nombre}»: nivel existente`);
  assert.ok(ajustes.duraciones.includes(a.duracion) && ajustes.descansos.includes(a.descanso), `por edad «${a.nombre}»: tiempos elegibles`);
  assert.ok(a.rondas >= ajustes.rondas.min && a.rondas <= ajustes.rondas.max);
}
for (const r of data.ritmos) assert.ok(r.min > 0 && r.max >= r.min);
console.log("ok - sesiones del club, por edad y ritmos");
