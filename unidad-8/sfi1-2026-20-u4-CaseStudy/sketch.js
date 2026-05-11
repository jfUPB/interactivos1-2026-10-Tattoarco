const EVENTS = {
  CONNECT: "CONNECT",
  DISCONNECT: "DISCONNECT",
  DATA: "DATA",
  KEY_PRESSED: "KEY_PRESSED",
  KEY_RELEASED: "KEY_RELEASED",
};

class PainterTask extends FSMTask {
  constructor() {
    super();

    this.c = color(181, 157, 0);

    this.lineSize = 100;
    this.angle = 0;

    this.clickPosX = 0;
    this.clickPosY = 0;

    this.circleResolution = 5;
    this.radius = 100;

    this.eventQueue = [];
    this.activeVisuals = [];

    this.timeOffset = 0;
    this.firstStrudelTimestamp = null;

    this.rxData = {
      x: 0,
      y: 0,
      btnA: false,
      btnB: false,
      prevA: false,
      prevB: false,
      ready: false,
    };

    this.oscControls = {
      rgb: [255, 255, 255],

      scale: 1.0,
      speed: 1.0,

      particles: 0.5,
      glow: 0.5,

      cinemaMode: false,
    };

    this.transitionTo(this.estado_esperando);
  }

  estado_esperando = (ev) => {
    if (ev.type === "ENTRY") {
      cursor();
      console.log("Waiting for connection...");
    } else if (ev.type === EVENTS.CONNECT) {
      this.transitionTo(this.estado_corriendo);
    }
  };

  estado_corriendo = (ev) => {
    if (ev.type === "ENTRY") {
      noCursor();

      background(0);

      this.rxData = {
        x: 0,
        y: 0,
        btnA: false,
        btnB: false,
        prevA: false,
        prevB: false,
        ready: false,
      };
    } else if (ev.type === EVENTS.DISCONNECT) {
      this.transitionTo(this.estado_esperando);
    } else if (ev.type === EVENTS.DATA) {
      if (ev.payload && typeof ev.payload.x === "number" && typeof ev.payload.y === "number") {
        this.updateLogic(ev.payload);
      }
    } else if (ev.type === "STRUDEL") {
      this.updateStrudel(ev.payload);
    } else if (ev.type === "OSC") {
      this.updateOSC(ev.payload);
    }
  };

  updateLogic(data) {
    if (!data || typeof data.x !== "number" || typeof data.y !== "number") {
      return;
    }

    this.rxData.ready = true;

    this.rxData.x = map(data.x, -2048, 2047, 0, width);
    this.rxData.y = map(data.y, -2048, 2047, 0, height);

    this.rxData.btnA = data.btnA;
    this.rxData.btnB = data.btnB;

    this.circleResolution = int(map(data.y, -2048, 2047, 3, 12));

    this.radius = map(data.x, -2048, 2047, 100, width * 0.4);

    this.rxData.prevA = this.rxData.btnA;
    this.rxData.prevB = this.rxData.btnB;
  }

  updateStrudel(payload) {
    if (this.firstStrudelTimestamp === null) {
      this.firstStrudelTimestamp = payload.timestamp;

      this.timeOffset = Date.now() - payload.timestamp;
    }

    const SYNC_OFFSET_MS = 80;

    this.eventQueue.push({
      timestamp: Date.now() - SYNC_OFFSET_MS,
      payload,
    });
  }

  updateOSC(payload) {
    const { address, args } = payload;

    if (address === "/rgb_1") {
      this.oscControls.rgb = [args[0], args[1], args[2]];
    }

    if (address === "/fader_1") {
      this.oscControls.scale = 0.3 + args[0] * 2.7;
    }

    if (address === "/knob_1") {
      this.oscControls.speed = 0.2 + args[0] * 2.8;
    }

    if (address === "/knob_particles") {
      this.oscControls.particles = args[0];
    }

    if (address === "/fader_glow") {
      this.oscControls.glow = args[0];
    }

    if (address === "/toggle_cinema") {
      this.oscControls.cinemaMode = args[0] > 0.5;
    }
  }
}

// ─────────────────────────────────────────────
// GLOBALES
// ─────────────────────────────────────────────

let painter;
let bridge;
let connectBtn;

const renderer = new Map();

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────

