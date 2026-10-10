<?php
/**
 * Exportación de pedidos a Excel (.xlsx) con el formato de la plantilla del
 * club ("Pedido material – <mes> <año>"): una hoja por mes, primero el
 * "Material del Club" (sin comisión) y luego un bloque por socio con su fila
 * TOTAL. Sin librerías: el .xlsx se monta a mano (XML + ZIP sin compresión).
 */
declare(strict_types=1);

if (!defined('GESTION_APP')) {
    http_response_code(403);
    exit;
}

const XLSX_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** Descuento del proveedor: 5 % en los pedidos de socios, 15 % en el material del club. */
const XLSX_FACTOR_SOCIO = 0.95;
const XLSX_FACTOR_CLUB = 0.85;
const XLSX_IVA = 1.21;
const XLSX_COMISION = 0.1;

/** Catálogo de la tienda por id (para nombre, referencia, enlace y precio). */
function xlsx_catalog(): array
{
    foreach ([gestion_webroot() . '/tienda-productos.json', dirname(gestion_webroot()) . '/src/content/data/tienda.json'] as $f) {
        if (is_file($f)) {
            $d = json_decode((string)file_get_contents($f), true);
            $out = [];
            foreach ((is_array($d['products'] ?? null) ? $d['products'] : []) as $p) {
                if (is_array($p) && isset($p['id'])) {
                    $out[(string)$p['id']] = $p;
                }
            }
            return $out;
        }
    }
    return [];
}

/** "Desde 87,36 €" → 87.36 (precio de socio con descuento e IVA). */
function xlsx_parse_price(string $s): ?float
{
    if (!preg_match('/(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:[.,]\d+)?)/', $s, $m)) {
        return null;
    }
    $n = $m[1];
    $n = strpos($n, ',') !== false ? str_replace(['.', ','], ['', '.'], $n) : $n;
    return (float)$n;
}

/** Mes "AAAA-MM" de un pedido. */
function xlsx_order_month(array $o): string
{
    $t = strtotime((string)($o['created_at'] ?? '')) ?: 0;
    return $t ? date('Y-m', $t) : '';
}

function xlsx_month_title(string $ym): string
{
    [$y, $m] = array_map('intval', explode('-', $ym));
    return XLSX_MESES[$m - 1] . ' ' . $y;
}

/**
 * Filas de una hoja. Cada fila es [col => valor]; un valor que empieza por
 * "=" es fórmula; los números van como float/int.
 * @return array{rows: array<int,array<string,mixed>>, styles: array<int,string>}
 */
function xlsx_month_rows(array $orders, string $ym, array $catalog): array
{
    $club = [];
    $socios = [];
    foreach ($orders as $o) {
        if (($o['status'] ?? '') === 'cancelado' || xlsx_order_month($o) !== $ym) {
            continue;
        }
        $items = [];
        $first = true;
        foreach (($o['lines'] ?? []) as $l) {
            if (!is_array($l)) {
                continue;
            }
            $p = $catalog[(string)($l['product_id'] ?? '')] ?? [];
            $name = (string)($l['name'] ?? ($p['name'] ?? preg_replace('/ · Ref\. .*$/', '', (string)($l['product'] ?? ''))));
            $ref = (string)($l['ref'] ?? ($p['ref'] ?? (preg_match('/ · Ref\. (.+)$/', (string)($l['product'] ?? ''), $rm) ? $rm[1] : '')));
            $price = xlsx_parse_price((string)($l['price'] ?? ($p['price'] ?? '')));
            $notes = [];
            if (trim((string)($l['options'] ?? '')) !== '') {
                $notes[] = (string)$l['options'];
            }
            if (stripos((string)($l['price'] ?? ($p['price'] ?? '')), 'desde') !== false) {
                $notes[] = 'Precio "desde": revisar';
            }
            if ($first && trim((string)($o['notes'] ?? '')) !== '') {
                $notes[] = trim((string)$o['notes']);
            }
            $first = false;
            $items[] = [
                'B' => $name,
                'C' => $ref,
                'D' => (string)($l['url'] ?? ($p['url'] ?? '')),
                'E' => (string)($l['size'] ?? ''),
                'F' => (string)($l['hand'] ?? ''),
                'G' => max(1, (int)($l['qty'] ?? 1)),
                'H' => implode(' · ', $notes),
                // Precio sin IVA del proveedor, deshaciendo el 5 % y el IVA del precio de socio.
                'I' => $price !== null ? round($price / (XLSX_FACTOR_SOCIO * XLSX_IVA), 2) : '',
            ];
        }
        if (!$items) {
            continue;
        }
        if (!empty($o['club'])) {
            array_push($club, ...$items);
        } else {
            $who = trim((string)($o['name'] ?? '')) ?: 'Sin nombre';
            $key = mb_strtolower($who);
            $socios[$key] = $socios[$key] ?? ['name' => $who, 'items' => []];
            array_push($socios[$key]['items'], ...$items);
        }
    }

    $rows = [];
    $styles = [];
    $rows[1] = ['A' => 'Pedido material – ' . xlsx_month_title($ym)];
    $styles[1] = 'title';
    $rows[2] = ['I' => 'Precio sin IVA', 'J' => 'Precio con descuento del 5%', 'K' => 'Precio + IVA', 'L' => 'Comisión Víctor'];
    $styles[2] = 'head';
    $rows[3] = ['B' => 'Nombre pieza', 'C' => 'Referencia', 'D' => 'Enlace', 'E' => 'Talla', 'F' => 'Diestro/Zurdo', 'G' => 'Cantidad', 'H' => 'Notas'];
    $styles[3] = 'head';
    $r = 5;
    $blocks = [];
    if ($club) {
        $blocks[] = ['Material del Club', 'TOTAL Club', $club, XLSX_FACTOR_CLUB, false];
    }
    foreach ($socios as $s) {
        $blocks[] = [$s['name'], 'TOTAL ' . $s['name'], $s['items'], XLSX_FACTOR_SOCIO, true];
    }
    foreach ($blocks as [$label, $totalLabel, $items, $factor, $comision]) {
        $rows[$r] = ['A' => $label];
        $styles[$r] = 'block';
        $r++;
        $start = $r;
        foreach ($items as $it) {
            $q = "IF(N(G$r)=0,1,N(G$r))";
            $it['J'] = "=I$r*$q*" . $factor;
            $it['K'] = "=J$r*" . XLSX_IVA;
            $it['L'] = $comision ? "=I$r*$q*" . XLSX_COMISION : 0;
            $rows[$r] = $it;
            $r++;
        }
        $end = $r - 1;
        $rows[$r] = [
            'B' => $totalLabel,
            'I' => "=SUM(J$start:J$end)/$factor",
            'J' => "=SUM(J$start:J$end)",
            'K' => "=SUM(K$start:K$end)",
            'L' => "=SUM(L$start:L$end)",
        ];
        $styles[$r] = 'total';
        $r += 2;
    }
    return ['rows' => $rows, 'styles' => $styles];
}

