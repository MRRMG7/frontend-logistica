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

La dirección de la API se toma de la variable de entorno **`VITE_API_URL`**. Si no está definida, el
frontend usa `http://localhost:8000` por defecto.

Copiá el archivo de ejemplo y editá el valor:

```bash
cp .env.example .env      # Linux / Mac
copy .env.example .env    # Windows
```

```ini
# .env
VITE_API_URL=http://3.23.84.160:8000
```

> **Ojo — esto se lee al compilar, no en caliente.** Si cambiás el valor, hay que volver a correr
> `npm run build` para que el cambio se vea.
>
> Cuidado con el BOM: si creás el `.env` desde PowerShell, guardalo **sin BOM** o Vite no va a leer la
> variable y se va a quedar apuntando a `localhost`.

`.env` está en `.gitignore`, así que **nunca se sube al repositorio**. Para cambiar de servidor solo
se edita el archivo local.

Si el backend corre en otra máquina, esa URL tiene que ser accesible desde el navegador del usuario
y el backend tiene que permitir el origen del frontend en su configuración de CORS.

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
- **CLIENTE** — consulta y seguimiento de sus pedidos, además de edición de sus datos de contacto.

## Stack

- React 19, React DOM 19
- TypeScript 7
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- MapLibre GL 5
