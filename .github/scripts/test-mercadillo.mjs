// Prueba de extremo a extremo del mercadillo con `php -S` local:
// publicar → oculto hasta aprobar → foto 404 y luego 200 → el anunciante
// marca vendido con su enlace privado. Copia public/ a una carpeta temporal
// (con su propia carpeta privada), así no deja datos en el repositorio.
//
//   node .github/scripts/test-mercadillo.mjs
import { execFileSync, spawn } from "node:child_process";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repo = resolve(import.meta.dirname, "../..");
const tmp = mkdtempSync(join(tmpdir(), "mercadillo-test-"));
const web = join(tmp, "web");
cpSync(join(repo, "public"), web, { recursive: true });
cpSync(join(repo, "src/content/data/mercadillo.json"), join(web, "mercadillo-config.json"));
const hash = execFileSync("php", ["-r", 'echo password_hash("clave-de-prueba", PASSWORD_DEFAULT);']).toString();
writeFileSync(
  join(web, "gestion/config.php"),
  `<?php\ndefine("GESTION_USER","tester");\ndefine("GESTION_PASS_HASH",'${hash}');\n`,
);
// Sin sendmail en el equipo de pruebas: los correos se escriben en un fichero.
const mailLog = join(tmp, "mail.log");
writeFileSync(join(tmp, "php.ini"), `sendmail_path = "cat >> ${mailLog}"\nupload_max_filesize = 4M\npost_max_size = 12M\n`);

const port = 8700 + Math.floor(Math.random() * 200);
const base = `http://127.0.0.1:${port}`;
const server = spawn("php", ["-c", join(tmp, "php.ini"), "-S", `127.0.0.1:${port}`, "-t", web], { stdio: "ignore" });
const cleanup = () => {
  server.kill();
  rmSync(tmp, { recursive: true, force: true });
};
process.on("exit", cleanup);

for (let i = 0; i < 50; i++) {
  try {
    await fetch(`${base}/mercadillo.php?lista`);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 100));
  }
}

const jpeg = execFileSync("php", [
  "-r",
  '$i=imagecreatetruecolor(1600,900);imagefill($i,0,0,imagecolorallocate($i,30,120,200));ob_start();imagejpeg($i,null,85);echo ob_get_clean();',
]);

function form(over = {}, photos = [jpeg]) {
  const f = new FormData();
  const base = {
    kind: "vendo", category: "careta", title: "Careta de sable talla M", description: "Muy poco uso.",
    size: "M", hand: "diestro", condition: "como-nuevo", price: "45", zone: "Torremolinos",
    name: "Ana", phone: "612 34 56 78", email: "ana@example.com", adult: "on", share: "on", privacy: "on",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) f.append(k, v);
  for (const p of photos) f.append("photos[]", new Blob([p], { type: "image/jpeg" }), "foto.jpg");
  return f;
}
const post = async (f) => {
  const r = await fetch(`${base}/mercadillo.php`, { method: "POST", body: f });
  return { status: r.status, json: await r.json() };
};
const lista = async () => (await (await fetch(`${base}/mercadillo.php?lista`)).json()).items;
const priv = async (token, accion) => {
  const r = await fetch(`${base}/mercadillo.php`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, accion }),
  });
  return { status: r.status, json: await r.json() };
};

// Validaciones
assert.equal((await post(form({ privacy: "" }))).status, 400, "sin casilla de privacidad");
assert.equal((await post(form({ phone: "123" }))).status, 400, "teléfono malo");
assert.equal((await post(form({ category: "coche" }))).status, 400, "tipo no válido");
assert.equal((await post(form({ price: "" }))).status, 400, "vendo sin precio");
assert.equal((await post(form({}, [Buffer.from("no soy una imagen")]))).status, 400, "foto falsa");
assert.equal((await post(form({}, [jpeg, jpeg, jpeg, jpeg]))).status, 400, "más de 3 fotos");
assert.deepEqual(await lista(), [], "nada publicado todavía");

// Honeypot: éxito falso, no guarda nada
assert.equal((await post(form({ website: "http://spam" }))).json.ok, true);

// Publicar
const ok = await post(form());
assert.equal(ok.status, 200, JSON.stringify(ok.json));
assert.equal(ok.json.ok, true);
assert.deepEqual(await lista(), [], "pendiente: no sale en ?lista");

