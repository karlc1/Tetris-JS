

function get(id) {
  return document.getElementById(id);
}

var KEY = { ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
var DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX: 3 };
var COLOR = { RED: 1, GREEN: 2, BLUE: 3, ORANGE: 4, YELLOW: 5, PURPLE: 6, LIGHTBLUE: 7};

var canvas = get('game_canvas');
var context = canvas.getContext('2d');

var block_canvas = get('block_canvas');
var block_context = block_canvas.getContext('2d');

var full_width = 300;
var full_height = 600;

var block_canvas_width = full_width/2;
var block_canvas_height = full_height/4;

var playing = true;
var actions = [];

canvas.width = full_width;
canvas.height = full_height;
block_canvas.width = block_canvas_width;
block_canvas.height = block_canvas_height;

var box_size = full_width / 10;

var red = '#e32813';
var green = '#25e313';
var blue = '#136be3';
var orange = '#e37c13';
var yellow = '#e3da13';
var purple = '#a213e3';
var lightblue = '#39dfd2';

var filled = true;


var stop = false;
var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;


var currentPosX = 0;
var currentPosY = 0;

var currentBlock = null;
var nextBlock = null;
var intervalID = null;
var gameState = null;


function startGame() {
  intervalID = window.setInterval(drop, 200);
  gameState = initGameState(20, 10);
  playing = true;
  startAnimating(20);
}

function stopGame() {
  console.log("STOP GAME");
  clearInterval(intervalID);
  playing = false;
}

function gameFinished() {

  for (i = 0; i < 3; i++){
    currY = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];
    console.log("CURR Y: " + currY);

    if (currY <= 0){
      return true;
    }
  }

  return false;
}

function getAllBoxesForBlock(){

  var all = new Array(4);



  for (rotation = 0; i < 4; i++){

    all[rotation] = new Array(4);

    for (i = 0; i < 4; i++){


      currX = currentBlock.centerX + currentBlock.xRotation[rotation][i];
      currY = currentBlock.centerY + currentBlock.yRotation[rotation][i];

      all[rotation][i] = [currX, currY];

    }
  }

}


// initialize the timer variables and start the animation

function startAnimating(fps) {

  spawnBlock();


  fpsInterval = 1000 / fps;
  fpsInterval = 1000 / fps;

  then = Date.now();
  startTime = then;
  animate();

}

function animate() {

  // request another frame

  requestAnimationFrame(animate);

  // calc elapsed time since last loop

  now = Date.now();
  elapsed = now - then;

  handleActions();
  // if enough time has elapsed, draw the next frame
  // horizontal animations here, vertical below if statmement
  if (elapsed > fpsInterval) {

    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now - (elapsed % fpsInterval);


    if (playing){

      context.fillStyle="#ADD8E6";
      context.fillRect(0,0,full_width, full_height);
      context.strokeRect(0,0,full_width, full_height);

      block_context.fillStyle="#ADD8E6";
      block_context.fillRect(0,0,block_canvas_width, block_canvas_height);
      block_context.strokeRect(0,0,block_canvas_width, block_canvas_height);

      drawNextBlock(nextBlock);
      drawFinishedBlocks();
      drawBlock(currentBlock);



    }else{

      context.fillStyle="#FF8B8B";
      context.fillRect(0,0,full_width, full_height);
      context.strokeRect(0,0,full_width, full_height);

    }
  }
}


function handleActions(){
  while (actions.length > 0) {
    var action = actions.shift();
      switch(action){
      case DIR.LEFT:
      moveLeft();
      break;
      case DIR.RIGHT:
      moveRight();
      break;
      case DIR.UP:
      rotate();
      break;
      case DIR.DOWN:
      drop();
      break;
    }
  }
}

function spawnBlock(){
  checkForCompleteRows();

  if (currentBlock != null && gameFinished()){
    stopGame();
  }


  if (currentBlock == null){
    currentBlock = getNextBlock();
  }else{
    currentBlock = nextBlock;
  }

  nextBlock = getNextBlock();


  currentBlock.centerX = 5;
  currentBlock.centerY = -3;
  drop();
}

function getNextBlock(){
  nextBlockID = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
  return getBlock(nextBlockID);
}

