# Lo que queda por tu parte

Todo lo demás está construido y esperando a estos pasos. Ninguno exige tocar código.
Los "secretos" se guardan en GitHub → repositorio **web-esgrima** → **Settings → Secrets and variables → Actions → New repository secret**. Nunca los pegues en un chat.

## 1. Panel de edición (botón "Sign In with GitHub")
1. GitHub → tu foto → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Homepage URL: `https://www.esgrimatorremolinos.com`
3. Authorization callback URL: `https://www.esgrimatorremolinos.com/admin-auth/callback.php`
4. Copia el **Client ID** y genera un **Client secret**.
5. Crea los secretos `GITHUB_OAUTH_CLIENT_ID` y `GITHUB_OAUTH_CLIENT_SECRET`.
6. Avisa a Claude para volver a publicar. Prueba en `/admin/`.

## 2. Área de gestión privada (`/gestion/`): pedidos, convocatorias, calendario
1. Crea los secretos `GESTION_USER` (tu usuario, p. ej. `presidencia`) y `GESTION_PASSWORD` (una contraseña larga).
2. Avisa a Claude para volver a publicar. Entra en `/gestion/`.

## 3. SportMember (calendario automático)
1. En SportMember, crea un usuario solo para la web (p. ej. `web@…`), miembro de los grupos que quieras mostrar, sin permisos de administración.
2. Crea los secretos `SPORTMEMBER_USER` y `SPORTMEMBER_PASSWORD` con sus datos.
3. Opcional: pregunta a SportMember si dan acceso para **crear actividades o avisos** por API (hoy solo está documentado leer y apuntarse).

## 4. Instagram (últimas publicaciones en la portada)
Secretos `INSTAGRAM_USER_ID` e `INSTAGRAM_ACCESS_TOKEN` (cuenta Business/Creator vinculada a una página de Facebook).

## 5. Datos y comprobaciones
- **Registro Andaluz de Entidades Deportivas:** escribe el número en el panel → *Datos del club y contacto → Datos legales*.
- **Tienda:** ya están importados 316 productos de sable de Grant Esgrima y Allstar (nombre, foto, precio orientativo con IVA, tallas, mano y opciones). Te falta escribir tu descripción de cada uno en el panel → *Tienda* (vacía = no se muestra) y desmarcar *Visible* en lo que no quieras ofrecer. Si quieres añadir productos de Yiang, créalos a mano en el panel.
- **Formulario de contacto:** envía un mensaje de prueba y comprueba que llega al Gmail del club.
- **Google Search Console:** envía `https://www.esgrimatorremolinos.com/sitemap.xml`.
- **OVH:** haz una copia de seguridad (archivos y base de datos) para poder limpiar los restos de WordPress.
