# Portafolio — Miguel

Proyecto base: portafolio estático moderno y dinámico usando HTML/CSS/JS.

Estructura:
- `index.html` — plantilla principal
- `css/styles.css` — estilos
- `js/app.js` — lógica para cursos, proyectos y contacto

Cómo ver localmente:
1. Abrir `index.html` en el navegador directamente (limitado por CORS en algunos recursos).
2. O iniciar un servidor local (recomendado):

```powershell
# Desde la carpeta d:\Miguel\Portafolio
python -m http.server 8000
# luego abrir http://localhost:8000
```

Rutas principales ahora disponibles (páginas separadas):

- `index.html` — inicio
- `about.html` — quién soy
- `courses.html` — catálogo de cursos
- `projects.html` — catálogo de proyectos
- `contact.html` — formulario de contacto

Personaliza los datos en `js/app.js` (arrays `courses` y `projects`).

Personaliza los datos en `js/app.js` (arrays `courses` y `projects`).
