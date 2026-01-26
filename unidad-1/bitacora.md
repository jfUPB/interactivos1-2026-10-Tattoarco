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

## Bitácora de aplicación 
<h3>Actividad 04</h3>
<ul>
  <li>
    ¿Por qué no funcionaba el programa con was_pressed() y por qué funciona con is_pressed()?
    <p></p>
  </li>
</ul>

<h3>Actividad 05</h3>

```
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
El programa utiliza A y b para mover un circulo X. El código inicia declarando tres variables globales, una para el puerto, otra para el botón para conectar con el mirobit y luego la variable de movimiento. Después se crea una función para crear el canva de fondo y aplicarle color, luego se le asigna un valor a la variable port, esto para crear un serial. Utiliza la variable conectBtn para asignarle un botón con un texto y luego se le asigna una posición dentro del canvas, en la siguiente línea le dice que si este btn es presionado por el mouse llame la función connectBtnClick. Ahora se crea el círculo, se le asigana un color predeterminado, una posisción inical en x con la variable moveX, y una fija en Y, para finalmente darle un tamaño.

En la función draw, estamos buscando re dibujar el círculo en la posicióin deseada al oprimir los btn A y B, iniciamos preguntando si el puerto esta siendo activaado    

</p>


## Bitácora de reflexión



