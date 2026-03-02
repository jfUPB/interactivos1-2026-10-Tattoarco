# Unidad 3

## Bitácora de proceso de aprendizaje

### Actividad 1
````.py
from microbit import *
import utime

class Timer:
    def __init__(self, owner, event_to_post, duration):
        self.owner = owner
        self.event = event_to_post
        self.duration = duration

        self.start_time = 0
        self.active = False

    def start(self, new_duration=None):
        if new_duration is not None:
            self.duration = new_duration
        self.start_time = utime.ticks_ms()
        self.active = True

    def stop(self):
        self.active = False

    def update(self):
        if self.active:
            if utime.ticks_diff(utime.ticks_ms(), self.start_time) >= self.duration:
                self.active = False
                self.owner.post_event(self.event)


class Semaforo:
    def __init__(self,_x,_y,_timeInRed,_timeInGreen,_timeInYellow):
        self.event_queue = []
        self.timers = []
        self.x = _x
        self.y = _y
        self.timeInRed = _timeInRed
        self.timeInGreen = _timeInGreen
        self.timeInYellow = _timeInYellow
        self.myTimer = self.createTimer("Timeout",self.timeInRed)

        self.estado_actual = None
        self.transicion_a(self.estado_waitInRed)

    def createTimer(self,event,duration):
        t = Timer(self, event, duration)
        self.timers.append(t)
        return t

    def post_event(self, ev):
        self.event_queue.append(ev)

    def update(self):
        # 1. Actualizar todos los timers internos automáticamente
        for t in self.timers:
            t.update()

        # 2. Procesar la cola de eventos resultante
        while len(self.event_queue) > 0:
            ev = self.event_queue.pop(0)
            if self.estado_actual:
                self.estado_actual(ev)

    def transicion_a(self, nuevo_estado):
        if self.estado_actual: self.estado_actual("EXIT")
        self.estado_actual = nuevo_estado
        self.estado_actual("ENTRY")

    def clear(self):
        display.set_pixel(self.x,self.y,0)
        display.set_pixel(self.x,self.y+1,0)
        display.set_pixel(self.x,self.y+2,0)

    def estado_waitInRed(self, ev):
        if ev == "ENTRY":
            self.clear()
            display.set_pixel(self.x,self.y,9)
            self.myTimer.start(self.timeInRed)
        if ev == "Timeout":
            display.set_pixel(self.x,self.y,0)
            self.transicion_a(self.estado_waitInGreen)

    def estado_waitInGreen(self, ev):
        if ev == "ENTRY":
            self.clear()
            display.set_pixel(self.x,self.y+2,9)
            self.myTimer.start(self.timeInGreen)
        if ev == "Timeout":
            display.set_pixel(self.x,self.y+2,0)
            self.transicion_a(self.estado_waitInYellow)
        if ev == "A":
            self.transicion_a(self.estado_waitInYellow)
        if ev == "B":
           self.transicion_a(self.estado_nocturno)

    def estado_waitInYellow(self, ev):
        if ev == "ENTRY":
            self.clear()
            display.set_pixel(self.x,self.y+1,9)
            self.myTimer.start(self.timeInYellow)
        if ev == "Timeout":
            display.set_pixel(self.x,self.y+1,0)
            self.transicion_a(self.estado_waitInRed)
        
    def estado_nocturno(self, ev):
        if ev == "ENTRY":
            self.clear()
            display.set_pixel(self.x, self.y+1,9)
            self.myTimer.start(self.timeInYellow)
        if ev == "Timeout":
            pixelState = display.get_pixel(self.x,self.y+1)
            if pixelState == 9: display.set_pixel(self.x,self.y+1,0)
            else: display.set_pixel(self.x, self.y+1,9)
            self.myTimer.start(self.timeInYellow)

        if ev == "A":
            self.transicion_a(self.estado_waitInRed)
            
    
semaforo1 = Semaforo(0,0,2000,1000,500)