function setup() {
  createCanvas(windowWidth, windowHeight);

  rectMode(CENTER);
  ellipseMode(CENTER);

  painter = new PainterTask();

  bridge = new BridgeClient();

  bridge.onConnect(() => {
    connectBtn.html("Disconnect");

    painter.postEvent({
      type: EVENTS.CONNECT,
    });
  });

  bridge.onDisconnect(() => {
    connectBtn.html("Connect");

    painter.postEvent({
      type: EVENTS.DISCONNECT,
    });
  });

  bridge.onData((msg) => {
    // MICROBIT

    if (msg.type === "microbit") {
      painter.postEvent({
        type: EVENTS.DATA,
        payload: {
          x: msg.x,
          y: msg.y,
          btnA: msg.btnA,
          btnB: msg.btnB,
        },
      });

      return;
    }

    // STRUDEL

    if (msg.type === "strudel") {
      painter.postEvent({
        type: "STRUDEL",
        payload: {
          timestamp: msg.timestamp,

          s: msg.payload.s,
          bank: msg.payload.bank,

          delta: msg.payload.delta,
          cps: msg.payload.cps,
        },
      });

      return;
    }

    // OSC

    if (msg.type === "osc") {
      painter.postEvent({
        type: "OSC",
        payload: msg.payload,
      });

      return;
    }
  });

  connectBtn = createButton("Connect");

  connectBtn.position(20, 20);

  connectBtn.mousePressed(() => {
    if (bridge.isOpen) bridge.close();
    else bridge.open();
  });

  renderer.set(painter.estado_corriendo, drawRunning);
}

// ─────────────────────────────────────────────
// DRAW
// ─────────────────────────────────────────────

function draw() {
  drainStrudelQueue();

  painter.update();

  renderer.get(painter.state)?.();
}

// ─────────────────────────────────────────────
// COLA STRUDEL
// ─────────────────────────────────────────────

function drainStrudelQueue() {
  const now = Date.now();

  const due = painter.eventQueue.filter((e) => e.timestamp <= now);

  painter.eventQueue = painter.eventQueue.filter((e) => e.timestamp > now);

  for (const e of due) {
    const s = e.payload.s ?? "unknown";

    const durationMs = (e.payload.delta ?? 0.25) * 1000;

    painter.activeVisuals.push({
      startTime: now,

      duration: durationMs,

      type: s,

      x: random(width * 0.15, width * 0.85),

      y: random(height * 0.15, height * 0.85),

      color: getColorForSound(s),
    });
  }

  painter.activeVisuals = painter.activeVisuals.filter((v) => (now - v.startTime) / v.duration <= 1);
}

// ─────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────

function getColorForSound(s) {
  const colors = {
    tr909bd: [255, 50, 80],

    tr909sd: [0, 220, 255],

    tr909hh: [255, 255, 0],

    tr909oh: [255, 150, 0],

    gm_synth_bass_1: [180, 0, 255],

    gm_synth_strings_1: [0, 255, 180],
  };

  if (colors[s]) return colors[s];

  return [255, 255, 255];
}

function blendColorWithOSC(base, osc) {
  return [(base[0] + osc[0]) / 2, (base[1] + osc[1]) / 2, (base[2] + osc[2]) / 2];
}

// ─────────────────────────────────────────────
// VISUALES
// ─────────────────────────────────────────────

function dibujarBombo(p, c, sc) {
  let d = lerp(50, 700, p) * sc;

  fill(c[0], c[1], c[2], 150 * (1 - p));

  circle(width / 2, height / 2, d);
}

function dibujarCaja(p, c, sc) {
  fill(c[0], c[1], c[2], 120 * (1 - p));

  rect(width / 2, height / 2, width * (1 - p), 50 * sc);
}

function dibujarHat(anim, p, c, sc) {
  fill(c[0], c[1], c[2], 180);

  let sz = lerp(60, 0, p) * sc;

  rect(anim.x, anim.y, sz, sz);
}

function dibujarBassWave(anim, p, c, sc) {
  push();

  noFill();

  stroke(c[0], c[1], c[2], 180);

  strokeWeight(2);

  beginShape();

  for (let x = 0; x < width; x += 12) {
    let y = anim.y + sin(x * 0.02 + frameCount * 0.05) * 80 * sc * (1 - p);

    vertex(x, y);
  }

  endShape();

  pop();
}

