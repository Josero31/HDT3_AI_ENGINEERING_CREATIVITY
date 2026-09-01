# HDT3_AI_ENGINEERING_CREATIVITY

Sistemas RAG

## Agente de FAQs - Parachute S.A.

Demo en terminal de un agente de preguntas frecuentes basado en una arquitectura RAG simple:
se carga un archivo de texto plano con las FAQs de un evento y se inyecta como contexto
(system prompt) a un modelo de lenguaje. El agente solo responde con base en ese documento.

- **SDK**: [`openai`](https://www.npmjs.com/package/openai) (Node.js), compatible con el
  esquema de API de OpenAI.
- **Proveedor de modelo**: [Nvidia Build](https://build.nvidia.com) (tier gratuito, sin
  tarjeta de crédito), usando el endpoint `https://integrate.api.nvidia.com/v1`.
- **Fuente de conocimiento**: `data/FAQs_Parachute_SA_Guatemala_2026.txt`.

### Requisitos

- Node.js 18 o superior.
- Una API key gratuita de [Nvidia Build](https://build.nvidia.com) (crea una cuenta y ve a
  "Get API Key" en el modelo de tu preferencia).

### Instalación

Este proyecto usa [pnpm](https://pnpm.io) como gestor de paquetes (no npm). Si no lo tienes
instalado, puedes ejecutarlo vía Corepack (incluido en Node.js 16.13+):

```bash
corepack enable
pnpm install
cp .env.example .env
# Edita .env y coloca tu NVIDIA_API_KEY
```

### Uso

```bash
pnpm start
```

Escribe tus preguntas sobre el evento de paracaidismo de Parachute S.A. El agente responderá
únicamente con base en el archivo de FAQs. Para salir de la sesión, escribe `Bye` o presiona
`Ctrl-C`.

### Notas de seguridad

El archivo `.env` con la API key está excluido del repositorio vía `.gitignore`. Nunca subas
tu API key real; usa `.env.example` como plantilla.
