const INTERVAL_MILLIS = 300;
const CHANCE_FOOD = 0.6;
const CHANCE_FOOD_SPOIL = 0.1;
const CHANCE_REMOVE_POISON = 0.3;
const NUM_CELLS = 20;
const SNAKE_COLOUR = 'white';
const FOOD_COLOUR = 'green';
const SPOILED_FOOD_COLOUR = 'yellow';
const POISON_COLOUR = 'red';

var canvas;
var ctx;
var w;
var h;
var cellWidth;
var cellHeight;
var snake = {parts: [{x: 0, y: 0}], dir: {x: 1, y: 0}};
var hasSnakeMoved = false;
var food = [];
var spoiledFood = [];
var poison = [];
var intervalId;
var numMoves = 0;

function start(){
  addRestartButtonListener();
  addArrowKeyListener();
  clearScore();
  clearGameOver();
  clearError();
  resetMoveCounter();
  resetFoodSpoiledAndPoison();
  canvas_setup();
  snake_setup();
  setup_game_loop();
}

function setup_game_loop(){
  intervalId = setInterval(game_loop, INTERVAL_MILLIS);
}

function addRestartButtonListener(){
  let restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", start);
}

function addArrowKeyListener(){
  document.addEventListener("keydown", handle_key_event);
}

function clearScore(){
  let lengthHeader = document.getElementById("length");
  lengthHeader.innerHtml = "Length: 0";

  let movesHeader = document.getElementById("moves");
  movesHeader.innerHtml = "Moves: 0";
}

function clearGameOver(){
  let gameOverHeading = document.getElementById("game_over");
  gameOverHeading.style.visibility = "hidden";
}

function clearError(){
  let errorHeading = document.getElementById("error");
  errorHeading.style.visibility = "hidden";
}

function resetMoveCounter(){
  numMoves = 0;
}

function resetFoodSpoiledAndPoison(){
  food = [];
  spoiledFood = [];
  poison = [];
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
  x = Math.floor(NUM_CELLS / 3);
  y = Math.floor(NUM_CELLS / 3);
  snake.parts = [{x: x, y: y}];
  snake.dir = {x: 1, y: 0};
}

function game_loop(){
  move();
  const snakeHead = snake.parts[0];
  grow_if_on_food(snakeHead);
  maybe_shrink(snakeHead);

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
  allow_movement();
}

function maybe_food(){
  let isFoodCreated = (Math.random() <= CHANCE_FOOD);
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
  if(!is_array_empty(elements)){
    const validRandomIndex = Math.floor((Math.random() - 0.0001) * elements.length);
    return elements[validRandomIndex];
  }
  return undefined;
}

function is_array_empty(arr){
  arr.length == 0;
}

function move(){
  const snakeHead = snake.parts[0];
  const newX = snakeHead.x + snake.dir.x;
  const newY = snakeHead.y + snake.dir.y;
  const newSnakePart = {x: newX, y: newY};
  snake.parts.unshift(newSnakePart);
}

function allow_movement(){
  hasSnakeMoved = false;
}

function is_movement_allowed(){
  return !hasSnakeMoved;
}

function grow_if_on_food(snakeHeadPoint){
  hasGrown = has_grown(snakeHeadPoint);
  if(hasGrown){
    //console.log(`has grown because food on point ${point.x}, ${point.y}`);
    remove_food(snakeHeadPoint);
  }else{
    //console.log(`Popping off tail because no food on point ${point.x}, ${point.y}`);
    snake.parts.pop();
  }
}

function maybe_shrink(snakeHeadPoint){
  if(has_shrunk(snakeHeadPoint)){
    remove_spoiled_food(snakeHeadPoint) && snake.parts.length > 0;
    snake.parts.pop();
  }
}

function has_shrunk(point){
  return is_on(point, spoiledFood);
}

function has_grown(snakeHeadPoint){
  return is_on_food(snakeHeadPoint);
}

function clear(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h); // w = canvasWidth
}