function checkForCompleteRows(){

  finishedRows = [];

  for(i=0; i<gameState.length; i++) {
        rowComplete = true;
        for(j=0; j<gameState[i].length; j++) {

          boxState = gameState[i][j];

          if (boxState == 0){
            rowComplete = false;
          }
      }
      if (rowComplete){
        finishedRows.push(i);
      }
  }

  for (finished = 0; finished < finishedRows.length; finished++){
    row = finishedRows[finished];
    for (i = row; i > 0; i--){
      for(j=0; j<gameState[i].length; j++) {
        gameState[i][j] = gameState[i-1][j];
      }
    }
  }
}

function moveLeft(){
    possibleMove = true;


    if (gameState[currentBlock.centerY][currentBlock.centerX-1] != 0){
      possibleMove = false;
    }

    for (i = 0; i < 3; i++){

      currX = currentBlock.centerX + currentBlock.xRotation[currentBlock.currentRotation][i];
      currY = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];

      if (currX <= 0){
        possibleMove = false;
      }
      if (gameState[currY][currX-1] != 0){

        possibleMove = false;
      }
    }
    if (possibleMove){
      currentBlock.centerX -=1;
    }
}



//TODO: center-boxen saknar kollision när den flyttas till höger
// Förmodligen fixat, validera
function moveRight(){
  possibleMove = true;


  if (gameState[currentBlock.centerY][currentBlock.centerX+1] != 0){
    possibleMove = false;
  }

  for (i = 0; i < 3; i++){
    currX = currentBlock.centerX + currentBlock.xRotation[currentBlock.currentRotation][i];
    currY = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];

    if (currX >= 9){
      possibleMove = false;
    }

    if (gameState[currY][currX+1] != 0){
      possibleMove = false;
    }
  }
  if (possibleMove){
    currentBlock.centerX +=1;
  }
}

function rotate(){

  possibleMove = true;
  for (i = 0; i < 3; i++){

    nextX = currentBlock.centerX + currentBlock.xRotation[getNextRotation(currentBlock)][i];
    nextY = currentBlock.centerY + currentBlock.yRotation[getNextRotation(currentBlock)][i];


    if (nextX > 9){
      possibleMove = false;
    }

    else if (nextY < 0){
      possibleMove = false;
    }

    else if (gameState[nextY][nextX] != 0){
      possibleMove = false;
    }




  }
  if (possibleMove){
    rotateBlock(currentBlock);
  }
}

function drop(){

    placeBlock = false;
    newY = currentBlock.centerY + 1;

    blockFinished = false;

    max = 0;

    for (i = 0; i < 3; i++){

      posY = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];
      posX = currentBlock.centerX + currentBlock.xRotation[currentBlock.currentRotation][i];


      if (posY >= 0){
        if(posY > max){
          max = posY;
        }
        if (posY >= 19){
          blockFinished = true;
        }

        if (posY < 19 && gameState[posY+1][posX] != 0){
          blockFinished = true;
        }



        if (currentBlock.centerY > 0 && currentBlock.centerY < 19 && gameState[currentBlock.centerY+1][currentBlock.centerX] != 0){
          blockFinished = true;
        }
      }
    }

    if(blockFinished){

    //  clearInterval(intervalID);

      gameState[currentBlock.centerY][currentBlock.centerX] = currentBlock.colorCode;

      for (i = 0; i < 3; i++){
        x = currentBlock.centerX + currentBlock.xRotation[currentBlock.currentRotation][i];
        y = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];
        gameState[y][x] = currentBlock.colorCode;
      }

      spawnBlock();

      //currentBlock = new T_BLOCK();
    }


    currentBlock.centerY = newY;
}

function isColliding(){

  colliding = false;
  for (i = 0; i < 3; i++){
    x = currentBlock.centerX + currentBlock.xRotation[currentBlock.currentRotation][i];
    y = currentBlock.centerY + currentBlock.yRotation[currentBlock.currentRotation][i];

    if (gameState[x][y] != 0){
      return true;
    }
  }

  return false;
}

