# Portafolio — Miguel

Proyecto base: portafolio estático moderno con una función serverless en Node para Sigma Planner.

## Estructura

- `index.html` — plantilla principal
- `css/styles.css` — estilos globales
- `js/app.js` — lógica del portafolio
- `Sigma-planner-web/` — app de Sigma Planner
- `netlify/functions/materias.js` — API en Node para `/api/materias`
- `netlify.toml` — configuración de despliegue en Netlify

## Desarrollo local

1. Instala dependencias:

```powershell
npm install
```

2. Crea variables de entorno a partir de `.env.example`.

3. Inicia el entorno local con Netlify:

```powershell
npm run dev
```

Esto sirve el sitio estático y expone la API de Sigma Planner sin usar Python.

## Despliegue en Netlify

1. Conecta el repositorio en Netlify.
2. Usa estos ajustes:
	- Build command: `npm install`
	- Publish directory: `.`
3. Configura las variables de entorno:
	- `MONGO_URI`
	- `MONGO_DB`

La ruta `/api/materias` se redirige automáticamente a la función `netlify/functions/materias.js`.

## Rutas principales

- `index.html` — inicio
- `about.html` — quién soy
- `courses.html` — catálogo de cursos
- `projects.html` — catálogo de proyectos
- `contact.html` — formulario de contacto
- `Sigma-planner-web/sigma.html` — Sigma Planner

Personaliza los datos en `js/app.js` (arrays `courses` y `projects`).