function draw(){
  clear();
  draw_board(NUM_CELLS);
  draw_snake();
  draw_food();
  draw_spoiled_food();
  draw_poison();
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
  if(!is_movement_allowed()){
    console.log(`Movement not allowed: hasSnakeMoved = ${hasSnakeMoved}`);
    return;

  }
  const UP = 38;
  const DOWN = 40;
  const LEFT = 37;
  const RIGHT = 39;
  event = event || window.event;

  const currentDirection = current_direction();
  //console.log(`keyevent: ${event}`);

  if (event.keyCode == UP && currentDirection != 'down') {
    snake.dir = {x: 0, y: -1};
  } else if (event.keyCode == DOWN && currentDirection != 'up') {
    snake.dir = {x: 0, y: 1};
  } else if (event.keyCode == LEFT && currentDirection != 'right') {
    snake.dir = {x: -1, y: 0};
  } else if (event.keyCode == RIGHT && currentDirection != 'left') {
    snake.dir = {x: 1, y: 0};
  }else{
    //console.log(`Don't recognize event ${event}`);
    //const desiredDirection = arrow_key_direction(event.keyCode);
    //console.log(`Tried to go ${desiredDirection} but already going ${currentDirection}`);
  }

  hasSnakeMoved = true;
}

function current_direction(){
  const {x, y} = snake.dir;
  if(y == -1){
    return 'up';
  }else if(y == 1){
    return 'down';
  }else if(x == 1){
    return 'right';
  }else if(x == -1){
    return 'left';
  }
}

function is_on_snake(point){
  return is_on(point, snake.parts);
}

function is_on_food(point){
  return is_on(point, food);
}

function is_on_poison(point){
  return is_on(point, poison);
}

function is_on(point, checkPoints){
  const maybePoint = checkPoints.find((checkPoint) => point.x == checkPoint.x && point.y == checkPoint.y);
  return maybePoint !== undefined;
}

function remove_food(point){
  food = remove_point(point, food);
}

function remove_spoiled_food(point){
  spoiledFood = remove_point(point, spoiledFood);
}

function remove_poison(point){
  poison = remove_point(point, poison);
}

function remove_point({x: removeX, y: removeY}, points){
  return points.filter(({x, y}) => x != removeX && y != removeY);
}

function is_dead(){
  const snakeHead = snake.parts[0];
  let isOutOfBounds = false;
  let isOnSelf = false;
  let isOnPoison = false;
  let hasShrunkToNothing = has_shrunk_to_nothing();

  hasShrunkToNothing = has_shrunk_to_nothing();

  if(!hasShrunkToNothing){
    isOutOfBounds = is_outside_bounds(snakeHead);
    isOnSelf = is_snake_on_self();
    isOnPoison = is_on_poison(snakeHead);
  }

  if(hasShrunkToNothing || isOutOfBounds || isOnSelf || isOnPoison){
    let errorStrings = [];
    if(isOutOfBounds){
      errorStrings.push("Out of bounds.");
    }
    if(isOnSelf){
      errorStrings.push("Snake ate itself.");
    }
    if(hasShrunkToNothing){
      errorStrings.push("Snake shriveled up and died.");
    }
    if(isOnPoison){
      errorStrings.push("Snake ate poison.");
    }
    document.getElementById("error").innerText = errorStrings.join(", ");
    return true;
  }
  return false;
}


function is_outside_bounds({x, y}){
  return x < 0 || y < 0 || x >= NUM_CELLS || y >= NUM_CELLS;
}

function is_snake_on_self(){
  if(snake.parts.length > 3){
    const head = snake.parts[0];
    const tail = snake.parts.slice(1);
    //tail.map(({x, y}) => console.log(`Check if ${head.x}, ${head.y} is on ${x}, ${y}`));
    return is_on(head, tail);
  }
  return false;
}

function stop(){
  console.log("Stopped game loop");
  clearInterval(intervalId);
}

function has_shrunk_to_nothing(){
  //console.log(`snake.parts.length = ${snake.parts.length}`);
  return snake.parts.length < 1;
}

function update_score(){
  numMoves += 1;
  movesHeader = document.getElementById("moves");
  movesHeader.innerText = `Moves: ${numMoves}`;

  length = snake.parts.length;
  lengthHeader = document.getElementById("length");
  lengthHeader.innerText = `Length: ${length}`;
}
