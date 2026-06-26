# EventosVivos — UI

Frontend del sistema de reservas de eventos culturales **EventosVivos**.
Consume la API REST (proyecto aparte) y ofrece la experiencia para usuarios y administradores.

**Stack:** Angular 22 (standalone + signals) · Tailwind CSS · Vitest

## Qué hace

- **Público:** ver eventos, registro / login (JWT).
- **Usuario:** reservar entradas, ver y cancelar sus reservas.
- **Admin** (`/admin`): confirmar reservas, crear eventos y ver reportes de ocupación.
  Todas las tablas tienen búsqueda, filtros, paginación y orden por columna.

## Requisitos

- Node 20+ y npm
- La **API corriendo** en `https://localhost:62323` (ver el repo de la API).
  La URL se configura en `src/environments/environment.ts` (`apiBase`).

## Cómo levantar el proyecto

```bash
npm install      # instalar dependencias (solo la primera vez)
npm start        # servidor de desarrollo -> http://localhost:4200
```

La app recarga sola al guardar cambios.

## Otros comandos

```bash
npm test         # tests unitarios (Vitest)
npm run build    # build de producción -> dist/
```

## Estructura

```
src/app/
├── core/        # servicios, guards, modelos, helpers (auth, http, sort)
├── shared/      # componentes reutilizables (badge, spinner, toast, paginator)
└── features/    # páginas por dominio
    ├── auth/         # login / register
    ├── events/       # listado de eventos
    ├── reservations/ # reservar + mis reservas
    └── admin/        # panel admin con tabs
```

Rutas protegidas por `authGuard` (usuario logueado) y `adminGuard` (rol admin).
