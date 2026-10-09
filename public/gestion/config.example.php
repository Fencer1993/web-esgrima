<?php
/**
 * Plantilla de configuración de /gestion/.
 *
 * config.php NO está en el repositorio: se genera en el despliegue a partir
 * de los secretos de GitHub GESTION_USER y GESTION_PASSWORD (la contraseña se
 * guarda ya hasheada con password_hash). Para probar en local, copia este
 * archivo como config.php y genera el hash con:
 *
 *   php -r 'echo password_hash("tu-contraseña", PASSWORD_DEFAULT), PHP_EOL;'
 */

define('GESTION_USER', 'presidente');
define('GESTION_PASS_HASH', '$2y$10$...pega_aqui_el_hash...');
