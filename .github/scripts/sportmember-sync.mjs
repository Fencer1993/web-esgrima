// Sincroniza el calendario público del club desde SportMember (Holdsport).
// Solo se publican campos públicos: id, título, fechas, lugar, equipo y tipo.
// Nunca asistentes, comentarios ni datos de usuarios.
//
// Uso:   node .github/scripts/sportmember-sync.mjs [--fixture <archivo.json>]
// Env:   SPORTMEMBER_USER, SPORTMEMBER_PASSWORD (obligatorias, si no: no hace nada)
//        SPORTMEMBER_TEAMS (ids de equipo separados por comas, opcional)
//        SPORTMEMBER_SKIP_TRAININGS=1 (descarta los entrenamientos habituales)
//        CALENDAR_PUBLIC_OUT (ruta extra donde escribir el array de items)
// Si algo falla, sale con código 0 sin tocar el archivo existente.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.holdsport.dk/v1";
const DAYS = 120;
const PER_PAGE = 50;
const MAX_PAGES = 40;
const TIMEOUT_MS = 20000;
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/content/data/calendario.generated.json",
);

const fixtureIdx = process.argv.indexOf("--fixture");
const fixturePath = fixtureIdx > -1 ? process.argv[fixtureIdx + 1] : null;
const user = process.env.SPORTMEMBER_USER;
const pass = process.env.SPORTMEMBER_PASSWORD;

function guessType(name) {
  const n = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/torneo|copa|campeonato|competici/.test(n)) return "Competición";
  if (/entren/.test(n)) return "Entrenamiento";
  return "Evento";
}

function isoOrNull(v) {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toPublic(a, team) {
  const title = String(a.name ?? "").trim();
  const start = isoOrNull(a.starttime);
  if (!title || !start || a.id == null) return null;
  return {
    id: `${team.id}-${a.id}`,
    title,
    start,
    end: isoOrNull(a.endtime),
    location: String(a.place ?? "").trim(),
    team: String(team.name ?? "").trim(),
    type: guessType(title),
  };
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url.split("?")[0]}`);
  return res.json();
}

function makeSource() {
  if (fixturePath) {
    return readFile(fixturePath, "utf8").then((txt) => {
      const fx = JSON.parse(txt);
      return {
        teams: async () => fx.teams,
        activities: async (teamId, page, perPage) => {
          const all = fx.activities?.[teamId] ?? [];
          return all.slice((page - 1) * perPage, page * perPage);
        },
      };
    });
  }
  return Promise.resolve({
    teams: () => getJson(`${API}/teams`),
    activities: (teamId, page, perPage, date) =>
      getJson(
        `${API}/teams/${teamId}/activities?page=${page}&per_page=${perPage}&date=${date}`,
      ),
  });
}

async function main() {
  if (!fixturePath && (!user || !pass)) {
    console.log("SportMember no configurado");
    return;
  }
  const src = await makeSource();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const limit = now.getTime() + DAYS * 86400000;
  const only = (process.env.SPORTMEMBER_TEAMS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const skipTrainings = process.env.SPORTMEMBER_SKIP_TRAININGS === "1";

  let teams = await src.teams();
  if (!Array.isArray(teams)) throw new Error("Respuesta de /teams inesperada");
  if (only.length) teams = teams.filter((t) => only.includes(String(t.id)));
  console.log(`SportMember: ${teams.length} equipo(s)`);

  const byId = new Map();
  for (const team of teams) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const rows = await src.activities(team.id, page, PER_PAGE, today);
      if (!Array.isArray(rows) || rows.length === 0) break;
      let inRange = 0;
      for (const a of rows) {
        const item = toPublic(a, team);
        if (!item) continue;
        const t = new Date(item.start).getTime();
        if (t > limit) continue;
        // Las actividades de hoy que ya empezaron siguen siendo útiles; las
        // pasadas las filtra el cargador del sitio.
        inRange++;
        if (skipTrainings && item.type === "Entrenamiento") continue;
        byId.set(item.id, item);
      }
      if (inRange === 0 || rows.length < PER_PAGE) break;
    }
  }

  const items = [...byId.values()].sort((a, b) => a.start.localeCompare(b.start));
  const payload = { updatedAt: now.toISOString(), items };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`SportMember: ${items.length} actividad(es) escritas en ${OUT}`);

  const extra = process.env.CALENDAR_PUBLIC_OUT;
  if (extra) {
    await mkdir(path.dirname(path.resolve(extra)), { recursive: true });
    await writeFile(path.resolve(extra), JSON.stringify(items) + "\n");
    console.log(`SportMember: copia pública en ${extra}`);
  }
}

main().catch((err) => {
  console.error(
    `SportMember: sincronización fallida (${err?.message ?? err}). Se conserva el calendario anterior.`,
  );
  process.exit(0);
});