while True:
    if button_a.was_pressed():
        semaforo1.post_event("A")
    if button_b.was_pressed():
        semaforo1.post_event("B")
    semaforo1.update()
    utime.sleep_ms(20)
````

### Actividad 2
- El cídigo no funciona
  No funcionaba porque tenía funciones mal definidas o que eran redundantes y la estrctura estaba mal planteada en el estado paused
  
````.py
from microbit import *
import utime
import music

class Timer:
    def __init__(self, owner, event_to_post, duration):
        self.owner = owner
        self.event = event_to_post
        self.duration = duration
        self.start_time = 0
        self.active = False

    def start(self, new_duration=None):
        if new_duration is not None:
            self.duration = new_duration
        self.start_time = utime.ticks_ms()
        self.active = True

    def stop(self):
        self.active = False

    def update(self):
        if self.active:
            if utime.ticks_diff(utime.ticks_ms(), self.start_time) >= self.duration:
                self.active = False
                self.owner.post_event(self.event)


class Task:
    def __init__(self):
        self.pixeles = 20
        self.event_queue = []
        self.timers = []
        # Personalizas el nombre del evento y la duración
        self.myTimer = self.createTimer("Timeout",1000)

        self.estado_actual = None
        self.transicion_a(self.estado_estado1)

    def createTimer(self,event,duration):
        t = Timer(self, event, duration)
        self.timers.append(t)
        return t

    def post_event(self, ev):
        self.event_queue.append(ev)

    def update(self):
        # 1. Actualizar todos los timers internos automáticamente
        for t in self.timers:
            t.update()

        # 2. Procesar la cola de eventos resultante
        while len(self.event_queue) > 0:
            ev = self.event_queue.pop(0)
            if self.estado_actual:
                self.estado_actual(ev)

    def transicion_a(self, nuevo_estado):
        if self.estado_actual: self.estado_actual("EXIT")
        self.estado_actual = nuevo_estado
        self.estado_actual("ENTRY")

    def mostrar_pixeles(self): 
        contador = 0 
        display.clear() 
        for y in range(5): 
            for x in range(5): 
                if contador < self.pixeles:
                    display.set_pixel(x, y, 9) 
                    contador += 1
    
    def apagar_pixel(self): 
        contador = 0 
        for y in range(4,-1,-1): 
            for x in range(4,-1,-1): 
                if display.get_pixel(x, y) == 9:
                    display.set_pixel(x, y, 0)
                    return
    
    def estado_estado1(self, ev):
        if ev == "ENTRY":
            self.pixeles = 20
            self.mostrar_pixeles()
        if ev == "A":
            if self.pixeles < 25: 
                self.pixeles += 1 
                self.mostrar_pixeles()
        if ev == "B":
            if self.pixeles >15:
                self.pixeles -=1
                self.mostrar_pixeles()
        if ev == "S": 
            self.transicion_a(self.estado_estado2)
            
            
    def estado_estado2(self, ev):
        if ev == "ENTRY": 
            self.myTimer.start(1000) 
        if ev == "Timeout":
            if self.pixeles > 0:
                self.pixeles -= 1
                self.apagar_pixel()
                self.myTimer.start()
            else:
                self.transicion_a(self.estado_end)
        if ev == "S":
            self.myTimer.stop()

    def estado_paused(self, ev):
        if "ENTRY":
            self.myTimer.stop()
        if ev == "S":
            self.transicion_to(self.estado_paused)
     
    
    def estado_end(self, ev): 
        if ev == "ENTRY": 
            display.show(Image.SKULL) 
            music.play(music.BIRTHDAY)
        if ev == "A": 
            self.transicion_a(self.estado_estado1)
                

task = Task()

while True:
    # Aquí generas los eventos de los botones y el gesto
    if button_a.was_pressed():
        task.post_event("A")
    if button_b.was_pressed():
        task.post_event("B")
    if accelerometer.is_gesture("shake"):
        task.post_event("S")

    task.update()
    utime.sleep_ms(20)



