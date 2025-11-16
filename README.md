🚀 udp-call — Librería UDP Potente para Comunicación en Tiempo Real (Node.js)
UDP con ACK, encriptación AES y broadcast — Ideal para juegos, chats en tiempo real, streaming y sistemas distribuidos de baja latencia. 

License: MIT

Node.js

GitHub Repo

✅ ¿Qué es udp-call?
udp-call es una librería de Node.js que implementa una capa UDP robusta con características profesionales:

✅ Confirmación de paquetes (ACK) — Garantiza entrega de mensajes críticos
✅ Reintentos automáticos — Hasta 3 intentos con backoff exponencial
✅ Encriptación AES-256-CBC — Opcional, con clave secreta
✅ Broadcast UDP — Envía a todos en la red local
✅ Eventos embebidos — data, error, ready
✅ Sin dependencias externas — Solo módulos nativos de Node.js
Perfecta para:

Chats en tiempo real sin servidor central
Juegos multijugador locales
Sistemas IoT de bajo consumo
Comunicación P2P entre clientes
📦 Instalación
bash


1
npm install udp-call
✅ No requiere compilación ni dependencias externas — Solo Node.js ≥12.0.0 

💡 Uso Básico
🖥️ Servidor (Reenvía mensajes a todos)

const UDPCall = require('udp-call');

const server = new UDPCall({ port: 3000 });
server.bind();

server.on('ready', () => {
  console.log('✅ Servidor listo en puerto 3000');
});

server.on('data', (message, rinfo) => {
  console.log(`📩 Recibido de ${rinfo.address}:${rinfo.port} → ${message}`);
  
  // Reenvía a todos (broadcast)
  server.broadcast(`🔁 Echo: ${message}`, 3000);
});
📱 Cliente (Envía y recibe mensajes)

const UDPCall = require('udp-call');
const readline = require('readline');

const client = new UDPCall({ port: 3001 });
client.bind();

client.on('ready', () => {
  console.log('✅ Cliente listo en puerto 3001');
});

client.on('data', (message, rinfo) => {
  console.log(`💬 Recibido de ${rinfo.address}:${rinfo.port}: ${message}`);
});

// Entrada de texto en tiempo real
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.trim()) {
    client.send(input, 3000, 'localhost'); // Enviar al servidor
  }
});
🔐 Encriptación (Opcional)
Usa una clave secreta para cifrar mensajes:

const client = new UDPCall({
  port: 3001,
  enableEncryption: true,
  secretKey: 'mi-clave-secreta-32-caracteres-minimo!' // ¡Mínimo 32 chars!
});

client.bind();
client.on('data', (message, rinfo) => {
  console.log(`🔒 Mensaje descifrado: ${message}`);
});
⚠️ La clave debe tener al menos 32 caracteres. Si es más corta, se rellena con padding (no es seguro). Usa crypto.randomBytes(32).toString('hex') para generar claves seguras. 

🌐 Broadcast (Enviar a toda la red)
js


1
client.broadcast('¡Hola a todos!', 3000);
Usa 255.255.255.255 como destino. Funciona en redes locales (LAN). 

🛠️ Métodos Disponibles
bind()
—
Inicia el socket y escucha en
port
send(data, port, host)
string
,
number
,
string
Envía un mensaje simple
sendWithAck(data, port, host, callback)
string
,
number
,
string
,
function
Envía con confirmación y manejo de errores
broadcast(data, port)
string
,
number
Envía a toda la red local
close()
—
Cierra el socket

📡 Eventos
ready
—
Socket listo para enviar/recibir
data
(message: string, rinfo: {address, port})
Mensaje recibido
error
(err: Error)
Error en el socket o al descifrar


const UDPCall = require('udp-call');

const chat = new UDPCall({
  port: 3000,
  enableEncryption: true,
  secretKey: 'mi-clave-secreta-32-caracteres-minimo!',
  maxRetries: 5,
  retryDelay: 200
});

chat.bind();

chat.on('data', (msg, rinfo) => {
  console.log(`[${rinfo.address}] ${msg}`);
});

chat.on('error', (err) => {
  console.error('❌ Error UDP:', err.message);
});

// Enviar con confirmación
chat.sendWithAck('¡Hola mundo!', 3000, 'localhost', (err, ack) => {
  if (err) {
    console.error('❌ No se pudo entregar el mensaje:', err.message);
  } else {
    console.log('✅ Mensaje confirmado:', ack);
  }
});
📁 Estructura del Proyecto

udp-call/
├── udp-call.js         ← Clase principal
├── index.js            ← Exportación principal
├── package.json        ← Metadatos
├── README.md           ← Este archivo

📌 Notas Importantes
❗ UDP no garantiza entrega — udp-call lo mejora con ACK, pero no es TCP.
🔐 Clave AES: Usa siempre una clave de 32+ caracteres. No uses contraseñas simples.
🌐 Broadcast: Solo funciona en redes locales (no por Internet).
🚫 No soporta IPv6 (por ahora). Usa udp4 exclusivamente.
🧪 No requiere servidor central — Puedes usarlo en modo P2P entre clientes directamente.
🤝 Contribuciones
¡Bienvenidas! Si quieres mejorar la librería:

Haz un fork del repositorio
Crea una rama (feature/nueva-funcionalidad)
Envía un Pull Request
Autores:

@MC_luis_Gamer_YT
Salva-Gamer
📄 Licencia
MIT © 2025 Salva-Gamer & MC_luis_Gamer_YT

💡 ¿Te gusta esta librería? Dale una ⭐ en GitHub.
¡Ayuda a otros desarrolladores a encontrarla! 

