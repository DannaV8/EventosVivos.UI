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

## Screenshoots

<img width="1732" height="1353" alt="image" src="https://github.com/user-attachments/assets/cffe633a-cce0-4d0d-aa8a-11ec9b422d77" />

<img width="1715" height="663" alt="image" src="https://github.com/user-attachments/assets/c03a2004-a4ab-49c6-91bb-36868ed44e42" />

<img width="1737" height="761" alt="image" src="https://github.com/user-attachments/assets/bd315296-f4f3-411f-8220-4e19df64d5d5" />

<img width="1539" height="809" alt="image" src="https://github.com/user-attachments/assets/be226104-fcc4-4e0a-b22a-0fe516632dc9" />

<img width="1634" height="951" alt="image" src="https://github.com/user-attachments/assets/2ecb8c16-5850-49a7-a9d5-d3888fcf713f" />