/** Valor calculado de las fórmulas sencillas de la plantilla (para vistas previas sin cálculo). */
function xlsx_eval(array $rows, string $col, int $r): float
{
    $v = $rows[$r][$col] ?? 0;
    if (!is_string($v) || $v === '' || $v[0] !== '=') {
        return is_numeric($v) ? (float)$v : 0.0;
    }
    if (preg_match('/^=SUM\(([A-Z])(\d+):[A-Z](\d+)\)(?:\/([\d.]+))?$/', $v, $m)) {
        $s = 0.0;
        for ($i = (int)$m[2]; $i <= (int)$m[3]; $i++) {
            $s += xlsx_eval($rows, $m[1], $i);
        }
        return isset($m[4]) ? $s / (float)$m[4] : $s;
    }
    if (preg_match('/^=I\d+\*IF\(N\(G\d+\)=0,1,N\(G\d+\)\)\*([\d.]+)$/', $v, $m)) {
        $q = (int)($rows[$r]['G'] ?? 0) ?: 1;
        return xlsx_eval($rows, 'I', $r) * $q * (float)$m[1];
    }
    if (preg_match('/^=J\d+\*([\d.]+)$/', $v, $m)) {
        return xlsx_eval($rows, 'J', $r) * (float)$m[1];
    }
    return 0.0;
}

