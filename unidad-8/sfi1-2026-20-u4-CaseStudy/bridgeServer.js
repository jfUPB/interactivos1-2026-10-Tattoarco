//   Uso:
//     node bridgeServer.js --device sim --wsPort 8081 --hz 30
//     node bridgeServer.js --device microbit --wsPort 8081 --serialPort COM5 --baud 115200

//   WS contract:
//    * bridge To client:
//        {type:"status", state:"ready|connected|disconnected|error", detail:"..."}
//        {type:"microbit", x:int, y:int, btnA:bool, btnB:bool, t:ms}
//    * client To bridge:
//        {cmd:"connect"} | {cmd:"disconnect"}
//        {cmd:"setSimHz", hz:30}
//        {cmd:"setLed", x:2, y:3, value:9}

const { WebSocketServer } = require("ws");
const { SerialPort } = require("serialport");
const SimAdapter = require("./adapters/SimAdapter");
const MicrobitAsciiAdapter = require("./adapters/MicrobitASCIIAdapter");
const MicrobitAscii2Adapter = require("./adapters/MicrobitASCIIA2dapter");
const MicrobitBinaryAdapter = require("./adapters/MicrobitBinaryAdapter");
const StrudelAdapter = require("./adapters/StrudelAdapter");
const OpenStageControlAdapter = require("./adapters/OpenStageControlAdapter");

const log = {
  info: (...args) => console.log(`[${new Date().toISOString()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] [ERROR]`, ...args),
};

function getArg(name, def = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return def;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function nowMs() {
  return Date.now();
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    log.warn("Failed to parse JSON: ", s, e);
    return null;
  }
}

function broadcast(wss, obj) {
  const text = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(text);
  }
}

function status(wss, state, detail = "") {
  broadcast(wss, { type: "status", state, detail, t: nowMs() });
}

const DEVICE = (getArg("device", "sim") || "sim").toLowerCase();
const WS_PORT = parseInt(getArg("wsPort", "8081"), 10);
const SERIAL_PATH = getArg("serialPort", null);
const BAUD = parseInt(getArg("baud", "115200"), 10);
const SIM_HZ = parseInt(getArg("hz", "30"), 10);
const VERBOSE = hasFlag("verbose");

async function findMicrobitPort() {
  const ports = await SerialPort.list();
  const microbit = ports.find((p) => p.vendorId && parseInt(p.vendorId, 16) === 0x0d28);
  return microbit?.path ?? null;
}

async function createAdapter() {
  if (DEVICE === "microbit") {
    const path = SERIAL_PATH ?? (await findMicrobitPort());
    if (!path) {
      log.error("micro:bit not found. Use --serialPort to specify manually.");
      process.exit(1);
    }
    log.info(`micro:bit found at ${path}`);
    return new MicrobitAsciiAdapter({ path, baud: BAUD, verbose: VERBOSE });
  }

  if (DEVICE === "microbit2") {
    const path = SERIAL_PATH ?? (await findMicrobitPort());
    if (!path) {
      log.error("micro:bit not found. Use --serialPort to specify manually.");
      process.exit(1);
    }
    log.info(`micro:bit 2 found at ${path}`);
    return new MicrobitAscii2Adapter({ path, baud: BAUD, verbose: VERBOSE });
  }

  if (DEVICE === "microbitbinary") {
    const path = SERIAL_PATH ?? (await findMicrobitPort());
    if (!path) {
      log.error("micro:bit not found. Use --serialPort to specify manually.");
      process.exit(1);
    }
    return new MicrobitBinaryAdapter({ path, baud: BAUD });
  }

  if (DEVICE === "strudel") {
    const strudelPort = parseInt(getArg("strudelPort", "8080"), 10);
    return new StrudelAdapter({ port: strudelPort });
  }

  return new SimAdapter({ hz: SIM_HZ });
}