function drawBox(x, y, color){

//   context.rect(x*box_size, y*box_size ,box_size, box_size);
// context.fillStyle = color;
// context.shadowColor = 'black';
// context.shadowBlur = 25;
// context.shadowOffsetX = 10;
// context.shadowOffsetY = 10;
// context.fill();

  context.fillStyle= color;
  context.shadowColor = 'white';
  context.shadowBlur = 1;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.fillRect(x*box_size, y*box_size ,box_size, box_size);
  lineWidth = 2;
  context.lineWidth=lineWidth;
  context.strokeRect(x*box_size, y*box_size, box_size, box_size)
}


function drawNextBox(x, y, color){

//   context.rect(x*box_size, y*box_size ,box_size, box_size);
// context.fillStyle = color;
// context.shadowColor = 'black';
// context.shadowBlur = 25;
// context.shadowOffsetX = 10;
// context.shadowOffsetY = 10;
// context.fill();

  block_context.fillStyle= color;
  block_context.shadowColor = 'white';
  block_context.shadowBlur = 1;
  block_context.shadowOffsetX = 0;
  block_context.shadowOffsetY = 0;
  block_context.fillRect(x*box_size, y*box_size ,box_size, box_size);
  lineWidth = 2;
  block_context.lineWidth=lineWidth;
  block_context.strokeRect(x*box_size, y*box_size, box_size, box_size)
}

function drawBlock(block){

  var rotation = block.currentRotation;
  var center_x = block.centerX;
  var center_y = block.centerY;
  var color = getColor(block.colorCode);

  drawBox(center_x, center_y, color);

  for (i = 0 ; i < 3; i++){
    var offset_x = block.xRotation[rotation][i];
    var offset_y = block.yRotation[rotation][i];

    drawBox(center_x + offset_x, center_y + offset_y, color);
  }
}

function drawNextBlock(nextBlock){

  centerX = 2;
  centerY = 2;



  drawNextBox(centerX, centerY, getColor(nextBlock.colorCode));

  for (i = 0 ; i < 3; i++){
    var offset_x = nextBlock.xRotation[0][i];
    var offset_y = nextBlock.yRotation[0][i];

    drawNextBox(centerX + offset_x, centerY + offset_y, getColor(nextBlock.colorCode));
  }
}


function drawFinishedBlocks(){

  // fel på loopen? detta är java-stil
  for(i=0; i<gameState.length; i++) {
        for(j=0; j<gameState[i].length; j++) {

          boxState = gameState[i][j];

          color = getColor(boxState);

          //drawBox(j, i, color);

          switch(boxState){
            case(COLOR.RED):
            drawBox(j, i, red);
            break;
            case(COLOR.ORANGE):
            drawBox(j, i, orange);
            break;
            case(COLOR.BLUE):
            drawBox(j, i, blue);
            break;
            case(COLOR.YELLOW):
            drawBox(j, i, yellow);
            break;
            case(COLOR.GREEN):
            drawBox(j, i, green);
            break;
            case(COLOR.PURPLE):
            drawBox(j, i, purple);
            break;
            case(COLOR.LIGHTBLUE):
            drawBox(j, i, lightblue);
            break;
          }
      }
  }


}



document.addEventListener('keydown', keydown, false);

function keydown(ev) {
  var handled = false;
  if (playing) {


    switch(ev.keyCode) {
      case KEY.LEFT:   actions.push(DIR.LEFT);  handled = true; break;
      case KEY.RIGHT:  actions.push(DIR.RIGHT); handled = true; break;
      case KEY.UP:     actions.push(DIR.UP);    handled = true; break;
      case KEY.DOWN:   actions.push(DIR.DOWN);  handled = true; break;
      case KEY.ESC:    lose();                  handled = true; break;
    }
  }
  else if (ev.keyCode == KEY.SPACE) {
    play();
    handled = true;
  }
  if (handled)
  ev.preventDefault(); // prevent arrow keys from scrolling the page (supported in IE9+ and all other browsers)
}


function getNextRotation(block){
  var nextMove = block.currentRotation;
  nextMove++;
  if (nextMove > 3){
    nextMove = 0;
  }
  return nextMove;
}

function rotateBlock(block){
  var next = getNextRotation(block);
  block.currentRotation = next;
}

