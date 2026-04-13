# Unidad 6

## Bitácora de proceso de aprendizaje

### Actividad 1:

- ¿Cuál es la diferencia entre recibir un mensaje y ejecutarlo?

La diferencia entre recibir un mensaje y ejecutarlo radica en que recibir un mensaje es simplemente la acción de obtener o recibir información, mientras que ejecutar un mensaje implica llevar a cabo una acción o proceso basado en esa información.

- ¿Por qué un sistema audiovisual puede necesitar timestamp además de los datos del evento?

Porque el tiempo le sirve para organizar los eventos en una secuencia lógica, permitiendo sincronizar diferentes elementos audiovisuales y asegurando que se ejecuten en el orden correcto.

- ¿Qué aspectos de la arquitectura de las unidades 4 y 5 permanecen intactos aunque ahora la fuente de datos ya no sea hardware?

Los aspectos de la arquitectura que permanecen intactos son la estructura general del sistema, la forma en que se procesan los eventos y la manera en que se comunican los diferentes componentes del sistema. Aunque la fuente de datos ya no sea hardware, el sistema sigue funcionando de manera similar en términos de cómo maneja y procesa los eventos.

**Paso 1**

- Si Strudel fuera “el dispositivo” de esta unidad, ¿Cuál sería su protocolo?

El protocolo de Strudel podría ser un formato específico de mensajes que contenga información relevante sobre los eventos, como el tipo de evento, la fuente del evento, los datos asociados y un timestamp para organizar los eventos en una secuencia lógica.

- ¿Qué variables mínimas necesitarías extraer para poder construir una visualización útil?

Las variables mínimas que necesitaría extraer para construir una visualización útil podrían incluir el tipo de evento, la fuente del evento, los datos asociados y el timestamp.
 
**Paso 2**

- ¿Qué problema resuelve la cola de eventos?

```cpp
{
  address: '/dirt/play',
  args: [
    'cps',   0.5,
    'cycle', 15.25,
    'delta', 0.5,
    's',     'tr909sd',
    'bank',  'tr909'
  ],
  timestamp: 1774966984435.2805
}
```
La cola de eventos resuelve el problema de organizar y gestionar los eventos de manera eficiente, permitiendo que se procesen en el orden correcto y evitando que se pierdan o se ejecuten de manera desordenada.

- ¿Por qué esta capa no pertenece al bridge sino al lado que interpreta el evento?

Porque es responsable de gestionar y organizar los eventos antes de que sean interpretados, asegurando que se procesen de manera eficiente y en el orden correcto. El bridge simplemente transmite los eventos, mientras que la capa de interpretación se encarga de manejarlos adecuadamente.

**Paso 3**

- ¿Qué papel cumple el Adapter en U4 y U5?

En la unidad 4, el Adapter se encarga de traducir los eventos provenientes del hardware a un formato que el sistema pueda entender y procesar. En la unidad 5, el Adapter sigue cumpliendo esta función, pero ahora se adapta a eventos que no provienen directamente del hardware, sino de otras fuentes de datos.

- ¿Qué Adapter necesitas ahora para que los eventos de Strudel no entren “crudos” al sistema visual?

Necesitaría un Adapter que pueda interpretar los eventos de Strudel y traducirlos a un formato que el sistema visual pueda entender, incluyendo la extracción de las variables relevantes y la organización de los eventos en una secuencia lógica basada en los timestamps.

## Bitácora de aplicación 


### Actividad 2:






## Bitácora de reflexión