````

- Ya el código funciona:

```` .py
from microbit import *
import utime
import music

class Timer:
    def __init__(self, owner, event_to_post, duration):
        self.owner = owner
        self.event = event_to_post
        self.duration = duration
        self.start_time = 0
        self.active = False

    def start(self, new_duration=None):
        if new_duration is not None:
            self.duration = new_duration
        self.start_time = utime.ticks_ms()
        self.active = True

    def stop(self):
        self.active = False

    def update(self):
        if self.active:
            if utime.ticks_diff(utime.ticks_ms(), self.start_time) >= self.duration:
                self.active = False
                self.owner.post_event(self.event)


class Task:
    def __init__(self):
        self.pixeles = 20
        self.event_queue = []
        self.timers = []
        self.myTimer = self.createTimer("Timeout",1000)

        self.secuencia = ""   # para detectar A-B-A

        self.estado_actual = None
        self.transicion_a(self.estado_estado1)

    def createTimer(self,event,duration):
        t = Timer(self, event, duration)
        self.timers.append(t)
        return t

    def post_event(self, ev):
        self.event_queue.append(ev)

    def update(self):
        for t in self.timers:
            t.update()

        while len(self.event_queue) > 0:
            ev = self.event_queue.pop(0)
            if self.estado_actual:
                self.estado_actual(ev)

    def transicion_a(self, nuevo_estado):
        if self.estado_actual:
            self.estado_actual("EXIT")
        self.estado_actual = nuevo_estado
        self.estado_actual("ENTRY")

    def mostrar_pixeles(self): 
        contador = 0 
        display.clear() 
        for y in range(5): 
            for x in range(5): 
                if contador < self.pixeles:
                    display.set_pixel(x, y, 9) 
                    contador += 1
    
    def apagar_pixel(self): 
        for y in range(4,-1,-1): 
            for x in range(4,-1,-1): 
                if display.get_pixel(x, y) == 9:
                    display.set_pixel(x, y, 0)
                    return
    
  
    def estado_estado1(self, ev):
        if ev == "ENTRY":
            self.pixeles = 20
            self.secuencia = ""
            self.mostrar_pixeles()

        if ev == "A":
            if self.pixeles < 25: 
                self.pixeles += 1 
                self.mostrar_pixeles()

        if ev == "B":
            if self.pixeles > 15:
                self.pixeles -= 1
                self.mostrar_pixeles()

        if ev == "S": 
            self.transicion_a(self.estado_estado2)


    def estado_estado2(self, ev):

        if ev == "ENTRY": 
            self.myTimer.start(1000)

        if ev == "A":
            self.secuencia += "A"
            self.myTimer.stop()
            self.transicion_a(self.estado_paused)

        if ev == "B":
            self.secuencia += "B"

        if self.secuencia.endswith("ABA"):
            self.secuencia = ""
            self.myTimer.stop()
            self.transicion_a(self.estado_estado1)

        if ev == "Timeout":
            if self.pixeles > 0:
                self.pixeles -= 1
                self.apagar_pixel()
                self.myTimer.start()
            else:
                self.transicion_a(self.estado_end)


    def estado_paused(self, ev):

        if ev == "ENTRY":
            pass 

        if ev == "A":
            self.transicion_a(self.estado_estado2)

        if ev == "B":
            self.secuencia += "B"

        if self.secuencia.endswith("ABA"):
            self.secuencia = ""
            self.transicion_a(self.estado_estado1)

  
    def estado_end(self, ev): 
        if ev == "ENTRY": 
            display.show(Image.SKULL) 
            music.play(music.BIRTHDAY)

        if ev == "A": 
            self.transicion_a(self.estado_estado1)


task = Task()

while True:
    if button_a.was_pressed():
        task.post_event("A")

    if button_b.was_pressed():
        task.post_event("B")

    if accelerometer.is_gesture("shake"):
        task.post_event("S")

    task.update()
    utime.sleep_ms(20)