function T_BLOCK(){
  this.type = 'T';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = red;
  this.colorCode = COLOR.YELLOW;
  this.currentRotation = 0;
  this.xRotation = [[-1, 0, 1],   [-1, 0, 0],   [-1, 0, 1],   [0, 1, 0]];
  this.yRotation = [[0, 1, 0],    [0, -1, 1],    [0, -1, 0],   [-1, 0, 1]];
}


function I_BLOCK(){
  this.type = 'I';
  this.centerX = 5;
  this.centerY = 5;
//this.color = orange;
  this.colorCode = COLOR.ORANGE;
  this.currentRotation = 0;
  this.xRotation = [[0, 0, 0],     [1, -1, -2],   [0, 0, 0],     [1, -1, -2]];
  this.yRotation = [[-1, 1, 2],    [0, 0, 0],    [-1, 1, 2],    [0, 0, 0]];
}

function Z_BLOCK(){
  this.type = 'Z';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = blue;
  this.colorCode = COLOR.BLUE;
  this.currentRotation = 0;
  this.xRotation = [[-1, 0, 1],   [0, -1, -1],   [-1, 0, 1],   [0, -1, -1]];
  this.yRotation = [[0, 1, 1],    [-1, 0, 1],    [0, 1, 1],    [-1, 0, 1]];
}

function S_BLOCK(){
  this.type = 'S';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = blue;
  this.colorCode = COLOR.GREEN;
  this.currentRotation = 0;
  this.xRotation = [[-1, 0, 1],   [0, 1, 1],   [-1, 0, 1],   [0, 1, 1]];
  this.yRotation = [[1, 1, 0],    [-1, 0, 1],  [1, 1, 0],    [-1, 0, 1]];
}

function O_BLOCK(){
  this.type = 'O';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = blue;
  this.colorCode = COLOR.RED;
  this.currentRotation = 0;
  this.xRotation = [[1, 0, 1],    [1, 0, 1],    [1, 0, 1],    [1, 0, 1]];
  this.yRotation = [[0, 1, 1],    [0, 1, 1],    [0, 1, 1],    [0, 1, 1]];
}


function J_BLOCK(){
  this.type = 'J';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = blue;
  this.colorCode = COLOR.PURPLE;
  this.currentRotation = 0;
  this.xRotation = [[0, 0, -1],    [-1, -1, 1],     [0, 1, 0],      [-1, 1, 1]];
  this.yRotation = [[-1, 1, 1],    [-1, 0, 0],      [-1, -1, 1],    [0, 0, 1]];
}

function L_BLOCK(){
  this.type = 'L';
  this.centerX = 5;
  this.centerY = 5;
  //this.color = blue;
  this.colorCode = COLOR.LIGHTBLUE;
  this.currentRotation = 0;
  this.xRotation = [[0, 0, 1],      [-1, -1, 1],    [0, -1, 0],      [-1, 1, 1]];
  this.yRotation = [[-1, 1, 1],     [1, 0, 0],      [-1, -1, 1],      [0, 0, -1]];
}




function initGameState(rows, cols) {
  var array = [], row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

function initGraphics(rows, cols) {
  var array = [], row = [];
  while (cols--) row.push('');
  while (rows--) array.push(row.slice());
  return array;
}

function getColor(colorCode){
  switch(colorCode){
    case(COLOR.RED):
    return red;
    case(COLOR.ORANGE):
    return orange;
    case(COLOR.BLUE):
    return blue;
    case(COLOR.YELLOW):
    return yellow;
    case(COLOR.GREEN):
    return green;
    case(COLOR.PURPLE):
    return purple;
    case(COLOR.LIGHTBLUE):
    return lightblue;
  }
}

function getBlock(number){

  switch (number) {
    case 0:
    return new T_BLOCK();
    case 1:
    return new I_BLOCK();
    case 2:
    return new J_BLOCK();
    case 3:
    return new L_BLOCK();
    case 4:
    return new O_BLOCK();
    case 5:
    return new S_BLOCK();
    case 6:
    return new Z_BLOCK();

  }



}



var t = new T_BLOCK();

startGame();
