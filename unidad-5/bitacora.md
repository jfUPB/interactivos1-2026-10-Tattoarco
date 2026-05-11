# Unidad 5
## Bitácora de proceso de aprendizaje

## Actividad 1

- ¿Qué ventajas y desventajas ves en usar un formato binario en lugar de texto ASCII?

`Ventajas:`
1. Mayor eficiencia en el almacenamiento y transmisión de datos, ya que los datos binarios ocupan menos espacio que los datos en formato de texto.
2. Mayor velocidad de procesamiento, ya que las computadoras pueden interpretar y manipular datos binarios más rápidamente que los datos en formato de texto.

`Desventajas:`
1. Menor legibilidad para los humanos, ya que los datos binarios no son fácilmenteinterpretables sin herramientas específicas, cosa que no sucede con el código ASCII


- Si xValue=500, yValue=524, aState=True, bState=False, ¿cómo se vería el paquete en hexadecimal? (Pista: convierte cada valor según su tipo y anota los bytes en orden.) Respuesta esperada: 01 F4 02 0C 01 00.

El paquete de hexadecimales es: fd 5c 03 28 00 00

### Paso 2

- ¿Por qué el protocolo ASCII de la unidad anterior no tenía este problema de sincronización? (Pista: piensa en qué rol cumplía el carácter \n.)

El `\n` en el protocolo ASCII actuaba como un delimitador claro entre los paquetes de datos, lo que facilitaba la sincronización. 

- ¿Por qué en binario no podemos usar \n como delimitador?

En un formato binario, el byte que representa `\n` (0x0A) podría aparecer como parte de los datos legítimos, lo que podría causar confusión en la interpretación del paquete. 

### Paso 3

- ¿Cuántos bytes tiene el paquete completo con framing? - ¿Cuántos más que sin framing?

El paquete completo con framing tiene 6 bytes, mientras que sin framing tendría 4 bytes.

- ¿Qué pasa si un byte de datos tiene el valor 0xAA (170 en decimal)? ¿Podría el receptor confundirlo con un header? ¿Cómo ayuda el checksum en este caso?

Se podría confundir y tomar el valor del byte de datos como un header, lo que podría causar errores en la interpretación del paquete. El checksum ayuda a detectar este tipo de errores, ya que si el paquete no coincide con el checksum esperado, el receptor sabrá que ha habido un error en la transmisión. 
 

## Bitácora de aplicación   

## Actividad 2

Código en el microbit:editor de código de microbit

```.py
from microbit import *
import struct

uart.init(115200)

HEADER = b'\xAA'

while True:
    xValue = accelerometer.get_x()
    yValue = accelerometer.get_y()
    aState = button_a.is_pressed()
    bState = button_b.is_pressed()

    payload = struct.pack('>2h2B', xValue, yValue, int(aState), int(bState))

    checksum = sum(payload) % 256
    packet = HEADER + payload + bytes([checksum])
    uart.write(packet)
    sleep(100)
```


Para crear el adaptador binario, se puede partir del código del adaptador ASCII y modificarlo para que lea los datos en formato binario.
Inicié con la función `onData` para recibir los datos decodificados, luego implementé un buffer para acumular los bytes recibidos y un proceso de parsing que busca el header, extrae el payload, verifica el checksum y emite los datos en el mismo formato que el adaptador ASCII.

Al pricipio tueve errores conel microbit:editor ya que no se estaba enviando el paquete correctamente, luego de corregir el código del microbit, el adaptador binario comenzó a recibir los datos correctamente y a emitirlos con el mismo contrato que el adaptador ASCII.

![alt text](image-1.png)
<!-- ![alt text](image.png) -->

## Bitácora de reflexión