````
    

## Bitácora de aplicación 

### Actividad 4
Al princio me generó error ya que estaba importando el estado en los lugares erroneos.
````.js
let port;
let connectBtn;

const TIMER_LIMITS = {
  min: 15,
  max: 25,
  defaultValue: 20,
};

const EVENTS = {
  DEC: "A",
  INC: "B",
  START: "S",
  TICK: "Timeout",
};

const UI = {
  dialSize: 250,
  ringWeight: 20,
  bigText: 100,
  configText: 120,
  helpText: 18,
};

// Define la clase Temporizador que extiende FSMTask para manejar el estado del temporizador y las transiciones entre estados.
class Temporizador extends FSMTask {
  constructor(minValue, maxValue, defaultValue) {
    super();

    this.minValue = minValue;
    this.maxValue = maxValue;
    this.defaultValue = defaultValue;
    this.configValue = defaultValue;
    this.totalSeconds = defaultValue;
    this.remainingSeconds = defaultValue;
    this.password = [EVENTS.DEC, EVENTS.INC, EVENTS.DEC];
    this.stopSequence = [];

    this.myTimer = this.addTimer(EVENTS.TICK, 1000);
    this.transitionTo(this.estado_config);
  }

  get currentState() {
    return this.state;
  }

  estado_config = (ev) => {
    if (ev === ENTRY) {
      this.configValue = this.defaultValue;
    } else if (ev === EVENTS.DEC) {
      if (this.configValue > this.minValue) this.configValue--;
    } else if (ev === EVENTS.INC) {
      if (this.configValue < this.maxValue) this.configValue++;
    } else if (ev === EVENTS.START) {
      this.totalSeconds = this.configValue;
      this.remainingSeconds = this.totalSeconds;
      this.transitionTo(this.estado_armed);
    }
  };
  estado_armed = (ev) => {
    if (ev === ENTRY) {
      this.myTimer.start();
    } else if (ev === EVENTS.TICK) {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        if (this.remainingSeconds === 0) {
          this.transitionTo(this.estado_timeout);
        } else {
          this.myTimer.start();
        }
      }
    } else if (ev === EXIT) {
      this.myTimer.stop();
    } else if (ev === EVENTS.START) {
      // O el evento que decidas para pausar
      this.transitionTo(this.estado_paused);
    }
  };

  estado_timeout = (ev) => {
    if (ev === ENTRY) {
      console.log("¡TIEMPO!");
    } else if (ev === EVENTS.DEC) {
      this.transitionTo(this.estado_config);
    }
  };

  //PAUSAR EL CONTADOR EN EL LA POSISCIÓN EN LA QUE SE ENCUENTA CON EL EVENTO "A" Y REANUDARLO CON EL MISMO EVENTO, ES DECIR, QUE SIRVA COMO UN BOTÓN DE PAUSA/REANUDACIÓN.
  estado_paused = (ev) => {
    if (ev === ENTRY) {
      this.myTimer.stop();
    }

    if (ev === EVENTS.START) {
      this.transitionTo(this.estado_armed);
    }

    if (ev === EVENTS.DEC || ev === EVENTS.INC) {
      this.stopSequence.push(ev);

      if (this.stopSequence.length === 3) {
        if (this.stopSequence.join() === this.password.join()) {
          this.stopSequence = [];
          this.transitionTo(this.estado_config);
        } else {
          this.stopSequence = [];
        }
      }
    }
  };
}

let temporizador;
const renderer = new Map();

