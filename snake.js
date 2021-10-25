const GAME_OVER = "Game Over";
const NUM_CELLS = 20;
const CHANCE_FOOD = 0.1;
const CHANCE_FOOD_SPOIL = 0.05;
// TODO make this a function of number of moves
const CHANCE_REMOVE_POISON = 0.05;
const FOOD_COLOUR = 'green';
const SPOILED_FOOD_COLOUR = 'yellow';
const POISON_COLOUR = 'red';
const SNAKE_COLOUR = 'white';
const TICK_MILLIS = 200;
const MAX_TICKS = 1000;

var intervalId;
var tickCount = 0;
var canvas;
var w;
var h;
var ctx;
var snake = {parts: [{x: 0, y:0}], dir: {x: 1, y: 0}};
var cellWidth;
var cellHeight;
var snakeLength = 1;
var maxLength = 0;
var numMoves = 0;
var isAlive = true;
var food = [];
var spoiledFood = [];
var poison = [];

// TODO - powerup - food never spoils for x seconds
// TODO - powerup - telleport (no out of bounds) for x seconds
// TODO - powerup - cross own path for x seconds
// TODO - powerup - slow down by y% for x seconds

function start(){
  console.log("Started");
  document.addEventListener("keydown", handle_key_event);
  document.getElementById("game_over").style.visibility = "hidden";
  document.getElementById("error").innerText = "";
  canvas_setup();
  snake_setup();
  intervalId = setInterval(tick, TICK_MILLIS)
}

function canvas_setup(){
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;
  console.log(`Canvas w: ${w}, h: ${h}`);
  cellWidth = Math.floor((w - (w % 10)) / NUM_CELLS);
  cellHeight = Math.floor((h - (h % 10)) / NUM_CELLS);
}

function snake_setup(){
  snake.x = Math.floor(NUM_CELLS / 2);
  snake.y = Math.floor(NUM_CELLS / 2);
}

function tick(){
  tickCount += 1;
  if(tickCount == MAX_TICKS){
    stop();
    return;
  }
  move();
  const snakeHead = snake.parts[0];
  check_food(snakeHead);

  if(is_dead()){
    stop();
    document.getElementById("game_over").style.visibility = "visible";
    return;
  }

  maybe_food();
  maybe_spoil_food();
  maybe_poison();
  maybe_remove_poison();
  update_score();
  draw();
  //console.log("Tick");
}

function maybe_food(){
  isFoodCreated = Math.random() <= CHANCE_FOOD;
  if(isFoodCreated){
    const newX = Math.floor(Math.random() * NUM_CELLS)
    const newY = Math.floor(Math.random() * NUM_CELLS)
    maybe_add_food({x: newX, y: newY});
  }
}

function maybe_add_food(point){
  isOnSnake = is_on_snake(point);
  isOnFood = is_on_food(point);
  if(!isOnSnake && !isOnFood){
    food.push(point);
  }
}

function maybe_spoil_food(){
  if(Math.random() <= CHANCE_FOOD_SPOIL){
    const randomFoodPoint = random_element(food);
    if(randomFoodPoint !== undefined){
      remove_food(randomFoodPoint);
      spoiledFood.push(randomFoodPoint);
    }
  }
}

function maybe_poison(){
  if(Math.random() <= CHANCE_FOOD_SPOIL){
    const randomSpoiledFoodPoint = random_element(spoiledFood);
    if(randomSpoiledFoodPoint !== undefined){
      remove_spoiled_food(randomSpoiledFoodPoint);
      poison.push(randomSpoiledFoodPoint);
    }
  }
}

function maybe_remove_poison(){
  if(Math.random() <= CHANCE_REMOVE_POISON){
    const randomPoisonPoint = random_element(poison);
    if(randomPoisonPoint !== undefined){
      remove_poison(randomPoisonPoint);
    }
  }
}

function random_element(elements){
  if(elements.length > 0){
    const randomIndex = Math.floor(Math.random() * elements.length);
    return elements[randomIndex];
  }
  return undefined;
}

function move(){
  const snakeHead = snake.parts[0];
  const newX = snakeHead.x + snake.dir.x;
  const newY = snakeHead.y + snake.dir.y;
  const newSnakePart = {x: newX, y: newY};
  snake.parts.unshift(newSnakePart);
}

