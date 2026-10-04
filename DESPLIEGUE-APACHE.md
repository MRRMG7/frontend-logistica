# Despliegue del Frontend en Apache

Cómo montar este frontend en un servidor Apache nuevo y conectarlo al backend que ya está corriendo
en AWS (`http://3.23.84.160:8000`).

**Resumen:** el frontend son archivos estáticos. Se compila en cualquier máquina, se sube la carpeta
`dist/` al servidor Apache, y listo. Apache solo sirve archivos.

---

## 0. Estado actual

| Parte | Dónde está | Estado |
|---|---|---|
| Backend (FastAPI) | `http://3.23.84.160:8000` | ✅ ya montado en AWS EC2 |
| Base de datos (MySQL) | `3.23.84.160:3307` | ✅ ya montado en AWS EC2 |
| Frontend (este repo) | Servidor Apache | ⬜ falta montar |

El backend expone el puerto **8000**. En el grupo de seguridad de esa instancia, ese puerto tiene que
permitir entrada **desde el servidor Apache** (o desde `0.0.0.0/0`).

---

## 1. Compilar el frontend

Esto se hace **en tu máquina**, no en el servidor.

```powershell
cd C:\Users\mauri\Desktop\frontend-logistica
npm install
copy .env.example .env
```

Editá `.env` y poné la dirección del backend:

```ini
VITE_API_URL=http://3.23.84.160:8000
```

> ⚠️ **Cuidado con el BOM.** Si guardás el `.env` desde PowerShell 5.1 con `Out-File -Encoding utf8`, se
> agrega un BOM invisible al principio del archivo y Vite **no lee la variable** — la app queda
> apuntando a `localhost` y no muestra nada. Verificá que el bundle quedó bien:

```powershell
npm run build
Select-String -Path "dist\assets\*.js" -Pattern "3\.23\.84\.160:8000"
```

Si aparece la línea, compilaste bien. Si no aparece, es el BOM.

Resultado:

```
dist/
├── index.html
└── assets/
    ├── index-XXXX.css
    └── index-XXXX.js
```

---

## 2. Crear la instancia Apache en AWS

### 2.1 Lanzar la instancia

1. Consola de AWS → *EC2* → **Launch instance**.
2. **Name**: `frontend-logistica`.
3. **AMI**: Ubuntu Server 24.04 LTS.
4. **Instance type**: `t3.micro` (o `t3.small`).
5. **Key pair**: creá un `.pem` nuevo o usá uno existente. **Guardalo, sin esa llave no entrás nunca.**
6. **Network settings**:
   - *Security group*: creá uno nuevo.
   - **Inbound rules** — agregá:

     | Tipo | Puerto | Origen | Para qué |
     |---|---|---|---|
     | SSH | 22 | Tu IP | Conectarte por consola |
     | HTTP | 80 | `0.0.0.0/0` | Que la gente vea la página |
     | HTTPS | 443 | `0.0.0.0/0` | Si después activás el certificado |

7. Lanzá la instancia.

### 2.2 Anotar la IP

Copiá la **Public IPv4** de la instancia. Es la dirección donde va a quedar la página.

### 2.3 Conectarte

```powershell
ssh -i "C:\ruta\a\tu\key.pem" ubuntu@TU_IP_PUBLICA
```

La primera vez te va a pedir confirmar. Escribí `yes` y presioná Enter.

---

## 3. Instalar Apache en el servidor

Ya adentro del servidor:

```bash
sudo apt update
sudo apt install -y apache2
sudo systemctl enable --now apache2
sudo systemctl status apache2
```

Deberías poder entrar a `http://TU_IP_PUBLICA` y ver la página de prueba de Apache.

---

## 4. Copiar `dist/` al servidor

### 4.1 Desde tu máquina (Windows PowerShell)

```powershell
cd C:\Users\mauri\Desktop\frontend-logistica
scp -i "C:\ruta\a\tu\key.pem" -r dist ubuntu@TU_IP_PUBLICA:/tmp/
```

### 4.2 Moverse a la carpeta correcta (en el servidor)

```bash
sudo rm -rf /var/www/html/*
sudo cp -r /tmp/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
ls -la /var/www/html
```

---

