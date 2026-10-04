# Manual de Uso — Transporte & Entregas

Este sistema sirve para **mandar paquetes** y saber **en qué estado está cada entrega**.

Lo usan tres personas distintas: el **administrador**, el **conductor** y el **cliente**.
Cualquiera puede entrar a la página sin cuenta y rastrear un paquete usando su número de seguimiento.

---

## 1. Entrar al sistema

Al abrir la página vas a ver una pantalla de presentación con un buscador.

Arriba a la derecha hay un botón **"Acceso · Iniciar sesión"**. Ese botón es para el personal
(administradores y conductores). Si solo querés consultar un paquete, no hace falta que tengas cuenta.

### Iniciar sesión

1. Hacé clic en **"Acceso · Iniciar sesión"**.
2. Escribí tu **usuario**.
3. Escribí tu **contraseña**.
4. Hacé clic en **"Entrar"**.

Si los datos están bien, entrás directo a tu panel.
Si están mal, te aparece un mensaje rojo abajo del formulario.

En la parte superior derecha de tu panel siempre vas a ver tu nombre y un botón **"Salir"** para cerrar
la sesión.

### Cuentas de ejemplo

| Usuario | Contraseña | Qué ve al entrar |
|---|---|---|
| `admin` | `123` | Panel de administración |
| `conductor1` | `123` | Sus entregas |

---

## 2. Rastrear un paquete (sin cuenta)

Cualquiera puede consultar el estado de un paquete, sin iniciar sesión.

1. En la pantalla principal escribí el **número de seguimiento** en el buscador.
   - Se puede escribir solo el número, por ejemplo `1`.
   - También podés escribir `#1`. El `#` es opcional.
2. Hacé clic en **"Ver estado"**.

Si el número existe, vas a ver:

- **Una barra de color** con el estado del paquete. El color depende del estado.
- **Una línea de tiempo** con 4 pasos:
  1. Pedido creado
  2. Repartidor asignado
  3. En camino
  4. Entregado

  Los pasos que ya se cumplieron aparecen marcados.
- **Los datos del envío:**
  - Dirección de entrega
  - Nombre del cliente
  - Nombre del repartidor
  - Vehículo que lleva el paquete
- **Un mapa** con un punto rojo marcando dónde va la entrega.

### Si no aparece nada

| Mensaje | Qué significa |
|---|---|
| `Ingresá un número de seguimiento válido` | Escribiste letras, o no escribiste nada. Solo van números. |
| `No encontramos ningún pedido con el número N` | Ese número no existe. Revisá el número. |
| `No se pudo consultar el estado` | El sistema no pudo conectarse. Esperá unos segundos e intentá de nuevo. |

---

## 3. El panel del administrador

Es el panel principal. Tiene un **menú lateral izquierdo** con 5 secciones, y abajo tu nombre y el
botón para salir.

Todos los datos se actualizan solos cada 3 segundos. Si alguien cambia algo en otro dispositivo, lo
ves sin recargar la página.

### 3.1 Resumen

Es la primera sección y muestra lo más importante de un vistazo.

**Los contadores de arriba**, cada uno con su puntito de color:

- Pendientes
- Asignados
- En camino
- Entregados
- Incidencias
- Cancelados
- Sin asignar

**Debajo**, una tabla llamada **"Reparto por conductor"** con una fila por conductor:

| Columna | Qué muestra |
|---|---|
| Conductor | Su nombre |
| En ruta | Cuántos paquetes tiene en camino ahora |
| Entregados | Cuántos entregó |
| Incidencias | Cuántos tuvo con problema |
| Licencia | Su número de licencia |

### 3.2 Paquetes

Esta sección tiene **dos cosas**: el mapa arriba y la tabla de paquetes abajo.

#### El mapa

Al entrar, el mapa se posiciona solo para mostrarte los paquetes que están activos.

- Cada paquete es un **puntito de color** según su estado. Los paquetes cancelados no aparecen.
- Si hacés clic en un puntito, te aparece un cuadrito con el número de pedido, el nombre del cliente,
  el estado y la dirección.

**Para marcar una ubicación:**

1. Escribí la dirección en el buscador de arriba y hacé clic en **"Buscar Ubicación"**.
   El mapa se mueve a esa dirección.
2. Si el punto no cae donde querés, **arrastrá el puntito rojo** o **hacé clic en el mapa**.
   Al soltarlo, la dirección se escribe sola en el cuadrito de abajo.
3. Cuando la ubicación esté correcta, hacé clic en **"+ Registrar pedido"**.
   Se abre el formulario con la ubicación ya puesta.

#### La tabla de paquetes

Los paquetes se muestran **del más nuevo al más viejo**.

