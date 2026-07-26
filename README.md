# El Médico Ancestral

Aplicación web progresiva (PWA) mobile-first, preparada para GitHub Pages.

## Contenido incluido

- 330 recetas organizadas por sistemas y malestares.
- 30 fichas de plantas medicinales.
- 6 métodos base de preparación.
- Guías resumidas de botiquín, infancia, conservación, aromaterapia, bienestar femenino, belleza herbal y prácticas energéticas.
- Consulta guiada con semáforo de seguridad, favoritos, historial reciente y “Mi botica”.
- Datos personales guardados en `localStorage` del dispositivo.

## Publicar en GitHub Pages

1. Descomprimí `el-medico-ancestral-github.zip`.
2. Creá un repositorio nuevo en GitHub.
3. Subí **todo el contenido de la carpeta `el-medico-ancestral`**. `index.html` debe quedar en la raíz del repositorio.
4. Abrí **Settings → Pages**.
5. En **Build and deployment**, elegí **Deploy from a branch**.
6. Seleccioná la rama **main** y la carpeta **/(root)**.
7. Guardá y esperá a que GitHub muestre el enlace público.

## Agregar al inicio del celular

### iPhone / Safari

Abrí la URL publicada → botón Compartir → **Agregar a inicio**.

### Android / Chrome

Abrí la URL publicada → menú del navegador → **Instalar aplicación** o **Agregar a pantalla principal**.

## Archivos principales

- `index.html`: estructura principal.
- `styles.css`: identidad visual y diseño responsive.
- `app.js`: navegación, filtros, consulta, botica y almacenamiento local.
- `data/recipes-data.js`: recetas estructuradas.
- `data/library-data.js`: plantas, preparaciones, guías y seguridad.
- `manifest.webmanifest` y `service-worker.js`: instalación y funcionamiento offline.

## Nota editorial y clínica importante

El contenido fue estructurado a partir de los archivos entregados por la autora. Durante la extracción se corrigieron únicamente guiones numéricos dañados por el PDF (por ejemplo, `15320` → `15–20`). Antes de una publicación comercial, una profesional responsable debe revisar de forma sistemática dosis, nombres botánicos, usos, contraindicaciones, interacciones, edades, conservación y coherencia entre documentos.

La aplicación incluye avisos y un semáforo de seguridad, pero no diagnostica ni reemplaza atención profesional.

## Actualización v2.1
Esta versión incluye todos los datos de recetas, plantas y biblioteca dentro de `app.js`, para evitar que una carpeta `data/` omitida al subir archivos deje la aplicación vacía. También coloca el logo y los íconos principales en la raíz y actualiza la caché del service worker.

Después de reemplazar los archivos en GitHub, abrí la app en una ventana de incógnito o borrá los datos del sitio para descartar la caché de la versión anterior.


## Versión 3 — biblioteca botánica ilustrada

Esta versión incorpora las correcciones funcionales de la v2 y agrega una fotografía individual a cada una de las 30 fichas de plantas. Las imágenes se encuentran en `assets/plants/` y se muestran en las tarjetas de la biblioteca y en la ficha ampliada de cada planta.

Para actualizar GitHub Pages, reemplazá todos los archivos anteriores por el contenido completo de esta carpeta. Después recargá sin caché o abrí la app en una ventana de incógnito, porque el service worker anterior puede conservar archivos viejos.