const dataDir = join(tmp, "club-data");
const rows = readFileSync(join(dataDir, "mercadillo.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
assert.equal(rows.length, 1);
assert.equal(rows[0].status, "pendiente");
assert.equal(rows[0].phone, "34612345678");
assert.ok(rows[0].token_hash && !("token" in rows[0]), "el token solo se guarda con hash");
const photoId = rows[0].photos[0];
assert.equal(readdirSync(join(dataDir, "mercadillo-fotos")).length, 1);

// Correos: al club y al anunciante con el enlace privado
const mails = readFileSync(mailLog, "utf8");
assert.match(mails, /Hay un anuncio nuevo pendiente/);
const token = /mi-anuncio\/#([a-f0-9]{48})/.exec(mails)?.[1];
assert.ok(token, "el correo del anunciante lleva el enlace privado");
assert.ok(!rows[0].token_hash.includes(token));

// Foto: 404 hasta aprobar
assert.equal((await fetch(`${base}/mercadillo.php?foto=${photoId}`)).status, 404, "foto 404 antes de aprobar");
assert.equal((await fetch(`${base}/mercadillo.php?foto=../../etc/passwd`)).status, 404);
// El anunciante ve su anuncio pendiente; token falso → 404
assert.equal((await priv(token, "ver")).json.ad.status, "pendiente");
assert.equal((await priv("0".repeat(48), "ver")).status, 404);

// Gestión: sin sesión no entra; con sesión aprueba
let cookie = "";
const gfetch = async (path, init = {}) => {
  const r = await fetch(`${base}/gestion/${path}`, { ...init, redirect: "manual", headers: { ...(init.headers || {}), cookie } });
  const sc = r.headers.getSetCookie?.() ?? [];
  if (sc.length) cookie = sc.map((c) => c.split(";")[0]).join("; ");
  return r;
};
let html = await (await gfetch("mercadillo.php")).text();
assert.ok(!html.includes("Careta de sable"), "sin sesión no se ve nada");
const csrf0 = /name="csrf" value="([a-f0-9]+)"/.exec(html)[1];
let r = await gfetch("mercadillo.php", {
  method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ do: "login", csrf: csrf0, user: "tester", pass: "clave-de-prueba" }),
});
assert.equal(r.status, 302, "login");
html = await (await gfetch("mercadillo.php")).text();
assert.ok(html.includes("Careta de sable talla M") && html.includes("ana@example.com"), "gestión muestra el anuncio con el correo");
assert.equal((await gfetch(`mercadillo.php?foto=${photoId}`)).status, 200, "en gestión la foto se ve siempre");
const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(html)[1];
const act = async (data) =>
  gfetch("mercadillo.php", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrf, id: rows[0].id, ...data }),
  });
assert.equal((await gfetch("mercadillo.php", { method: "POST", body: new URLSearchParams({ do: "aprobar", id: rows[0].id }), headers: { "Content-Type": "application/x-www-form-urlencoded" } })).status, 400, "sin CSRF se rechaza");
await act({ do: "aprobar" });

const pub = await lista();
assert.equal(pub.length, 1, "aprobado: sale en ?lista");
assert.equal(pub[0].title, "Careta de sable talla M");
assert.equal(pub[0].phone, "34612345678");
assert.ok(!JSON.stringify(pub).includes("ana@example.com") && !JSON.stringify(pub).includes("token"), "la lista no lleva correo ni token");
const photo = await fetch(`${base}/mercadillo.php?foto=${photoId}`);
assert.equal(photo.status, 200, "foto 200 tras aprobar");
assert.equal(photo.headers.get("content-type"), "image/jpeg");
assert.match(readFileSync(mailLog, "utf8"), /ya est[aá] publicado/);

// Renovar: todavía no toca
assert.equal((await priv(token, "renovar")).status, 400);

// Caducidad: se oculta (y la foto vuelve a 404)
const file = join(dataDir, "mercadillo.jsonl");
const old = readFileSync(file, "utf8");
const expired = JSON.parse(old.trim());
expired.expires_at = new Date(Date.now() - 86400000).toISOString();
writeFileSync(file, JSON.stringify(expired) + "\n");
assert.deepEqual(await lista(), [], "caducado: oculto");
assert.equal((await fetch(`${base}/mercadillo.php?foto=${photoId}`)).status, 404);
assert.equal((await priv(token, "ver")).json.ad.expired, true);
// Dentro de la ventana de renovación (caducado ayer) se puede renovar 30 días
assert.equal((await priv(token, "renovar")).json.ok, true);
assert.equal((await lista()).length, 1, "renovado: vuelve a salir");

// El anunciante lo marca vendido con su enlace privado
assert.equal((await priv(token, "vendido")).json.status, "vendido");
assert.deepEqual(await lista(), [], "vendido: oculto");
assert.equal((await fetch(`${base}/mercadillo.php?foto=${photoId}`)).status, 404);

// Borrar: quita datos y fotos
assert.equal((await priv(token, "borrar")).json.status, "borrado");
assert.equal(readFileSync(file, "utf8").trim(), "");
assert.equal(readdirSync(join(dataDir, "mercadillo-fotos")).length, 0);

// Límite diario: el cuarto anuncio desde la misma IP da 429
// (la foto falsa y el anuncio ya gastaron 2 de los 3 permitidos)
assert.equal((await post(form({ title: "Guante de prueba" }, []))).status, 200);
assert.equal((await post(form({ title: "Otro más" }, []))).status, 429, "límite de 3 anuncios por IP y día");

console.log("mercadillo: OK");
process.exit(0);