Cada fila tiene:

| Columna | Qué muestra |
|---|---|
| Nº seguimiento | El número del paquete, por ejemplo `#12` |
| Cliente | Quién lo recibe |
| Dirección | A dónde va |
| Estado | El color del estado |
| Asignado a | **Un desplegable** para elegir el conductor |

**Botones de cada fila:**

- **Asignado a** — elegís un conductor del desplegable:
  - Si elegís uno → el paquete pasa a **Asignado**.
  - Si lo volvés a "— sin asignar —" → el paquete pasa a **Pendiente**.

- **✎ Editar** — abre el formulario para cambiar los datos del paquete (cliente, dirección,
  ubicación, vehículo).

- **Reasignar** — solo aparece si el paquete está **Entregado** o **Incidencia**. Te pide el número del
  conductor nuevo. El número es la posición en la lista que te muestra (por ejemplo, `2` para el
  segundo).

- **Retirar** — deja el paquete sin conductor (vuelve a **Pendiente**).

> Cuando asignás un conductor, el paquete **solo** pasa a "Asignado". Nunca pasa a "En camino" automáticamente.

### 3.3 Conductores

Dos bloques: arriba el formulario, abajo la tabla.

**Para crear un conductor**, llená los 4 campos y hacé clic en **"Guardar"**:

- Nombre completo
- Correo *(opcional)*
- Licencia
- Teléfono

Al guardar, el sistema te avisa el **usuario y la contraseña** que se creó para esa persona. Anotá esos
datos, porque son los que usa para entrar a su panel.

**Para editar o eliminar**: en la tabla de abajo, cada fila tiene **✎ Editar** y **Eliminar**.
Cuando editás, el formulario de arriba se llena con esos datos y tenés un botón extra **"Limpiar"** para
volver a un formulario nuevo.

Si eliminás un conductor que tiene paquetes asignados, el sistema te avisa con un cuadro de
confirmación.

### 3.4 Vehículos

Igual que los conductores: formulario arriba (Placa, Tipo, Capacidad) y tabla abajo con **✎ Editar** y
**Eliminar**.

Ejemplos de tipo: `Camión`, `Pickup`, `Moto`. Ejemplos de capacidad: `500 kg`.

### 3.5 Clientes

Igual que los anteriores: formulario arriba (Nombre, Teléfono, Correo, Dirección) y tabla abajo.

Cada fila tiene una columna **"Envíos"** con un número: es la cantidad de paquetes que recibió esa
persona.

- **Correo** es el único campo opcional. Si lo dejás vacío, el sistema guarda algo automático para que
  el cliente quede con un dato válido.

---

## 4. El panel del conductor

Este panel es **solo para el conductor**. Cada conductor ve **únicamente los paquetes que se le
asignaron**, no los de los demás.

Arriba está tu nombre y el botón **"Salir"**.

### Los contadores

Cuatro números con su punto de color:

- **Por entregar** — paquetes asignados que todavía no started
- **En camino** — los que está llevando ahora
- **Entregados** — los que ya entregó
- **Incidencias** — los que tuvo con problema

### El mapa

Un mapa con los puntos de entrega del conductor. El mapa se ajusta solo para mostrarte todos tus
paquetes.

Cada puntito tiene el color de su estado. Si hacés clic, te muestra el número de pedido, el cliente, el
estado y la dirección.

### La lista de entregas

Abajo hay una tarjeta por cada paquete asignado:

- **Número de paquete** (por ejemplo `#12`)
- **Una etiqueta de color** con el estado
- **Nombre del cliente**
- **Dirección**
- **Botones** que dependen del estado en que esté el paquete:

| Si el paquete está… | Vas a ver | Qué hace |
|---|---|---|
| **Asignado** | 🟢 **Comenzar entrega** | Lo pasa a *En camino* |
| **En camino** | 🟢 **Marcar entregado** | Lo pasa a *Entregado* |
| | 🔴 **Incidencia** | Lo pasa a *Incidencia* |
| **Incidencia** | 🟡 **Reanudar entrega** | Vuelve a *En camino* |
| **Entregado** | *(texto)* "Entrega completada" | Ya no hay nada que hacer |

Todos los botones te piden **confirmación** antes de aplicar el cambio. Si te arrepentís, hacé clic en
**Cancelar**.

### Si no te aparece nada

Si la lista dice *"No tenés entregas asignadas por el momento"*, es que el administrador todavía no te
asignó ningún paquete. Revisá con el administrador.

---

## 5. Los estados y sus colores

Cada estado tiene un color propio. Es el mismo color en las listas, en los contadores y en los mapas.

