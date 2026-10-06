# IPHub — Backend real (Node.js + Express + base de datos en disco)

Esto **no es una demo**. El servidor Express ejecuta operaciones de red reales
contra el sistema operativo donde corra, y guarda todo en un archivo `db.json`
real que persiste entre reinicios.

## 1. Instalar

Necesitás [Node.js](https://nodejs.org) 18 o superior instalado.

```bash
cd iphub
npm install
cp .env.example .env
# Editá .env y poné un JWT_SECRET largo y aleatorio, y tu CIDR de LAN real
```

## 2. Correr

```bash
npm start
```

Abrí `http://localhost:3001` en el navegador. Registrate (se crea un usuario
real, con contraseña hasheada con bcrypt, guardado en `db.json`).

## 3. Qué es real y qué depende de tu sistema

| Función | Cómo funciona de verdad | Requisito |
|---|---|---|
| Login/registro | bcrypt + JWT, persistido en `db.json` | Ninguno |
| Auditoría | Cada acción se graba con timestamp real | Ninguno |
| Analizador de IP | Llama a la API pública `ip-api.com` desde el server | Salida a internet |
| Escaneo de puertos | `net.Socket.connect()` real contra el host que pongas | Que el host sea alcanzable desde donde corre el server |
| Traceroute | Ejecuta `traceroute` (Linux/Mac) o `tracert` (Windows) del sistema operativo | El binario debe estar instalado (en Linux: `apt install traceroute`) |
| DNS | Módulo `dns` nativo de Node, consulta resolvers reales | Ninguno |
| ARP / tabla MAC | Ejecuta `arp -a` del sistema operativo | Solo ve hosts con los que tu equipo ya tuvo tráfico |
| Descubrir red (ping sweep) | Pinguea cada IP real del rango /24 que indiques + cruza con ARP | El server debe estar en la misma LAN que querés mapear |
| Speedtest | Descarga/sube bytes reales entre tu navegador y este servidor y mide el tiempo real | Mide el enlace hasta **este** servidor, no "internet" en abstracto — si lo corrés en tu PC vía localhost vas a medir tu loopback; para medir tu enlace a internet real, desplegalo en un VPS |

## 4. Lo único que NO se puede hacer nunca desde acá (no es limitación mía, es física/protocolo)

- Un navegador **nunca** puede hacer ARP/ICMP crudo por sí solo — por eso todo
  esto vive en el backend Node, que sí tiene acceso a sockets del sistema operativo.
- "Aislar" un dispositivo de la red real requeriría tocar reglas de firewall
  (`iptables`/Windows Firewall) con privilegios root/admin. Por seguridad, esta
  versión solo lo **marca como sospechoso** en la base de datos — no ejecuta
  cambios de firewall automáticos. Si querés eso, decímelo y lo agregamos como
  un paso explícito y confirmado (nunca automático).

## 5. Email real (opcional)

El formulario de soporte guarda el ticket en la base de datos real, pero no
manda un email — no voy a inventar que "se envió" un correo que no salió.
Si querés que además dispare un email de verdad, agregá tus credenciales SMTP
reales y conectamos `nodemailer` en `/api/contact`.

## 6. Legal

Escanear puertos, hacer ping sweep o traceroute contra redes o equipos que no
son tuyos, sin autorización explícita, puede constituir un delito según la
legislación de tu país. Usá esta herramienta solo sobre infraestructura propia
o con permiso escrito.

## App para Windows (agente)
`agent/` es una app de escritorio nativa (Electron): ventana propia, sin localhost ni Node para el usuario final.
Compilar (en Windows, Node 18+): `cd agent && build.bat` → `IPHub-Agent.exe` portable, copiado a `public/download/`.

## Correo
Configurá SMTP_USER / SMTP_PASS en `.env` (ver `.env.example`, Gmail requiere "contraseña de aplicación"). Se usa para el código de verificación y para enviar los tickets a SUPPORT_TO.

## Login con Google y Discord
En la pantalla de inicio de sesión / registro hay botones **Google** y **Discord**. Si el correo ya existe, entra a esa cuenta; si no, crea una cuenta nueva ya verificada.
Configuración (en `.env`, ver `.env.example`):
- `GOOGLE_CLIENT_ID` y origen autorizado `http://localhost:3001`.
- `DISCORD_CLIENT_ID` y redirect `http://localhost:3001/auth/discord`.

## IP de red en el Dashboard
El Dashboard muestra la IP de red del equipo donde corre IPHub (más su subred y máscara). Endpoint: `GET /api/network/info`.