async function main() {
  const wss = new WebSocketServer({ port: WS_PORT });

  log.info(`WS listening on ws://127.0.0.1:${WS_PORT} device=${DEVICE}`);

  const adapter = await createAdapter();

  // ───── NUEVO: Strudel como adapter paralelo ─────

  const strudelPort = parseInt(getArg("strudelPort", "8080"), 10);
  const strudelAdapter = new StrudelAdapter({ port: strudelPort });

  strudelAdapter.onData = (d) => {
    console.log("STRUDEL LLEGÓ:", d);
    broadcast(wss, d);
  };

  await strudelAdapter.connect();

  // ───── Adapter principal (microbit / sim / strudel) ─────

  adapter.onConnected = (detail) => {
    log.info(`[ADAPTER] Device Connected: ${detail}`);
    status(wss, "connected", detail);
  };

  adapter.onDisconnected = (detail) => {
    log.warn(`[ADAPTER] Device Disconnected: ${detail}`);
    status(wss, "disconnected", detail);
  };

  adapter.onError = (detail) => {
    log.error(`[ADAPTER] Device Error: ${detail}`);
    status(wss, "error", detail);
  };

  adapter.onData = (d) => {
    if (d.type === "microbit") {
      broadcast(wss, d);
      return;
    }

    if (d.type === "strudel") {
      broadcast(wss, d);
      return;
    }

    if (d.type === "osc") {
      broadcast(wss, d);
      return;
    }

    // fallback (legacy microbit)
    broadcast(wss, {
      type: "microbit",
      x: d.x,
      y: d.y,
      btnA: !!d.btnA,
      btnB: !!d.btnB,
      t: nowMs(),
    });
  };

  // ───── 🔵 NUEVO: Adapter OSC independiente ─────

  const oscAdapter = new OpenStageControlAdapter({ port: 9000 });

  // oscAdapter.onConnected = (detail) => {
  //   log.info(`[OSC] Connected: ${detail}`);
  // };

  // oscAdapter.onDisconnected = (detail) => {
  //   log.warn(`[OSC] Disconnected: ${detail}`);
  // };

  // oscAdapter.onError = (err) => {
  //   log.error(`[OSC] Error: ${err}`);
  // };

  oscAdapter.onData = (d) => {
    console.log("OSC LLEGÓ:", d); // 🔥 importante
    broadcast(wss, d);
  };

  await oscAdapter.connect();

  // ───── Estado inicial ─────

  status(wss, "ready", `bridge up (${DEVICE})`);

  // ───── WebSocket clients ─────

  wss.on("connection", (ws, req) => {
    log.info(`[NETWORK] Remote Client connected from ${req.socket.remoteAddress}. Total clients: ${wss.clients.size}`);

    const state = adapter.connected ? "connected" : "ready";

    const detail = adapter.connected ? adapter.getConnectionDetail() : `bridge (${DEVICE})`;

    ws.send(
      JSON.stringify({
        type: "status",
        state,
        detail,
        t: nowMs(),
      }),
    );

    ws.on("message", async (raw) => {
      const msg = safeJsonParse(raw.toString("utf8"));
      if (!msg) return;

      if (msg.cmd === "connect") {
        log.info(`[NETWORK] Client requested adapter connect`);

        if (adapter.connected) {
          log.info(`[HW-POLICY] Adapter already open. Sending current status to incoming client.`);
          ws.send(
            JSON.stringify({
              type: "status",
              state: "connected",
              detail: adapter.getConnectionDetail(),
              t: nowMs(),
            }),
          );
          return;
        }

        try {
          await adapter.connect();
        } catch (e) {
          const detail = `connect failed: ${e.message || e}`;
          log.error(`[ADAPTER] ` + detail);
          status(wss, "error", detail);
        }
        return;
      }

      if (msg.cmd === "disconnect") {
        log.info(`[NETWORK] Client requested adapter disconnect`);

        if (wss.clients.size > 1) {
          log.info(`[HW-POLICY] Adapter kept open. Shared with ${wss.clients.size - 1} other active client(s).`);
          ws.send(
            JSON.stringify({
              type: "status",
              state: "disconnected",
              detail: "logical disconnect only",
              t: nowMs(),
            }),
          );
          return;
        }

        try {
          await adapter.disconnect();
        } catch (e) {
          const detail = `disconnect failed: ${e.message || e}`;
          log.error(`[ADAPTER] ` + detail);
          status(wss, "error", detail);
        }
        return;
      }

      if (msg.cmd === "setSimHz" && adapter instanceof SimAdapter) {
        log.info(`Setting Sim Hz to ${msg.hz}`);
        await adapter.handleCommand(msg);
        status(wss, "connected", `sim hz=${adapter.hz}`);
        return;
      }

      if (msg.cmd === "setLed") {
        try {
          await adapter.handleCommand?.(msg);
        } catch (e) {
          const detail = `command failed: ${e.message || e}`;
          log.error(`[ADAPTER] ` + detail);
          status(wss, "error", detail);
        }
        return;
      }
    });

    ws.on("close", () => {
      log.info(`[NETWORK] Remote Client disconnected. Total clients left: ${wss.clients.size}`);

      if (wss.clients.size === 0) {
        log.info("[HW-POLICY] No more remote clients. Auto-disconnecting adapter device to free resources...");
        adapter.disconnect();
      }
    });
  });

  // ───── Auto-start sim ─────




  
  // ───── Auto-start adapter principal (microbit / sim) ─────

  if (DEVICE === "sim" || DEVICE === "microbit" || DEVICE === "microbit2" || DEVICE === "microbitbinary") {
    await adapter.connect();
  }
}

main().catch((e) => {
  log.error("Fatal:", e);
  process.exit(1);
});