| Estado | Color | Qué significa | Quién lo cambia |
|---|---|---|---|
| **Pendiente** | Gris | El paquete existe pero no tiene conductor | Automático |
| **Asignado** | Gris oscuro | Ya tiene conductor | El administrador |
| **En camino** | Naranja | El conductor lo está llevando | El conductor |
| **Entregado** | Verde / turquesa | Llegó a destino | El conductor |
| **Incidencia** | Naranja fuerte | Hubo un problema en el camino | El conductor |
| **Cancelado** | Rojo | El paquete se canceló | Nadie desde el sistema |

### Cómo avanza un paquete normalmente

```
Pendiente  →  Asignado  →  En camino  →  Entregado
                ↑                         
                └─── Reanudar ── Incidencia
```

1. El administrador crea el paquete → queda **Pendiente**.
2. El administrador le elige un conductor → queda **Asignado**.
3. El conductor aprieta "Comenzar entrega" → queda **En camino**.
4. El conductor aprieta "Marcar entregado" → queda **Entregado**.

Si algo sale mal, el conductor aprieta "Incidencia" y después puede "Reanudar entrega" para seguir.

---

## 6. Lo que el sistema tiene y lo que no tiene

### Sí tiene

- Inicio de sesión con usuario y contraseña, y **te acuerdas de la sesión** aunque cierres y reabras el
  navegador.
- Tres paneles distintos según quién entre.
- Rastreo de paquetes **sin necesidad de cuenta**.
- Línea de tiempo que muestra el avance de cada entrega.
- Mapas de El Salvador con los puntos de entrega.
- Buscador de direcciones: escribís la dirección y el mapa se para ahí.
- Podés **arrastrar el puntito** del mapa para ajustar la ubicación exacta.
- Crear, modificar y eliminar clientes, conductores, vehículos y paquetes.
- Asignar, cambiar y quitar conductores de un paquete.
- Contadores automáticos de todos los estados.
- Botón de salir de la sesión en todos los paneles.
- Todo en español, con formatos de El Salvador.

### No tiene

- **El panel del cliente no está hecho.** Si alguien entra con una cuenta de cliente, ve un mensaje
  que dice *"Panel en construcción"* y un botón para salir. Los clientes hoy usan el **rastreo por
  número** en la pantalla principal.
- **No se pueden cancelar paquetes.** El estado "Cancelado" no se puede activar desde la pantalla. Si
  querés que un paquete deje de estar activo, quitale el conductor y queda en "Pendiente".
- **No se pueden cambiar contraseñas.** La contraseña se define cuando se crea el conductor.
- **No hay reportes, ni descargas de Excel, ni impresión.**
- **No hay historial.** Solo se ve el estado actual de un paquete, no los cambios anteriores ni quién
  los hizo.
- **No hay avisos automáticos.** Ni correos, ni SMS. El cliente no se entera solo de los cambios: tiene
  que entrar a rastrear su paquete.
- **No hay buscador en las tablas.** Para encontrar algo hay que revisar la lista a ojo.
- **No hay "página no encontrada".** Si una dirección de la página no existe, no vas a ver un mensaje
  claro.

---

## 7. Problemas frecuentes

| Qué pasa | Qué hacer |
|---|---|
| La página está en blanco | El sistema al que se conecta no está funcionando. Esperá unos minutos y recargá. |
| Dice "No se pudo conectar con el servidor" | El servidor está apagado o la dirección guardada no es la correcta. Avisale a quien administra el sistema. |
| El mapa sale en blanco o gris | Falta conexión a internet. Los mapas se descargan de internet. |
| "No encontramos ningún pedido con el número N" | Ese número no existe. Revisá el número que te pasaron. |
| Entré con mi usuario y no veo nada | Tu cuenta puede ser de cliente, y ese panel todavía no está hecho. Usá el rastreo por número. |
| Soy conductor y no veo mis paquetes | El administrador todavía no te asignó ninguno, o tu cuenta no está enlazada a un conductor. |
| Los datos no se actualizan | Si dejaste la pestaña abierta mucho tiempo, recargá la página con F5. |

---

## 8. Resumen en una página

| Soy… | Entro con… | Veo… | Puedo… |
|---|---|---|---|
| **Visitante** | Nada, sin cuenta | La pantalla de inicio | Rastrear un paquete por número |
| **Administrador** | admin / 123 | Panel con 5 secciones | Crear y editar clientes, conductores, vehículos y paquetes. Asignar conductores. Ver mapas y estadísticas. |
| **Conductor** | conductor1 / 123 | Solo mis entregas | Ver mis paquetes en el mapa. Marcar "en camino", "entregado" o "incidencia". |
| **Cliente** | cliente1 / 123 | "Panel en construcción" | Nada todavía. Que use el rastreo por número. |