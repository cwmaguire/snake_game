
var intervalId;
var tickCount = 0;
var canvas;
var w;
var h;
var ctx;
var snake = {x: 0, y: 0, dir: {x: 1, y: 0}};
var numCells = 20;
var cellWidth;
var cellHeight;
var snakeLength = 1;

function start(){
  console.log("Started");
  document.addEventListener("keydown", handle_key_event);
  canvas_setup();
  snake_setup();
  intervalId = setInterval(tick, 800)
}

function canvas_setup(){
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;
  console.log(`Canvas w: ${w}, h: ${h}`);
  cellWidth = Math.floor((w - (w % 10)) / numCells);
  cellHeight = Math.floor((h - (h % 10)) / numCells);
}

function snake_setup(){
  snake.x = Math.floor(numCells / 2);
  snake.y = Math.floor(numCells / 2);
}

function tick(){
  tickCount += 1;
  if(tickCount == 15){
    console.log("Stopped tick");
    clearInterval(intervalId);
    return;
  }
  move();
  animate();
  console.log("Tick");
}

function move(){
  //console.log(`Snake dir: ${snake.dir.x},${snake.dir.y}`);
  // TODO keep list of snake elements
  // TODO remove tail, add head in direction
  snake.x += snake.dir.x;
  snake.y += snake.dir.y;

  // TODO end game if snake goes off edge
  // TODO end game if snake runs into itself
}

function animate(){
  clear();
  draw_board(numCells);
  draw_snake();
}

function clear(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);
}

function draw_board(numCells){
  draw_board_vertical_lines(numCells);
  draw_board_horizontal_lines(numCells);
}

function draw_board_vertical_lines(numCells){
  if(numCells == 0){
    return;
  }
  // calc & draw vertical line based on line number
  const x = numCells * cellWidth;
  const y1 = 0;
  const y2 = (h - (h % 10));
  //console.log(`Drawing vert line: cellWidth: ${cellWidth}, num cells: ${numCells}, x: ${x}, y2: ${y2}`);
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();

  draw_board_vertical_lines(numCells - 1);
}

function draw_board_horizontal_lines(numCells){
  if(numCells == 0){
    return;
  }
  // calc & draw horizontal line based on line number
  const y = numCells * cellHeight;
  const x1 = 0;
  const x2 = (w - (w % 10));
  //console.log(`H line: cellWidth: ${cellWidth}, num cells: ${numCells}, y: ${y}, x2: ${x2}`);
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  draw_board_horizontal_lines(numCells - 1);
}


function draw_snake(){
  x = cellWidth * snake.x;
  y = cellHeight * snake.y;
  console.log(`draw snake at ${x}, ${y}`);
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y, cellWidth, cellHeight);
}

function handle_key_event(event){
  const UP = '38';
  const DOWN = '40';
  const LEFT = '37';
  const RIGHT = '39';
  event = event || window.event;

  if (event.keyCode == UP) {
    snake.dir = {x: 0, y: -1};
  } else if (event.keyCode == DOWN) {
    snake.dir = {x: 0, y: 1};
  } else if (event.keyCode == LEFT) {
    snake.dir = {x: -1, y: 0};
  } else if (event.keyCode == RIGHT) {
    snake.dir = {x: 1, y: 0};
  }else{
    //console.log(`Don't recognize event ${event}`);
    "ok";
  }
}
