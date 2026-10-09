<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';
gestion_header('Convocatorias', 'convocatoria.php');
?>
<h1>Convocatorias y avisos</h1>
<p class="muted">Rellena el formulario y copia los textos. No se guarda nada en el servidor.</p>
<form id="f" onsubmit="return false">
  <div class="cards">
    <label>Tipo<br><select id="tipo"><option>Convocatoria</option><option>Aviso de reunión</option><option>Noticia</option></select></label>
    <label>Título<br><input type="text" id="titulo" style="width:100%"></label>
    <label>Fecha y hora<br><input type="datetime-local" id="fecha"></label>
    <label>Lugar<br><input type="text" id="lugar" style="width:100%"></label>
    <label>Plazo de inscripción<br><input type="text" id="plazo" placeholder="p. ej. 20 de octubre" style="width:100%"></label>
  </div>
  <h3>Grupos</h3>
  <div class="row" id="grupos">
    <label><input type="checkbox" value="Niños"> Niños</label>
    <label><input type="checkbox" value="Adolescentes y Adultos"> Adolescentes y Adultos</label>
    <label><input type="checkbox" value="Tecnificación 13-18"> Tecnificación 13-18</label>
    <label><input type="checkbox" value="Tecnificación +18"> Tecnificación +18</label>
    <label><input type="checkbox" value="Silla de ruedas"> Silla de ruedas</label>
  </div>
  <h3>Material / qué traer</h3><textarea id="material" rows="2"></textarea>
  <h3>Texto adicional</h3><textarea id="extra" rows="4"></textarea>
</form>

<h2>WhatsApp</h2><textarea id="o-wa" rows="10" readonly></textarea>
<p><button class="btn" data-copy="o-wa">Copiar</button></p>
<h2>SportMember</h2><textarea id="o-sm" rows="12" readonly></textarea>
<p><button class="btn" data-copy="o-sm">Copiar</button></p>
<h2>Noticia web (noticias.json)</h2><textarea id="o-js" rows="14" readonly></textarea>
<p><button class="btn" data-copy="o-js">Copiar</button> <span id="copied" class="muted"></span></p>

<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function grupos() {
    return Array.prototype.map.call(document.querySelectorAll('#grupos input:checked'), function (c) { return c.value; });
  }
  function fechaLarga(d) {
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }
  function hora(d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function slugify(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function gen() {
    var tipo = $('tipo').value, titulo = $('titulo').value.trim() || tipo;
    var fv = $('fecha').value, d = fv ? new Date(fv) : null;
    var lugar = $('lugar').value.trim(), plazo = $('plazo').value.trim();
    var mat = $('material').value.trim(), extra = $('extra').value.trim(), gs = grupos();
    var cuando = d ? fechaLarga(d) + ', ' + hora(d) + ' h' : '';

    var wa = ['*' + tipo.toUpperCase() + ': ' + titulo + '*', ''];
    if (cuando) wa.push('📅 ' + cuando);
    if (lugar) wa.push('📍 ' + lugar);
    if (gs.length) wa.push('👥 ' + gs.join(', '));
    if (mat) wa.push('🎒 ' + mat);
    if (plazo) wa.push('⏰ Inscripción hasta: *' + plazo + '*');
    if (extra) wa.push('', extra);
    wa.push('', '_Club de Esgrima Torremolinos_');
    $('o-wa').value = wa.join('\n');

    var sm = [tipo + ': ' + titulo, ''];
    if (cuando) sm.push('Fecha y hora: ' + cuando);
    if (lugar) sm.push('Lugar: ' + lugar);
    if (gs.length) sm.push('Dirigido a: ' + gs.join(', '));
    if (mat) sm.push('', 'Material / qué traer:', mat);
    if (plazo) sm.push('', 'Plazo de inscripción: ' + plazo);
    if (extra) sm.push('', extra);
    sm.push('', 'Un saludo,', 'Club de Esgrima Torremolinos');
    $('o-sm').value = sm.join('\n');

    var resumen = [cuando, lugar].filter(Boolean).join(' · ') || titulo;
    var body = [];
    if (cuando) body.push('Fecha y hora: ' + cuando + '.');
    if (lugar) body.push('Lugar: ' + lugar + '.');
    if (gs.length) body.push('Grupos: ' + gs.join(', ') + '.');
    if (mat) body.push('Material: ' + mat);
    if (plazo) body.push('Plazo de inscripción: ' + plazo + '.');
    if (extra) body.push(extra);
    var iso = d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10);
    $('o-js').value = JSON.stringify({
      slug: slugify(titulo), date: iso, type: tipo, title: titulo,
      summary: resumen, body: body.join('\n\n'), image: '', pinned: false
    }, null, 2);
  }
  document.getElementById('f').addEventListener('input', gen);
  document.getElementById('f').addEventListener('change', gen);
  gen();

  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    b.addEventListener('click', function () {
      var ta = $(b.getAttribute('data-copy')), txt = ta.value;
      function done() { $('copied').textContent = 'Copiado'; setTimeout(function () { $('copied').textContent = ''; }, 1800); }
      function fallback() { ta.focus(); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { $('copied').textContent = 'Selecciona y copia manualmente'; } }
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(done, fallback); } else { fallback(); }
    });
  });
})();
</script>
<?php gestion_footer();
