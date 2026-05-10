# MarketMind

Aplicación web en Next.js + Tailwind CSS para analizar ideas de negocio o sectores de inversión con IA (Anthropic).

## Funcionalidades

- Home con diseño oscuro, limpio y responsive.
- Dos modos de análisis:
  - `Idea de negocio`
  - `Inversión`
- Textarea con ejemplos clicables que rellenan automáticamente la consulta.
- Botón `Analizar` que llama al endpoint `/api/analyze`.
- Loader mientras se procesa la respuesta.
- Resultado renderizado en una card con texto formateado.

## Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Anthropic SDK (`@anthropic-ai/sdk`)

## Configuración

1. Clona o descarga este proyecto.
2. Crea un archivo `.env.local` en la raíz con este contenido:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

También tienes un ejemplo en `.env.local.example`.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000).

## API

### `POST /api/analyze`

Body JSON:

```json
{
  "query": "Tu pregunta o idea",
  "mode": "business"
}
```

- `mode` puede ser:
  - `business` (prompt de negocio)
  - `investment` (prompt de inversión)

La API usa el modelo:

- `claude-sonnet-4-20250514`