function check_food(point){
  hasGrown = has_grown(point);
  if(hasGrown){
    //console.log(`has grown because food on point ${point.x}, ${point.y}`);
    remove_food(point);
  }else{
    //console.log(`Popping off tail because no food on point ${point.x}, ${point.y}`);
    snake.parts.pop();
  }

  // TODO turn the snake green or red or something
  if(has_shrunk(point)){
    remove_spoiled_food(point) && snake.parts.length > 0;
    snake.parts.pop();
  }
}

function has_grown(point){
  return is_on_food(point);
}

function has_shrunk(point){
  return is_on_spoiled_food(point);
}

function is_dead(){
  const snakeHead = snake.parts[0];
  let isOutOfBounds = false;
  let isOnSelf = false;
  let isOnPoison = false;

  hasShrunkToNothing = has_shrunk_to_nothing();

  // If the snake has shrunk to nothing then there are no points left
  // to check for other conditions
  if(!hasShrunkToNothing){
    isOutOfBounds = !hasShrunkToNothing && is_outside_bounds(snakeHead);
    isOnSelf = !hasShrunkToNothing && is_snake_on_self();
    isOnPoison = !hasShrunkToNothing && is_on_poison(snakeHead);
  }

  console.log(`isOut: ${isOutOfBounds}, isOnSelf: ${isOnSelf}, isOnPoison: ${isOnPoison}`);

  if(isOutOfBounds || isOnSelf || isOnPoison || hasShrunkToNothing){
    let errorStrings = [];
    if(isOutOfBounds){
      errorStrings.push("Out of bounds.");
    }
    if(isOnSelf){
      errorStrings.push("Snake ate itself.");
    }
    if(isOnPoison){
      errorStrings.push("Snake ate poison.");
    }
    if(hasShrunkToNothing){
      errorStrings.push("Snake shriveled up and died.");
    }
    document.getElementById("error").innerText = errorStrings.join(", ");
    return true;
  }
  return false;
}

function stop(){
  console.log("Stopped tick");
  clearInterval(intervalId);
}

function is_outside_bounds({x, y}){
  return x < 0 || y < 0 || x >= NUM_CELLS || y >= NUM_CELLS;
}

function is_snake_on_self(){
  const head = snake.parts[0];
  const tail = snake.parts.slice(1);
  return is_on(head, tail);
}

function is_on_snake(point){
  return is_on(point, snake.parts);
}

function is_on_food(point){
  return is_on(point, food);
}

function is_on_spoiled_food(point){
  return is_on(point, spoiledFood);
}

function is_on_poison(point){
  return is_on(point, poison);
}

function is_on(point, elements){
  maybeElement = elements.find((elem) => point.x == elem.x && point.y == elem.y);
  return maybeElement !== undefined;
}

function has_shrunk_to_nothing(){
  //console.log(`snake.parts.length = ${snake.parts.length}`);
  return snake.parts.length < 1;
}

function update_score(){
  numMoves += 1;
  movesElem = document.getElementById("moves");
  movesElem.innerText = `Moves: ${numMoves}`;

  length = snake.parts.length;
  lengthElem = document.getElementById("length");
  lengthElem.innerText = `Length: ${length}`;
}

function draw(){
  clear();
  draw_board(NUM_CELLS);
  draw_snake();
  draw_food();
  draw_spoiled_food();
  draw_poison();
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
  snake.parts.map(part => draw_cell(part, SNAKE_COLOUR));
}

function draw_food(){
  food.map(point => draw_cell(point, FOOD_COLOUR));
}

function draw_spoiled_food(){
  spoiledFood.map(point => draw_cell(point, SPOILED_FOOD_COLOUR));
}

function draw_poison(){
  poison.map(point => draw_cell(point, POISON_COLOUR));
}

function draw_cell({x, y}, colour){
  xPixel = cellWidth * x;
  yPixel = cellHeight * y;
  ctx.fillStyle = colour;
  ctx.fillRect(xPixel, yPixel, cellWidth, cellHeight);
}

function handle_key_event(event){
  const UP = '38';
  const DOWN = '40';
  const LEFT = '37';
  const RIGHT = '39';
  event = event || window.event;

  console.log(`keyevent: ${event}`);

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

function remove_food({x: removeX, y: removeY}){
  food = food.filter(({x, y}) => x != removeX || y != removeY);
}

function remove_spoiled_food({x: removeX, y: removeY}){
  spoiledFood = spoiledFood.filter(({x, y}) => x != removeX && y != removeY);
}

function remove_poison({x: removeX, y: removeY}){
  poison = poison.filter(({x, y}) => x != removeX && y != removeY);
}