function dibujarLeadParticles(anim, p, c, sc) {
  push();

  noStroke();

  const total = 20 + int(painter.oscControls.particles * 60);

  for (let i = 0; i < total; i++) {
    let a = (TWO_PI / total) * i;

    let r = lerp(0, 200 * sc, p);

    let x = anim.x + cos(a) * r;

    let y = anim.y + sin(a) * r;

    fill(c[0], c[1], c[2], 180 * (1 - p));

    circle(x, y, 6 * sc);
  }

  pop();
}

function dibujarPadGlow(anim, p, c, sc) {
  push();

  noStroke();

  fill(c[0], c[1], c[2], 60 * (1 - p));

  circle(anim.x, anim.y, lerp(50, 500, p) * sc);

  pop();
}

function dibujarDefault(anim, p, c, sc) {
  push();

  translate(anim.x, anim.y);

  rotate(frameCount * 0.02);

  noFill();

  stroke(c[0], c[1], c[2]);

  rect(0, 0, lerp(150, 0, p) * sc, lerp(150, 0, p) * sc);

  pop();
}

// ─────────────────────────────────────────────
// DRAW RUNNING
// ─────────────────────────────────────────────

function drawRunning() {
  const mb = painter.rxData;

  const now = Date.now();

  const osc = painter.oscControls;

  // TRAILS

  if (osc.cinemaMode) {
    background(0, 5);
  } else {
    background(0, 15);
  }

  // GRID AMBIENTAL

  pop();

  // VISUALES STRUDEL

  for (const anim of painter.activeVisuals) {
    const elapsed = now - anim.startTime;

    const progress = constrain((elapsed / anim.duration) * osc.speed, 0, 1);

    if (progress >= 1) continue;

    const blended = blendColorWithOSC(anim.color, osc.rgb);

    const sc = osc.scale;

    push();

    drawingContext.shadowBlur = 20 + osc.glow * 60;

    drawingContext.shadowColor = `rgb(${blended[0]},${blended[1]},${blended[2]})`;

    noStroke();

    if (anim.type.includes("bd")) {
      dibujarBombo(progress, blended, sc);
    } else if (anim.type.includes("sd") || anim.type.includes("cp")) {
      dibujarCaja(progress, blended, sc);
    } else if (anim.type.includes("hh") || anim.type.includes("oh")) {
      dibujarHat(anim, progress, blended, sc);
    } else if (anim.type.includes("bass")) {
      dibujarBassWave(anim, progress, blended, sc);
    } else if (anim.type.includes("string")) {
      dibujarLeadParticles(anim, progress, blended, sc);
    } else {
      dibujarDefault(anim, progress, blended, sc);
    }

    pop();
  }

  // MICROBIT

  if (mb.ready) {
    // CURSOR FÍSICO

    push();

    noStroke();

    fill(osc.rgb[0], osc.rgb[1], osc.rgb[2], 40);

    circle(mb.x, mb.y, 120 * osc.scale);

    pop();

    // BTN A

    if (mb.btnA) {
      push();

      translate(width / 2, height / 2);

      noFill();

      stroke(osc.rgb[0], osc.rgb[1], osc.rgb[2]);

      strokeWeight(2);

      beginShape();

      const angle = TAU / painter.circleResolution;

      for (let i = 0; i <= painter.circleResolution; i++) {
        vertex(
          cos(angle * i) * painter.radius * osc.scale,

          sin(angle * i) * painter.radius * osc.scale,
        );
      }

      endShape(CLOSE);

      pop();
    }

    // BTN B

    if (mb.btnB) {
      push();

      stroke(osc.rgb[0], osc.rgb[1], osc.rgb[2], 80);

      for (let i = 0; i < 20; i++) {
        const a = (TWO_PI / 20) * i + frameCount * 0.02;

        line(
          mb.x,
          mb.y,

          mb.x + cos(a) * 300 * osc.scale,

          mb.y + sin(a) * 300 * osc.scale,
        );
      }

      pop();
    }

    // A + B

    if (mb.btnA && mb.btnB) {
      push();

      noFill();

      stroke(255, 100);

      const pulse = 300 + sin(frameCount * 0.05) * 100;

      circle(width / 2, height / 2, pulse * osc.scale);

      circle(width / 2, height / 2, pulse * 1.5 * osc.scale);

      pop();
    }
  }

  // LIMPIEZA

  painter.activeVisuals = painter.activeVisuals.filter((v) => ((now - v.startTime) / v.duration) * osc.speed < 1);
}

// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
