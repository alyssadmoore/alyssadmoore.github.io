var runner;
var score;
var pop;
var obstacles = [];

// As usual, small "main" method sets up objects of runner and starts game
function startGame() {
  runner = new object(32, 32, "running-person.png", 20, 150, "image")
  score = new object("30px", "Arial", "black", 320, 30, "text");
  pop = new pop("pop.mp3");
  gameArea.start();
}

// Make a "pop" sound when the runner hits an obstacle
function pop(src) {
    this.pop = document.createElement("audio");
    this.pop.src = src;
    this.pop.setAttribute("preload", "auto");
    this.pop.setAttribute("controls", "none");
    this.pop.style.display = "none";
    document.body.appendChild(this.pop);
    this.play = function(){
        this.pop.play();
    }
}

/* Game area class contains canvas element, along with
   start, clear, and stop functions to manipulate canvas */
var gameArea = {
  canvas : document.createElement("canvas"),

  /* Start method creates canvas, sets it before all other elements on page,
     sets interval at which to update the game area (20 times a second)
     Clear method clears the screen of all objects
     Stop function pauses the game (in the event of a crash) */
  start : function() {
    this.canvas.width = 500;
    this.canvas.height = 250;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
    this.frameNum = 0;
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  }
}

/* Returns true when the current frame number cooresponds with the
   given interval (n) so we can keep adding obstacles */
function everyInterval(n) {
    if ((gameArea.frameNum / n) % 1 == 0) {
      return true;
  } else {
    return false;
  }
}

// Represents some object in the game area, ie the runner and obstacles
function object(width, height, color, x, y, type) {
  this.type = type;
  // Runner: only object of "image" type
  if (type == "image") {
    this.image = new Image();
    this.image.src = color;
  }
  // Size of object (runner, powerup, obstacle, etc.)
  this.width = width;
  this.height = height;
  // Placement of object
  this.x = x;
  this.y = y;
  // Speed at which the object is moving
  this.speedX = 0;
  this.speedY = 0;
  // Gravity placed upon the object
  this.gravity = 0.05;
  // Change in gravity (aka velocity)
  this.gravitySpeed = 0;

  // Redraws the runner and obstacles
  this.update = function() {
      context = gameArea.context;
      if (type == "image") {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
      } else if (type == "text") {
        context.font = this.width + " " + this.height;
        context.fillStyle = color;
        context.fillText(this.text, this.x, this.y);
      } else {
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
      }
  }

  /* Decides the new position of the runner and obstacles; also checks
     whether or not runner has gone off the game area above or below */
  this.newPosition = function() {
    this.gravitySpeed += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY + this.gravitySpeed;
    this.hitVerticalBound();
  }

  // Stops the runner when they hit the edge of the canvas
  this.hitVerticalBound = function() {
    var floor = gameArea.canvas.height - this.height;
    var ceiling = 0;
    // If the runner hits the floor, change the icon back to a running person
    if (this.y > floor) {
      runner.image.src = "running-person.png";
      this.y = floor;
      this.gravitySpeed = 0;
    }
    // As long as the runner stays in the air, don't change the icon
    if (this.y < ceiling) {
        this.y = ceiling;
        this.gravitySpeed = 0;
    }
  }

  /* Defines when the runner crashes into an obstacle
     We DON'T crash if the runner is to the left, right, above, or below
     the obstacle- otherwise, runner must have hit an edge of the obstacle */
  this.crashWith = function(object2) {
    var left1 = this.x;
    var right1 = this.x + (this.width);
    var top1 = this.y;
    var bottom1 = this.y + (this.height);
    var left2 = object2.x;
    var right2 = object2.x + (object2.width);
    var top2 = object2.y;
    var bottom2 = object2.y + (object2.height);
    var crash = true;
    if ((left1 > right2) || (right1 < left2) ||
        (top1 > bottom2) || (bottom1 < top2) ) {
       crash = false;
    }
    return crash;
  }
}

// Defines what happens each time the game area is updated (20 times/sec)
function updateGameArea() {
  var x;
  var y;

  // First, if there is a crash, pause game area
  for (a = 0; a < obstacles.length; a += 1){
    if (runner.crashWith(obstacles[a])) {
      pop.play();
      gameArea.stop();
      return;
    }
  }

  // If no crash, start redrawing game area by clearing screen & adding 1 frame
  gameArea.clear();
  gameArea.frameNum += 1;

  /* At the beginning of the game or every 150 frames, add 2 new obstacles:
     one coming from below, and one from above (note bottom obstacle may not
     appear if the top obstacle is low enough) */
  if (gameArea.frameNum == 1 || everyInterval(150)) {
    x = gameArea.canvas.width;
    minHeight = 30;
    maxHeight = 200;
    minGap = 75;
    maxGap = 200;
    height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap)
    obstacles.push(new object(10, height, "red", x, 0));
    obstacles.push(new object(10, (x - height - gap), "red", x, (height + gap)));
  }

  // Move the obstacles across the screen, from right to left
  for (b = 0; b < obstacles.length; b += 1) {
    obstacles[b].x += -1;
    obstacles[b].update();
  }

  // Finally, update score & runner's new position
  score.text="Score: " + Math.floor(gameArea.frameNum/10);
  score.update();
  runner.newPosition();
  runner.update();
}

/* When the runner jumps, their image changes to a jumping person
   and gravity is changed on mouseup and mousedown */
function jump(n) {
  runner.image.src = "jumping_person.png";
  runner.gravity = n;
}
