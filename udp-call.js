// udp-call.js
const dgram = require('dgram');
const EventEmitter = require('events');
const crypto = require('crypto');

class UDPCall extends EventEmitter {
  constructor(options = {}) {
    super();
    this.socket = dgram.createSocket('udp4');
    
    // Configuración
    this.port = options.port || 3000;
    this.host = options.host || '0.0.0.0';
    this.bufferSize = options.bufferSize || 65507; // Máximo para UDP
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 100;
    this.enableEncryption = options.encryption || false;
    this.secretKey = options.secretKey;
    
    // Estado interno
    this.connections = new Map();
    this.pendingPackets = new Map();
    this.packetId = 0;
    
    this.setupSocket();
  }

  setupSocket() {
    this.socket.on('message', (data, rinfo) => {
      try {
        const packet = this.decryptAndParse(data);
        this.handlePacket(packet, rinfo);
      } catch (e) {
        this.emit('error', e);
      }
    });

    this.socket.on('error', (err) => {
      this.emit('error', err);
    });

    this.socket.on('listening', () => {
      this.emit('ready');
    });
  }

  // Paquetes con ACK
  sendWithAck(data, port, host, callback) {
    const packet = {
      id: this.packetId++,
       data,
      timestamp: Date.now()
    };
    
    const packetData = this.encryptAndStringify(packet);
    this.pendingPackets.set(packet.id, { 
       packetData, 
      retries: 0, 
      callback,
      port,  // Corrección: guardar puerto
      host   // Corrección: guardar host
    });
    
    this.socket.send(packetData, port, host);
    
    // Timeout para reintentos
    setTimeout(() => this.checkAck(packet.id), this.retryDelay);
  }

  handlePacket(packet, rinfo) {
    if (packet.ack) {
      // Confirmación recibida
      const pending = this.pendingPackets.get(packet.ack);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.callback && pending.callback(null, packet);
        this.pendingPackets.delete(packet.ack);
      }
    } else {
      // Enviar ACK
      const ack = Buffer.from(JSON.stringify({ ack: packet.id }));
      this.socket.send(ack, rinfo.port, rinfo.address);
      
      this.emit('data', packet.data, rinfo);
    }
  }

  checkAck(packetId) {
    const pending = this.pendingPackets.get(packetId);
    if (pending && pending.retries < this.maxRetries) {
      pending.retries++;
      this.socket.send(pending.packetData, pending.port, pending.host); // Corrección: usar valores guardados
      pending.timeout = setTimeout(() => this.checkAck(packetId), this.retryDelay * 2);
    } else if (pending) {
      pending.callback && pending.callback(new Error('Max retries exceeded'));
      this.pendingPackets.delete(packetId);
    }
  }

  // Encriptación AES
  encryptAndStringify(data) {
    if (!this.enableEncryption || !this.secretKey) {
      return Buffer.from(JSON.stringify(data));
    }
    
    const cipher = crypto.createCipher('aes-256-cbc', this.secretKey);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.from(encrypted);
  }

  decryptAndParse(data) {
    if (!this.enableEncryption || !this.secretKey) {
      return JSON.parse(data.toString());
    }
    
    const decipher = crypto.createDecipher('aes-256-cbc', this.secretKey);
    let decrypted = decipher.update(data.toString(), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  send(data, port, host) {
    const packet = {
      id: this.packetId++,
       data,
      timestamp: Date.now()
    };
    const packetData = this.encryptAndStringify(packet);
    this.socket.send(packetData, port, host);
  }

  broadcast(data, port) {
    this.socket.setBroadcast(true);
    this.send(data, port, '255.255.255.255');
  }

  bind() {
    this.socket.bind(this.port, this.host);
  }

  close() {
    this.socket.close();
  }
}

module.exports = UDPCall;