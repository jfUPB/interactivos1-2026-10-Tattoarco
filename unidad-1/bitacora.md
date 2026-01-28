# Unidad 1

## Bitácora de proceso de aprendizaje

<h3>Actividad 01</h3>

<ul>
  <li>¿Qué es un sistema físico interactivo?
    <p>Es la forma en como un conjunto de elementos tanto dísicos como digitales se complementan para crear espacios en los cuales se pueda interactuar con estos y respondan en tiempo real.</p>
  </li>
  
  <li>¿Cómo podrías aplicar lo que has visto en tu perfil profesional?
  <p>Desde la creación e implementación de esperiencias basadas en narrativas ya construidas (videojuegos, animaciones, etc.) hasta la planificación de estructuras físicas o la representación de elementos que no se encuentran en el espacio. </p>
  </li>
</ul>


<h3>Actividad 02</h3>
<ul>
  <li>¿Qué es el diseño/arte generativo?
  <p>Trata de la creación de figuras u obras de arte por medio de algoritmos o procesos automatizados para representarlas, ya sea que estas esten cambiando constantemente o creando patrones nuevos a partir de la interación humana.</p>
  </li>
  <li>¿Cómo podrías aplicar lo que has visto en tu perfil profesional?
  <p>Este tipo de arte se peuede combinar con varios elementos, como lo son los sistemas físicos interactivos, si bien este trata del arte y la generacion de este desde códigos o datos su combianación con entornos creados para la interación entre lo digital y lo humano permite que se pueda utilizar ampliamente en múltiples escenarios como un museo, una casa cultural, una esposición de arte, etc.</p>
  </li>
</ul>


<img align='rigth' src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnlib2xwNHdyZ2w5OWdtNmpndWtwOHNrdDdqZTVjNzk5bDczYTlkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26gseo7hVYmbRloAw/giphy.gif" width="280" height="280"  frameBorder="0" >

<h3>Actividad 04</h3>
<ul>
  <li>
    ¿Por qué no funcionaba el programa con was_pressed() y por qué funciona con is_pressed()?
    <p>El programa no funcionaba correctamente cuando se utilizaba was_pressed() debido a la forma en que este método detecta las pulsaciones del botón en el micro:bit. La función was_pressed() solo devuelve True una única vez por cada pulsación, es decir, detecta el evento únicamente en el momento exacto en que el botón pasa de no estar presionado a estarlo. Después de esa lectura, el estado se reinicia automáticamente y vuelve a False, aunque el botón continúe presionado físicamente.

</p>
  </li>
</ul>

## Bitácora de aplicación 

<h3>Actividad 05</h3>

```js
let port;
let connectBtn;
let moveX;

function setup() {
  createCanvas(400, 400);
  background(220);
  port = createSerial();
  connectBtn = createButton("Connect to micro:bit");
  connectBtn.position(80, 360);
  connectBtn.mousePressed(connectBtnClick);
  fill("white");
  moveX = width / 2
  ellipse(width / 2, height / 2, 100, 100);
}

function draw() {
  if (port.availableBytes() > 0) {
    let dataRx = port.read(1);
    if (dataRx == "A") {
     moveX = moveX + 6
    } else if (dataRx == "B") {
      moveX = moveX - 
    } 
    background(220);
    ellipse(moveX,  height / 2, 100, 100);
  }

  if (!port.opened()) {
    connectBtn.html("Connect to micro:bit");
  } else {
    connectBtn.html("Disconnect");
  }
}
function connectBtnClick() {
  if (!port.opened()) {
    port.open("MicroPython", 115200);
  } else {
    port.close();
  }
}
```
<p>
El código inicia declarando tres variables globales. La variable port se encarga de gestionar la comunicación serial entre el programa y el micro:bit. La variable connectBtn se utiliza para crear un botón en pantalla que permite conectar o desconectar el micro:bit. Finalmente, la variable moveX controla la posición horizontal del círculo sobre el eje X.

En la función setup(), que se ejecuta una sola vez al iniciar el programa, se crea un canvas de 400 por 400 píxeles y se establece un color de fondo. Luego se inicializa el puerto serial utilizando createSerial(). A continuación, se crea el botón de conexión con el texto “Connect to micro:bit”, se ubica dentro del canvas y se le asigna la función connectBtnClick(), la cual se ejecuta cuando el botón es presionado con el mouse. Posteriormente, se define el color del círculo, se asigna a la variable moveX una posición inicial en el centro del canvas y se dibuja el círculo por primera vez con una posición fija en el eje Y y un tamaño determinado.

La función draw() se ejecuta de forma continua y es la encargada de actualizar la posición del círculo. En esta función, primero se verifica si existen datos disponibles en el puerto serial. Si hay información, se lee un carácter enviado por el micro:bit. Cuando el programa recibe la letra “A”, aumenta el valor de moveX, lo que provoca que el círculo se desplace hacia la derecha. Cuando recibe la letra “B”, disminuye el valor de moveX, permitiendo que el círculo se mueva hacia la izquierda. Después de actualizar la posición, el fondo se vuelve a dibujar y el círculo se muestra en su nueva ubicación.

Dentro de la misma función draw(), el programa también comprueba si el puerto serial se encuentra abierto. Si no hay conexión, el texto del botón indica “Connect to micro:bit”. Si el micro:bit está conectado correctamente, el texto del botón cambia a “Disconnect”, informando al usuario del estado actual de la conexión.

La función connectBtnClick() controla la conexión con el micro:bit. Si el puerto no está abierto, el programa establece la comunicación utilizando el nombre “MicroPython” y una velocidad de transmisión de 115200 baudios. Si el puerto ya se encuentra abierto, la función se encarga de cerrarlo. 

</p>


## Bitácora de reflexión

<h3>Actividad 6</h3>
<ul>
  <li>Explicación</li>
  <p>
Utilizamos dos editores de texto, uno para progreamar el microbit y otro para generar la lógica de programacion. En el programa didirigido al microbit se inicia reconociendo el purto de cnocciíon entre el microbit y el computador, para luego realizar un ciclo, el cual desde un principio esta inicializado en true, lo que hace que este se ejecute desde que se conecte el microbit. Dentro del ciclo hay un if, en este se pregunta si el btn ´A´ esta siendo presionado, si esto es verdad se muestra la letra 'A', de lo contrario se muestra la letra 'N', esta acción se ejecuta indeterminadamente cada segundo.

Ya en el programa p5.js inicia con tres variables globales 'port' para declarar el puerto, 'connectBtn' para declarar el btn con el que se va a conectar al microbit y 'connectionInitialized' iniciada en false. Luego la función setup() es utilizada para crear el canvas, conectar con el puerto, crear el btn y posicionarlo, para después declarar que si el btn es presionado ejecute la función 'connectBtnClick()', esta función esta siendo utilizada con un if, el cual inicia buscando si el puerto declarado esta abierto, si no lo esta ejecuta la acción de abrirlo y conectar el puertom, pero si no es así este lo cierra. 

A continuación de la función setup() esta la función draw(), en esta esta la lógica necesaria para hacer funcionar el microbit, declarando un canva y dandole el color necesario, para luego con un if comprobar que el puerto esta abierto, luego, en otro if, pregunta que si el puerto esta mandando acciones mayores que 0 asigne el valor 1 en dataRx (variable declarada previamente). Si esto se cumple y el btn esta siendo presionado rellene el cuadro de color rojo de lo contrario que sea verde. 
   
  </p>
</ul>







