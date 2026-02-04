# Unidad 2

## Bitácora de proceso de aprendizaje
### Actividad 1 
- **¿Cuáles son los estados en el programa?**
- **¿Cuáles son los eventos en el programa?**
- **¿Cuáles son las acciones en el programa?**

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



## Bitácora de reflexión

