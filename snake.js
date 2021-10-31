const INTERVAL_MILLIS = 300;
const CHANCE_FOOD = 0.6;
const CHANCE_FOOD_SPOIL = 0.1;
const CHANCE_REMOVE_POISON = 0.3;
const CHANCE_SPEED_POWER_UP = 0.3;
const SPEED_POWER_UP_AMT = 0.1;
const SPEED_POWER_UP_DURATION_MILLIS = 5000;
const MAX_SPEED_UP = 0.3;
const NUM_CELLS = 20;

const SNAKE_COLOUR = 'white';

const DEFAULT_SHAPE_FUN = rectangle;

const FOOD_COLOUR = 'green';
const FOOD_SHAPE_FUN = diamond;

const SPOILED_FOOD_COLOUR = 'yellow';
const SPOILED_FOOD_SHAPE_FUN = diamond;

const POISON_COLOUR = 'red';
const POISON_SHAPE_FUN = diamond;

const SPEED_POWER_UP_COLOUR = 'blue';
const SPEED_POWER_UP_SHAPE_FUN = circle;

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
var speedPowerUps = [];
var speedPowerUpsActive = [];
var intervalId;
var numMoves = 0;

function start(){
  add_restart_button_listener();
  add_arrow_key_listener();
  clear_game();
  reset_move_counter();
  canvas_setup();
  snake_setup();
  setup_game_loop(INTERVAL_MILLIS);
}

function clear_game(){
  clear_score();
  clear_game_over();
  clear_error();
  clear_cells();
  clear_active_speed_ups();
}

function setup_game_loop(Millis){
  intervalId = setInterval(game_loop, Millis);
}

function add_restart_button_listener(){
  let restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", start);
}

function add_arrow_key_listener(){
  document.addEventListener("keydown", handle_key_event);
}

function clear_score(){
  let lengthHeader = document.getElementById("length");
  lengthHeader.innerHtml = "Length: 0";

  let movesHeader = document.getElementById("moves");
  movesHeader.innerHtml = "Moves: 0";
}

function clear_game_over(){
  let gameOverHeading = document.getElementById("game_over");
  gameOverHeading.style.visibility = "hidden";
}

function clear_error(){
  let errorHeading = document.getElementById("error");
  errorHeading.style.visibility = "hidden";
}

function reset_move_counter(){
  numMoves = 0;
}

function clear_cells(){
  food = [];
  spoiledFood = [];
  poison = [];
  speedPowerUps = [];
}

function clear_active_speed_ups(){
  speedPowerUpsActive = [];
}

function canvas_setup(){
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;

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
  maybe_speed_up(snakeHead);

  if(is_dead()){
    stop();
    document.getElementById("game_over").style.visibility = "visible";
    return;
  }

  maybe_food();
  maybe_spoil_food();
  maybe_poison();
  maybe_remove_poison();
  maybe_speed_powerup();
  update_score();
  draw();
  allow_movement();
}

