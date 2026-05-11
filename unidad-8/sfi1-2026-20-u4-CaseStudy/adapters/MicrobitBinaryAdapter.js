const { SerialPort } = require("serialport");
const BaseAdapter = require("./BaseAdapter");

const PACKET_SIZE = 8;
const HEADER_BYTE = 0xAA;

class MicrobitBinaryAdapter extends BaseAdapter {
  constructor({ path, baud = 115200, verbose = false } = {}) {
    super();
    this.path = path;
    this.baud = baud;
    this.port = null;
    this.buf = Buffer.alloc(0); // Buffer binario
    this.verbose = verbose;
  }

  async connect() {
    if (this.connected) return;
    if (!this.path) throw new Error("serialPort is required for microbitBinary device mode");

    this.port = new SerialPort({
      path: this.path,
      baudRate: this.baud,
      autoOpen: false,
    });

    await new Promise((resolve, reject) => {
      this.port.open((err) => (err ? reject(err) : resolve()));
    });

    this.connected = true;
    this.onConnected?.(`serial open ${this.path} @${this.baud}`);

    this.port.on("data", (chunk) => this._onChunk(chunk));
    this.port.on("error", (err) => this._fail(err));
    this.port.on("close", () => this._closed());
  }

  async disconnect() {
    if (!this.connected) return;
    this.connected = false;

    if (this.port && this.port.isOpen) {
      await new Promise((resolve, reject) => {
        this.port.close((err) => (err ? reject(err) : resolve()));
      });
    }
    this.port = null;
    this.buf = Buffer.alloc(0);
    this.onDisconnected?.("serial closed");
  }

  getConnectionDetail() {
    return `serial open ${this.path}`;
  }

  _onChunk(chunk) {
    // 1. Acumular bytes en el buffer
    this.buf = Buffer.concat([this.buf, chunk]);

    // 2. Procesar todos los paquetes completos disponibles
    while (true) {
      // 3. Buscar el byte de sincronización 0xAA
      const headerIdx = this.buf.indexOf(HEADER_BYTE);

      if (headerIdx === -1) {
        // No hay header en absoluto → descartar todo
        this.buf = Buffer.alloc(0);
        break;
      }

      if (headerIdx > 0) {
        // Hay basura antes del header → descartarla
        if (this.verbose) console.warn(`[BinaryAdapter] Descartando ${headerIdx} bytes de basura antes del header`);
        this.buf = this.buf.slice(headerIdx);
      }

      // 4. ¿Tenemos al menos 8 bytes desde el header?
      if (this.buf.length < PACKET_SIZE) {
        break; // Esperar más datos
      }

      // 5. Extraer los 8 bytes del paquete
      const packet = this.buf.slice(0, PACKET_SIZE);

      // 6. Calcular y verificar checksum
      let sum = 0;
      for (let i = 1; i <= 6; i++) sum += packet[i];
      const expectedChecksum = sum % 256;
      const receivedChecksum = packet[7];

      if (expectedChecksum !== receivedChecksum) {
        console.warn(
          `[BinaryAdapter] Checksum inválido: esperado 0x${expectedChecksum.toString(16).toUpperCase().padStart(2,'0')}, ` +
          `recibido 0x${receivedChecksum.toString(16).toUpperCase().padStart(2,'0')} ` +
          `| Paquete: ${[...packet].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}`
        );
        this.buf = this.buf.slice(1); // Avanzar 1 byte para buscar el próximo 0xAA
        continue;
      }

      // 7. Parsear los campos del paquete
      const x    = packet.readInt16BE(1);  // bytes 1-2: int16 big-endian
      const y    = packet.readInt16BE(3);  // bytes 3-4: int16 big-endian
      const btnA = packet[5] === 1;        // byte 5: uint8
      const btnB = packet[6] === 1;        // byte 6: uint8

      if (this.verbose) {
        console.log(`[BinaryAdapter] Paquete OK → x=${x}, y=${y}, btnA=${btnA}, btnB=${btnB}`);
      }

      this.onData?.({ x, y, btnA, btnB });
      this.buf = this.buf.slice(PACKET_SIZE);
    }

    if (this.buf.length > 4096) {
      console.warn("[BinaryAdapter] Buffer overflow, descartando");
      this.buf = Buffer.alloc(0);
    }
  }

  _fail(err) {
    this.onError?.(String(err?.message || err));
    this.disconnect();
  }

  _closed() {
    if (!this.connected) return;
    this.connected = false;
    this.port = null;
    this.buf = Buffer.alloc(0);
    this.onDisconnected?.("serial closed (event)");
  }

  // handleCommand no se implementa a menos que el firmware binario lo soporte
}

module.exports = MicrobitBinaryAdapter;