## 5. ⚠️ Ajustar el backend (CORS) — el paso que más se olvida

El navegador **no** va a dejar que la página que está en `http://TU_IP_APACHE` le pida datos a
`http://3.23.84.160:8000` si el backend no lo autoriza. Sin esto, la pantalla queda en blanco y la
consola del navegador muestra un error de CORS.

Hay que editar el backend en la **instancia de AWS del backend** (`3.23.84.160`):

```bash
ssh -i "key-backend.pem" ubuntu@3.23.84.160
cd logistica
nano backend/main.py
```

Y en el middleware de CORS, reemplazar `allow_origins` por la IP real del Apache:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://TU_IP_APACHE",   # ← la IP del frontend (el que acabás de crear)
        "http://localhost",
        "http://localhost:3000", # ← por si alguien prueba con npm run dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Guardar y reiniciar:

```bash
docker compose up -d --build backend
docker compose logs -f backend
```

### Cómo saber si quedó bien

En tu máquina:

```bash
curl -I http://3.23.84.160:8000/
```

Y en el navegador, con la página abierta: **F12 → Console**. Si no hay errores rojos de CORS, está
funcionando.

---

## 6. (Opcional) HTTPS con Let's Encrypt

Si querés que la página funcione en `https://` (recomendable, hoy los navegadores marcan
`http://` como "no seguro"):

1. Apuntá un dominio a la IP del Apache (registro DNS tipo A).
2. En el servidor:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d tu-dominio.com
```

El certificado se renueva solo. **Siempre usá `https://` en `VITE_API_URL` después de esto.**

---

## 7. Publicar el código (opcional, si el Apache tiene Node)

Si querés que el Apache compile desde Git en vez de subir `dist/` a mano:

```bash
sudo apt install -y git nodejs npm
cd /var/www
sudo git clone https://github.com/MRRMG7/frontend-logistica.git
cd frontend-logistica
echo "VITE_API_URL=http://3.23.84.160:8000" > .env
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

Para actualizar después:

```bash
cd /var/www/frontend-logistica
git pull
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## Nota sobre el `Dockerfile`

El `Dockerfile` de este repo **compila la app pero sirve el servidor de desarrollo de Vite**
(`npm run dev`), no la versión compilada. Para Apache **no lo uses**: el flujo correcto es
`npm run build` + copiar `dist/`.

Si en el futuro querés usar Docker para el frontend en vez de Apache, hay que cambiar el `CMD` del
`Dockerfile` a algo como `CMD ["npx", "serve", "-s", "dist"]` o usar nginx.

---

## Resumen de comandos

```powershell
# En tu máquina
cd C:\Users\mauri\Desktop\frontend-logistica
npm install
# editá .env con VITE_API_URL
npm run build
scp -i "key.pem" -r dist ubuntu@TU_IP:/tmp/
```

```bash
# En el servidor Apache
sudo apt update && sudo apt install -y apache2
sudo systemctl enable --now apache2
sudo rm -rf /var/www/html/*
sudo cp -r /tmp/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

```powershell
# Verificar
Start-Process "http://TU_IP"
```

---

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Pantalla en blanco, consola roja con "CORS policy" | El backend no permite el origen del Apache | Editar `allow_origins` en el backend (paso 5) y reiniciar |
| Pantalla en blanco, error "Failed to fetch" | El backend no responde o el puerto 8000 está cerrado en su grupo de seguridad | `curl -I http://3.23.84.160:8000/` y revisar el security group |
| La app carga pero no entra ningún dato | El `.env` quedó con BOM y no se aplicó la URL | Recrear el `.env` sin BOM y recompilar |
| "404 Not Found" de Apache al recargar | No aplica — el frontend no usa URLs por pantalla | Nada. Solo si se agrega un `.htaccess` de rewrite |
| `permission denied` al copiar a `/var/www/html` | Faltan permisos | `sudo cp ...` y `sudo chown -R www-data:www-data /var/www/html` |
| Cambiaste la URL del backend y no se ve | Las variables se leen al compilar | Volver a correr `npm run build` y volver a copiar `dist/` |
| La página pide login pero no guarda la sesión | Estás en `http` y probás en otro dispositivo | La sesión se guarda por navegador; probá en el mismo |