function maybe_food(){
  const isFoodCreated = (Math.random() <= CHANCE_FOOD);
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

function maybe_speed_powerup(){
  const isSpeedPowerUpCreated = (Math.random() <= CHANCE_SPEED_POWER_UP);
  if(isSpeedPowerUpCreated){
    const newX = Math.floor(Math.random() * NUM_CELLS)
    const newY = Math.floor(Math.random() * NUM_CELLS)
    maybe_add_speed_power_up({x: newX, y: newY});
  }
}

function maybe_add_speed_power_up(point){
  isOnSnake = is_on_snake(point);
  if(!isOnSnake){
    speedPowerUps.push(point);
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
    remove_food(snakeHeadPoint);
  }else{
    snake.parts.pop();
  }
}

function maybe_shrink(snakeHeadPoint){
  if(has_shrunk(snakeHeadPoint)){
    remove_spoiled_food(snakeHeadPoint) && snake.parts.length > 0;
    snake.parts.pop();
  }
}

function maybe_speed_up(snakeHeadPoint){
  if(is_on(snakeHeadPoint, speedPowerUps)){
    let powerUpId = new Date().getTime();
    let powerUp = {speed: SPEED_POWER_UP_AMT, id: powerUpId};
    speedPowerUpsActive.push(powerUp);
    reset_interval();
    setup_clear_speed_power_up_timer(powerUpId);
    remove_speed_up(snakeHeadPoint);
  }
}

function setup_clear_speed_power_up_timer(powerUpId){
  setTimeout(clear_speed_power_up, SPEED_POWER_UP_DURATION_MILLIS, powerUpId);
}

function clear_speed_power_up(powerUpId){
  speedPowerUpsActive = speedPowerUpsActive.filter(({id}) => id != powerUpId);
  reset_interval();
}

function reset_interval(){
  clearInterval(intervalId);
  const intervalMillis = calculate_interval_millis();
  setup_game_loop(intervalMillis);
}

function calculate_interval_millis(){
  const initialMultiplier = 1;
  let speedUpMultiplier = speedPowerUpsActive.reduce(subtract_speed_up, initialMultiplier);
  speedUpMultiplier = Math.max(MAX_SPEED_UP, speedUpMultiplier);
  const intervalMillis = INTERVAL_MILLIS * speedUpMultiplier;
  return intervalMillis;
}

function subtract_speed_up(prev, {speed}){
  return prev - speed;
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
  draw_speed_power_ups();
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
  food.map(point => draw_cell(point, FOOD_COLOUR, FOOD_SHAPE_FUN));
}

function draw_spoiled_food(){
  spoiledFood.map(point => draw_cell(point, SPOILED_FOOD_COLOUR, SPOILED_FOOD_SHAPE_FUN));
}

function draw_poison(){
  poison.map(point => draw_cell(point, POISON_COLOUR, POISON_SHAPE_FUN));
}

function draw_speed_power_ups(){
  speedPowerUps.map(point => draw_cell(point, SPEED_POWER_UP_COLOUR, SPEED_POWER_UP_SHAPE_FUN));
}

function draw_cell({x, y}, colour, shapeFun = DEFAULT_SHAPE_FUN){
  xPixel = cellWidth * x;
  yPixel = cellHeight * y;
  shapeFun(xPixel, yPixel, cellWidth, cellHeight, colour);
}

function rectangle(x, y, w, h, colour){
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function diamond(x, y, w, h, colour){
  const xLeft = x;
  const xMiddle = Math.floor(x + (w / 2));
  const xRight = x + w;
  const yTop = y;
  const yMiddle = Math.floor(y + (h / 2));
  const yBottom = y + h;

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(xLeft, yMiddle);
  ctx.lineTo(xMiddle, yTop);
  ctx.lineTo(xRight, yMiddle);
  ctx.lineTo(xMiddle, yBottom);
  ctx.lineTo(xLeft, yMiddle);
  ctx.fill();

}

function circle(x, y, w, h, colour){
  const cellCenterX = Math.floor(x + (w / 2));
  const cellCenterY = Math.floor(y + (h / 2));
  const radiusX = Math.floor(w / 2 * 0.9);
  const radiusY = Math.floor(h / 2 * 0.9);
  const startRotationRadians = 0;
  const radiansInCircle = Math.PI * 2;
  const finishRotationRadians = radiansInCircle;
  const rotation = 0;

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(cellCenterX, cellCenterY, radiusX, radiusY, rotation, startRotationRadians, finishRotationRadians);
  ctx.fill();
}

function handle_key_event(event){
  if(!is_movement_allowed()){
    return;

  }
  const UP = 38;
  const DOWN = 40;
  const LEFT = 37;
  const RIGHT = 39;
  event = event || window.event;

  const currentDirection = current_direction();

  if (event.keyCode == UP && currentDirection != 'down') {
    snake.dir = {x: 0, y: -1};
  } else if (event.keyCode == DOWN && currentDirection != 'up') {
    snake.dir = {x: 0, y: 1};
  } else if (event.keyCode == LEFT && currentDirection != 'right') {
    snake.dir = {x: -1, y: 0};
  } else if (event.keyCode == RIGHT && currentDirection != 'left') {
    snake.dir = {x: 1, y: 0};
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

function remove_speed_up(point){
  speedPowerUps = remove_point(point, speedPowerUps);
}

function remove_point({x: removeX, y: removeY}, points){
  return points.filter(({x, y}) => x != removeX || y != removeY);
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
    return is_on(head, tail);
  }
  return false;
}

function stop(){
  clearInterval(intervalId);
}

function has_shrunk_to_nothing(){
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
