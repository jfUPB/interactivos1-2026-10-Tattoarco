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



## Bitácora de reflexión


