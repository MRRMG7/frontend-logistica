# Frontend — Sistema de Logística y Envíos

Frontend del sistema de logística y envíos, construido con **React 19 + TypeScript + Vite + Tailwind CSS 4** y **MapLibre GL** para los mapas.

Este repositorio contiene **solo el frontend**. El backend (FastAPI + MySQL) es un proyecto aparte y no está incluido.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior
- Un backend FastAPI corriendo (por defecto en `http://localhost:8000`)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Build de producción

```bash
npm run build     # compila a dist/
npm run preview   # sirve dist/ localmente para probar
```

## Configurar la URL del backend

La URL de la API está definida en `src/api.ts`:

```ts
export const API_URL = "http://localhost:8000";
```

**Cambiala por la URL de tu backend** antes de correr el proyecto. Si el backend corre en otro host, el servidor de Vite hace las peticiones desde el navegador, por lo que esa URL debe ser accesible desde la máquina donde se abre la app.

## Estructura

```
src/
├── api.ts               # Cliente HTTP y helpers de la API
├── auth.tsx             # Contexto de autenticación (JWT)
├── geo.ts               # Helpers de geolocalización
├── mapa.ts              # Configuración de MapLibre
├── types.ts             # Tipos TypeScript del dominio
├── App.tsx              # Rutas y layout
├── main.tsx             # Punto de entrada
├── index.css            # Tailwind y estilos globales
├── components/
│   └── EstadoPill.tsx   # Badge de estado de pedido
└── pages/
    ├── Login.tsx
    ├── Inicio.tsx
    ├── ConductorPanel.tsx
    └── admin/
        ├── AdminDashboard.tsx
        ├── ClientesTab.tsx
        ├── ConductoresTab.tsx
        ├── FormPedido.tsx
        ├── MapaTab.tsx
        ├── PaquetesTab.tsx
        ├── PedidosTab.tsx
        └── VehiculosTab.tsx
```

## Docker

```bash
docker build -t frontend-logistica .
docker run -p 3000:3000 frontend-logistica
```

El `Dockerfile` compila la app con `npm ci && npm run build` y sirve el entorno de desarrollo de Vite en el puerto `3000`.

## Roles

La interfaz cambia según el rol del usuario autenticado:

- **ADMIN** — panel completo con tabs de clientes, conductores, vehículos, pedidos, paquetes y mapa.
- **CONDUCTOR** — panel de pedidos asignados y actualización de estado.
- **CLIENTE** — seguimiento de sus pedidos.

## Stack

- React 19, React DOM 19
- TypeScript 7
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- MapLibre GL 5