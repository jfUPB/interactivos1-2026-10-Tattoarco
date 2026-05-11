// adapters/StrudelAdapter.js
const { WebSocketServer } = require("ws");

class StrudelAdapter {
  constructor({ port = 8080 } = {}) {
    this._port = port;
    this._wss = null;

    // Callbacks — misma interfaz que los otros adapters
    this.onData = null;
    this.onConnected = null;
    this.onDisconnected = null;
    this.onError = null;

    this.connected = false;
  }

  connect() {
    return new Promise((resolve) => {
      this._wss = new WebSocketServer({ port: this._port });

      this._wss.on("listening", () => {
        this.connected = true;
        this.onConnected?.(`StrudelAdapter escuchando en ws://127.0.0.1:${this._port}`);
        resolve();
      });

      this._wss.on("connection", (ws) => {
        ws.on("message", (raw) => {
          let msg;
          try {
            msg = JSON.parse(raw.toString("utf8"));
          } catch {
            return;
          }

          const normalized = this._normalize(msg);
          if (normalized) this.onData?.(normalized);
        });

        ws.on("error", (e) => this.onError?.(e.message));
      });

      this._wss.on("error", (e) => {
        this.onError?.(e.message);
        resolve(); // no bloquear el arranque del bridge
      });
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      this._wss?.close(() => {
        this.connected = false;
        this.onDisconnected?.("StrudelAdapter cerrado");
        resolve();
      });
    });
  }

  getConnectionDetail() {
    return `strudel ws://127.0.0.1:${this._port}`;
  }

  // handleCommand no aplica a Strudel, pero se expone para cumplir la interfaz
  handleCommand(_msg) {}

  // — normalización —
  _normalize(msg) {
    // Formato esperado de Strudel / SuperDirt:
    // { address: '/dirt/play', args: ['cps', 0.5, 's', 'tr909bd', ...], timestamp: 1774... }
    if (!msg || msg.address !== "/dirt/play" || !Array.isArray(msg.args)) return null;

    const params = this._parseArgs(msg.args);
    // if (!params.s) return null; // sin nombre de sonido, ignorar

    if (!params.s) {
      console.log("Evento sin 's':", msg);
      return null;
    }

    return {
      type: "strudel",
      timestamp: typeof msg.timestamp === "number" ? msg.timestamp : Date.now(),
      payload: {
        s: params.s,
        bank: params.bank ?? null,
        delta: params.delta ?? 0.5,
        cps: params.cps ?? 0.5,
        cycle: params.cycle ?? 0,
        eventType: "noteEvent",
      },
    };
  }

  // args es un array plano [key, val, key, val, ...]
  _parseArgs(args) {
    const out = {};
    for (let i = 0; i < args.length - 1; i += 2) {
      out[args[i]] = args[i + 1];
    }
    return out;
  }
}

module.exports = StrudelAdapter;
