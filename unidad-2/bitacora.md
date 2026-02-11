# Unidad 2

## Bitácora de proceso de aprendizaje
### Actividad 1 
- **¿Cuáles son los estados en el programa?**
  ```` .asm
  self.estado_actual = None
  def estado_waitInON(self, ev):
  def estado_waitInOFF(self, ev):
  ````
- **¿Cuáles son los eventos en el programa?**
  ````
  ENTRY
  EXIT
  TIMEOUT
  ````
- **¿Cuáles son las acciones en el programa?**
    1. Encender el píxel (display.set_pixel(x, y, 9)).
    2. Apagar el píxel (display.set_pixel(x, y, 0)).
    3. Iniciar el temporizador (self.myTimer.start()).

Alternar el estado del píxel (si estaba encendido, se apaga; si estaba apagado, se enciende).

### Actividad 2

``` .asm
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
    def __init__(self,_x,_y):
        self.redX = _x
        self.redY = _y
        self.event_queue = []
        self.timers = []
        
        self.myTimer = self.createTimer("Timeout",2000)
        
        self.estado_actual = None
        self.transicion_a(self.estado_waitRed)
        
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

    def estado_waitRed(self, ev):
        if ev == "ENTRY":
            display.set_pixel(self.redX, self.redY,9)
            self.myTimer.start(2000)
        if ev  == "Timeout":
            display.set_pixel(self.redX, self.redY,0)
            self.transicion_a(self.estado_waitGreen)

    def estado_waitGreen(self, ev):
        if ev == "ENTRY":
            display.set_pixel(self.redX, self.redY+2,9)
            self.myTimer.start(1000)
        if ev  == "Timeout":
            display.set_pixel(self.redX, self.redY+2,0)
            self.transicion_a(self.estado_waitYellow)
        if ev == "A":
            self.myTimer.stop()
            display.set_pixel(self.redX, self.redY+2,0)
            self.transicion_a(self.estado_waitYellow)

    def estado_waitYellow(self, ev):
        if ev == "ENTRY":
            display.set_pixel(self.redX, self.redY+1,9)
            self.myTimer.start(1000)
        if ev  == "Timeout":
            display.set_pixel(self.redX, self.redY+1,0)
            self.transicion_a(self.estado_waitRed)

semaforo1 = Semaforo(0,0)

while True:
    if button_a.was_pressed():
        semaforo1.post_event("A")
    
    semaforo1.update()
    utime.sleep_ms(20)
```
```
@startuml
title Pixel - UML State Machine

[*] --> waitRed : Semaforo() (rojo ON y crear timer)
waitRed: entry / rojo ON y timer.start(2000)
waitRed --> waitGreen: Timeout / rojo OFF
waitGreen: entry / verde ON y timer.start(2000)
waitGreen: "A" / stop timer y amarillo ON
waitGreen --> waitYellow: Timeout / verde OFF
waitYellow: entry / amarillo ON y timer.start(500)
waitYellow --> waitRed: Timeout / amarillo OFF
@enduml
```
<img width="515" height="512" alt="image" src="https://github.com/user-attachments/assets/78346fe2-5243-48da-9408-a0b1bc21d405" />

## Bitácora de aplicación 

### Actividad 4

```` .asm
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
            

    def estado_end(self, ev): 
        if ev == "ENTRY": 
            display.show(Image.SKULL) 
            music.play(music.BIRTHDAY)
        if ev == "A": self.transicion_a(self.estado_estado1)
                

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
- Diagrama UML
  
  <img width="515" height="512" alt="image" src="https://github.com/user-attachments/assets/0eb0dd98-1adf-4237-b594-d15c328d5a89" />



## Bitácora de reflexión





