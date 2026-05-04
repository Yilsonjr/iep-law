# Ebenezer M.I.

Plataforma web para la Iglesia Ebenezer M.I. con transmisión en vivo, galería de sermones, calendario de eventos, comunidad y administración de miembros.

## Primeros pasos

```bash
git clone https://github.com/tu-usuario/IEP-Law.git
cd IEP-Law
npm install
cp .env.example .env   # editar con datos de Supabase
npm run dev
```

Variables de entorno necesarias:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:5173` |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar el build de producción |
| `npm run lint` | Ejecutar ESLint |

## Rutas

| Ruta | Página | Requiere autenticación |
|---|---|---|
| `/` | Inicio | No |
| `/sermons` | Galería de Sermones | No |
| `/live` | Transmisión en Vivo | No |
| `/events` | Calendario de Eventos | No |
| `/posts` | Comunidad | No (publicar requiere cuenta) |
| `/login` | Inicio de Sesión | No |
| `/dashboard` | Panel de Gestión | Sí (pastor/líder/admin) |

## Tablas en Supabase

La aplicación se conecta a Supabase en tiempo real. Las tablas esperadas con RLS habilitado:

### `profiles`

Se crea automáticamente cuando un usuario se registra (trigger sobre `auth.users`).

| Columna | Tipo | Detalle |
|---|---|---|
| `id` | uuid (PK, FK → auth.users) | |
| `email` | text | |
| `display_name` | text | |
| `role` | text | `admin`, `pastor`, `leader`, `member`. Default: `member` |
| `status` | text | `active`, `inactive`. Default: `active` |
| `phone` | text | Nullable |
| `address` | text | Nullable |
| `join_date` | date | |
| `created_at` | timestamptz | |

### `sermons`

| Columna | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title` | text |
| `speaker` | text |
| `date` | date |
| `description` | text |
| `video_url` | text |
| `duration` | text |
| `category` | text |
| `thumbnail` | text |
| `notes` | text |
| `author_id` | uuid (FK → profiles) |
| `author_name` | text |
| `published` | boolean |
| `created_at` | timestamptz |

### `events`

| Columna | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title` | text |
| `date` | date |
| `time` | text |
| `location` | text |
| `description` | text |
| `type` | text |
| `author_id` | uuid (FK → profiles) |
| `created_at` | timestamptz |

### `posts`

| Columna | Tipo |
|---|---|
| `id` | uuid (PK) |
| `title` | text |
| `content` | text |
| `category` | text |
| `author_id` | uuid (FK → profiles) |
| `author_name` | text |
| `published` | boolean |
| `image_url` | text |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### `live_stream`

Tabla de configuración con una sola fila (`id = 1`).

| Columna | Tipo |
|---|---|
| `id` | int (PK) |
| `is_live` | boolean |
| `stream_url` | text |
| `title` | text |
| `speaker` | text |
| `description` | text |
| `viewer_count` | int |
| `start_time` | timestamptz |
| `updated_by` | uuid |
| `updated_at` | timestamptz |

## Roles y permisos

| | Crear contenido | Editar lo de otros | Gestionar miembros | Transmitir | Dashboard |
|---|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Pastor** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Líder** | ✓ | — | — | — | ✓ |
| **Miembro** | — | — | — | — | — |

Los miembros pueden publicar en Comunidad, pero sus posts quedan pendientes hasta que un pastor o líder los apruebe.

## Despliegue

El proyecto incluye `vercel.json` con la regla SPA rewrite para React Router. Para desplegar en Vercel:

1. Conectar el repositorio
2. Agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las variables de entorno del proyecto

## Estructura

```
src/
├── config/supabase.ts      # Cliente de Supabase
├── contexts/AuthContext.tsx # Autenticación y permisos
├── hooks/                  # Consultas realtime a Supabase
│   ├── useSermons.ts
│   ├── useEvents.ts
│   ├── usePosts.ts
│   ├── useUsers.ts
│   └── useLiveStream.ts
├── components/
│   ├── Navbar.tsx          # Navegación con auth dropdown
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx # Guardia de rutas
├── layouts/MainLayout.tsx   # Navbar + Outlet + Footer
├── pages/                  # Cada ruta de la aplicación
├── types/index.ts          # Modelos de TypeScript
└── utils/index.ts          # Utilidades (cn)
```

## Stack

- React 19 · TypeScript · Vite 8
- Tailwind CSS 4 (paleta Ebenezer: `#8D000A` rojo profundo, `#D4AF37` oro)
- React Router v7
- Supabase (Auth + Postgres + Realtime)
- Framer Motion
- Lucide (iconos)