function xlsx_esc(string $s): string
{
    $s = preg_replace('/[^\x09\x0A\x0D\x20-\x{D7FF}\x{E000}-\x{FFFD}]/u', '', $s) ?? '';
    return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

/** XML de una hoja. Estilos: 0 normal, 1 título, 2 cabecera, 3 bloque, 4 dinero, 5 total texto, 6 total dinero. */
function xlsx_sheet_xml(array $sheet): string
{
    $rows = $sheet['rows'];
    $styles = $sheet['styles'];
    ksort($rows);
    $x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        . '<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        . '<cols><col min="1" max="1" width="20" customWidth="1"/><col min="2" max="2" width="44" customWidth="1"/>'
        . '<col min="3" max="3" width="13" customWidth="1"/><col min="4" max="4" width="30" customWidth="1"/>'
        . '<col min="5" max="7" width="11" customWidth="1"/><col min="8" max="8" width="36" customWidth="1"/>'
        . '<col min="9" max="12" width="15" customWidth="1"/></cols><sheetData>';
    foreach ($rows as $r => $cells) {
        $st = $styles[$r] ?? '';
        $x .= '<row r="' . $r . '">';
        foreach (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as $c) {
            if (!array_key_exists($c, $cells) || $cells[$c] === '') {
                continue;
            }
            $v = $cells[$c];
            $money = in_array($c, ['I', 'J', 'K', 'L'], true);
            $s = 0;
            if ($st === 'title') { $s = 1; }
            elseif ($st === 'head') { $s = 2; }
            elseif ($st === 'block') { $s = 3; }
            elseif ($st === 'total') { $s = $money ? 6 : 5; }
            elseif ($money) { $s = 4; }
            $ref = $c . $r;
            if (is_string($v) && $v !== '' && $v[0] === '=') {
                $val = round(xlsx_eval($rows, $c, (int)$r), 6);
                $x .= '<c r="' . $ref . '" s="' . $s . '"><f>' . xlsx_esc(substr($v, 1)) . '</f><v>' . $val . '</v></c>';
            } elseif (is_int($v) || is_float($v)) {
                $x .= '<c r="' . $ref . '" s="' . $s . '"><v>' . $v . '</v></c>';
            } elseif ($c === 'E' && preg_match('/^\d+$/', (string)$v)) {
                // Tallas numéricas (38, 158…) como número, igual que en la plantilla.
                $x .= '<c r="' . $ref . '" s="' . $s . '"><v>' . (int)$v . '</v></c>';
            } else {
                $x .= '<c r="' . $ref . '" s="' . $s . '" t="inlineStr"><is><t xml:space="preserve">' . xlsx_esc((string)$v) . '</t></is></c>';
            }
        }
        $x .= '</row>';
    }
    return $x . '</sheetData><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
}

/** Fichero .xlsx con una hoja por mes ("Septiembre", "Octubre"…). */
function xlsx_build(array $orders, array $months): string
{
    $catalog = xlsx_catalog();
    $files = [];
    $sheetsXml = '';
    $relsXml = '';
    $ctXml = '';
    foreach (array_values($months) as $i => $ym) {
        $n = $i + 1;
        $files["xl/worksheets/sheet$n.xml"] = xlsx_sheet_xml(xlsx_month_rows($orders, $ym, $catalog));
        $name = ucfirst(XLSX_MESES[(int)substr($ym, 5, 2) - 1]);
        if (count(array_unique(array_map(fn($m) => substr($m, 5, 2), $months))) < count($months)) {
            $name .= ' ' . substr($ym, 0, 4);
        }
        $sheetsXml .= '<sheet name="' . xlsx_esc($name) . '" sheetId="' . $n . '" r:id="rId' . $n . '"/>';
        $relsXml .= '<Relationship Id="rId' . $n . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' . $n . '.xml"/>';
        $ctXml .= '<Override PartName="/xl/worksheets/sheet' . $n . '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    }
    $k = count($months) + 1;
    $files['[Content_Types].xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        . '<Default Extension="xml" ContentType="application/xml"/>'
        . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        . $ctXml . '</Types>';
    $files['_rels/.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        . '</Relationships>';
    $files['xl/workbook.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        . '<sheets>' . $sheetsXml . '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';
    $files['xl/_rels/workbook.xml.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . $relsXml
        . '<Relationship Id="rId' . $k . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
        . '</Relationships>';
    $files['xl/styles.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        . '<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00\ &quot;€&quot;"/></numFmts>'
        . '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font></fonts>'
        . '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
        . '<fill><patternFill patternType="solid"><fgColor rgb="FFE3F1F9"/><bgColor indexed="64"/></patternFill></fill></fills>'
        . '<borders count="2"><border/><border><top style="thin"/></border></borders>'
        . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        . '<cellXfs count="7">'
        . '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        . '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        . '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment wrapText="1" vertical="center"/></xf>'
        . '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        . '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
        . '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>'
        . '<xf numFmtId="164" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"/>'
        . '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    return xlsx_zip($files);
}

/** ZIP sin compresión (método "store"): suficiente para un .xlsx y sin extensiones de PHP. */
function xlsx_zip(array $files): string
{
    $data = '';
    $central = '';
    $n = 0;
    [$dosTime, $dosDate] = [((int)date('H') << 11) | ((int)date('i') << 5) | intdiv((int)date('s'), 2), (((int)date('Y') - 1980) << 9) | ((int)date('n') << 5) | (int)date('j')];
    foreach ($files as $name => $content) {
        $crc = crc32($content);
        $len = strlen($content);
        $offset = strlen($data);
        $data .= "PK\x03\x04" . pack('vvvvvVVVvv', 20, 0x0800, 0, $dosTime, $dosDate, $crc, $len, $len, strlen($name), 0) . $name . $content;
        $central .= "PK\x01\x02" . pack('vvvvvvVVVvvvvvVV', 20, 20, 0x0800, 0, $dosTime, $dosDate, $crc, $len, $len, strlen($name), 0, 0, 0, 0, 0, $offset) . $name;
        $n++;
    }
    return $data . $central . "PK\x05\x06" . pack('vvvvVVv', 0, 0, $n, $n, strlen($central), strlen($data), 0);
}
