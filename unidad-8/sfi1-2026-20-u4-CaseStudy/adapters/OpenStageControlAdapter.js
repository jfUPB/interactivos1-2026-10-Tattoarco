// adapters/OpenStageControlAdapter.js
// Recibe mensajes OSC por UDP y los normaliza al contrato del sistema.
// Usa la misma librería `osc` y la misma lógica que bridgeOSC.js (caso de estudio).

const osc = require("osc");

class OpenStageControlAdapter {
  constructor({ port = 9000 } = {}) {
    this._port = port;
    this._udpPort = null;
    this.connected = false;

    this.onConnected    = null;
    this.onDisconnected = null;
    this.onError        = null;
    this.onData         = null;
  }

  getConnectionDetail() {
    return `OSC UDP :${this._port}`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this._udpPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: this._port,
      });

      this._udpPort.on("ready", () => {
        this.connected = true;
        this.onConnected?.(this.getConnectionDetail());
        resolve();
      });

      this._udpPort.on("message", (msg, timeTag, info) => {
        // Misma lógica de normalización que bridgeOSC.js
        const normalized = {
          type: "osc",
          payload: {
            address: msg.address,
            args: Array.isArray(msg.args)
              ? msg.args.map(this._normalizeArg)
              : [],
          },
        };
        this.onData?.(normalized);
      });

      this._udpPort.on("error", (err) => {
        this.onError?.(`OSC UDP error: ${err.message}`);
        reject(err);
      });

      this._udpPort.open();
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      if (!this._udpPort) { resolve(); return; }
      try { this._udpPort.close(); } catch (_) {}
      this._udpPort = null;
      this.connected = false;
      this.onDisconnected?.("OSC UDP closed");
      resolve();
    });
  }

  // Igual que normalizeArg en bridgeOSC.js
  _normalizeArg(a) {
    if (a != null && typeof a === "object" && "value" in a) return a.value;
    return a;
  }
}

module.exports = OpenStageControlAdapter;