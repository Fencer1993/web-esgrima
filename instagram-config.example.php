<?php
/**
 * Plantilla de configuración para el feed de Instagram.
 *
 * En producción este archivo NO se sube tal cual: el flujo de
 * despliegue a OVH genera automáticamente instagram-config.php a
 * partir de los secrets INSTAGRAM_USER_ID e INSTAGRAM_ACCESS_TOKEN de
 * GitHub, así que el token real nunca queda guardado en el repositorio.
 *
 * Para probarlo en local, copia este archivo como instagram-config.php
 * (está en .gitignore) y rellena los valores reales.
 */

// ID de la cuenta de Instagram Empresa/Creador (Instagram Business Account ID).
define("INSTAGRAM_USER_ID", "");

// Token de acceso de larga duración (Graph API, permiso instagram_basic).
define("INSTAGRAM_ACCESS_TOKEN", "");