// Configura el canvas y el temporizador, y define las funciones de dibujo para cada estado del FSM.
function setup() {
  createCanvas(windowWidth, windowHeight);
  temporizador = new Temporizador(TIMER_LIMITS.min, TIMER_LIMITS.max, TIMER_LIMITS.defaultValue);
  textAlign(CENTER, CENTER);
  port = createSerial();

  renderer.set(temporizador.estado_config, () => drawConfig(temporizador.configValue));
  renderer.set(temporizador.estado_armed, () => drawArmed(temporizador.remainingSeconds, temporizador.totalSeconds));
  renderer.set(temporizador.estado_timeout, () => drawTimeout());

  // Agrega un botón para conectar al puerto serial y asigna la función btnConnect al evento mousePressed.
  connectBtn = createButton("Connect");
  connectBtn.position(width / 2 - 50, height - 100);
  connectBtn.mousePressed(connectBtnClick);
}

function draw() {
  juan();
  temporizador.update();
  renderer.get(temporizador.currentState)?.();
}

function juan() {
  if (port.availableBytes() > 0) {
    let dataRx = port.read(1);
    if (dataRx == "A") {
      temporizador.postEvent("A");
    } else if (dataRx == "B") {
      temporizador.postEvent("B");
    } else {
      temporizador.postEvent("S");
    }
  }

  if (!port.opened()) {
    connectBtn.html("Connect to micro:bit");
  } else {
    connectBtn.html("Disconnect");
  }
}

// Dibuja el estado de configuración mostrando el valor actual y las instrucciones para cambiarlo o iniciar el temporizador.
function drawConfig(val) {
  background(20, 40, 80);
  fill(255);
  textSize(120);
  text(val, width / 2, height / 2);
  textSize(18);
  fill(200);
  text("A(-) B(+) S(start)", width / 2, height / 2 + 100);
}

// Dibuja el estado armado con un círculo que se llena proporcionalmente al tiempo restante y el número de segundos restantes en el centro.
function drawArmed(val, total) {
  background(20, 40, 20);
  let pulse = sin(frameCount * 0.1) * 10;

  noFill();
  strokeWeight(20);
  stroke(255, 100, 0, 50);
  ellipse(width / 2, height / 2, 250);

  stroke(255, 150, 0);
  let angle = map(val, 0, total, 0, TWO_PI);
  arc(width / 2, height / 2, 250, 250, -HALF_PI, angle - HALF_PI);

  fill(255);
  noStroke();
  textSize(100 + pulse);
  text(val, width / 2, height / 2);
}

// Dibuja el estado de timeout con un fondo parpadeante y el texto "¡TIEMPO!" en el centro.
function drawTimeout() {
  let bg = frameCount % 20 < 10 ? color(150, 0, 0) : color(255, 0, 0);
  background(bg);
  fill(255);
  textSize(100);
  text("¡TIEMPO!", width / 2, height / 2);
}

function keyPressed() {
  if (key === "a" || key === "A") temporizador.postEvent("A");
  if (key === "b" || key === "B") temporizador.postEvent("B");
  if (key === "s" || key === "S") temporizador.postEvent("S");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open("MicroPython", 115200);
  } else {
    port.close();
  }
}
````
- Código en el micro bit
````.py
from microbit import *
import radio


uart.init(baudrate=115200)
radio.config(group=250)
radio.on()

while True:
    if button_a.was_pressed():
        uart.write('A')
        sleep(500)
    if button_b.was_pressed():
        uart.write('B')
        sleep(500)
    if accelerometer.was_gesture('shake'):
        uart.write('S')
        sleep(500)

````

## Bitácora de reflexión

- Probamos realizando puenas para ver si funcionaba correctamente, primero, pasamos textos y luego sonidos, en donde yo como computador local le daba instrucciones y ella (Miranda) ejecutaba la lógica necesaria.

- Código en el microbit
  ````.py
from microbit import *
import radio


uart.init(baudrate=115200)
radio.config(group=250)
radio.on()

while True:
    if button_a.was_pressed():
        uart.write('A')
        radio.send('A')
        sleep(500)
    if button_b.was_pressed():
        uart.write('B')
        radio.send('B')
        sleep(500)
    if accelerometer.was_gesture('shake'):
        uart.write('S')
        radio.send('S')
        sleep(500)

  ````


