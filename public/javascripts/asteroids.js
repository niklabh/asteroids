//Some Modifications by @niklabh

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame;



var Asteroids = (function () {
  
  var w_width = window.innerWidth;
  var w_height = window.innerHeight;
  /*
   *  MovingObject 
   *
   *  A base class for all moving objects (asteroids, ships, etc).
   *
   *  Params:
   *    x => the x coordinate of this object in a 2D plane
   *    y => the y coordinate of this object in a 2D plane
   *    r => the radius of this object
   */  
  function MovingObject(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  MovingObject.prototype.update = function(velocity) {
    var x = (this.x + velocity.x);
    var y = (this.y + velocity.y);

    (x < 0) ? x += w_width : x %= w_width;
    (y < 0) ? y += w_height : y %= w_height;

    this.x = x;
    this.y = y;
  };

  MovingObject.prototype.draw = function(ctx) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();  
  };

  MovingObject.prototype.offScreen = function() {
    return ((this.x + this.r > w_width)  || 
            (this.y + this.r > w_height) ||
            (this.x - this.r < 0)      || 
            (this.y - this.r < 0))
  };

  MovingObject.prototype.isHit = function(asteroids) {
    for (var i = 0; i < asteroids.length; ++i) {
      var dist = Math.sqrt(Math.pow((this.x - asteroids[i].x), 2) + Math.pow((this.y - asteroids[i].y), 2));
      if (dist < (this.r + asteroids[i].r)) return true;  
    }

    return false;
  };

  /* End MovingObject */



  /*
   *  Asteroid
   *
   *  Models asteroids in the game.
   *
   *  Params:
   *    x => the x coordinate of this asteroid in a 2D plane
   *    y => the y coordinate of this asteroid in a 2D plane
   */ 
  function Asteroid(x, y) {
    MovingObject.apply(this, arguments);

    this.asteroid = new Image();
    this.asteroid.src = "/images/asteroids.png";
    
    // Give this asteroid a random velocity so they all move in different
    // directions.
    this.velocity = {
      x: Math.cos(Math.random() * Math.PI) * Math.random() * 5,
      y: Math.sin(Math.random() * Math.PI) * Math.random() * 5
    };
    this.direction = Math.random()*Math.PI;
  }

  Asteroid.prototype = new MovingObject();

  Asteroid.prototype.draw = function(ctx) {
    if(this.asteroid.width){
      ctx.drawImage(this.asteroid,this.x,this.y,2*this.r,2*this.r);
    };
  };

  // // Asteroid.prototype.turn = function(delta) { this.direction += delta; };

  /* End Asteroid */



  /*
   * Ship
   *
   * Models a spaceship that shoots bullets at asteroids.
   *
   * Params:
   *   x => the x coordinate of the spaceship
   *   y => the y coordinate of the spaceship
   */
  function Ship(x, y) {
    MovingObject.apply(this, arguments);

    this.spaceship = new Image();
    this.spaceship.src = "/images/spaceship.png";

    // The spaceship should not be moving until we tell it to.    
    this.velocity = { x: 0.0, y: 0.0 };
    this.direction = Math.PI;
  }

  Ship.prototype = new MovingObject();

  Ship.prototype.draw = function(ctx) {
    //console.log(this.velocity);
    if(this.spaceship.width){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.direction - Math.PI / 2);
      ctx.translate(-this.x, -this.y);
      ctx.drawImage(this.spaceship, this.x - 64, this.y - 64);
      ctx.restore();
    }

  };

  Ship.prototype.turn = function(delta) { this.direction += delta; };

  Ship.prototype.power = function() {
    this.velocity.x = 5 * Math.cos(this.direction);
    this.velocity.y = 5 * Math.sin(this.direction);
  };

  Ship.prototype.fireBullet = function() {
    return new Bullet(this.x, this.y, this.direction);
  };

  /* End Ship */


  /*
   * Bullet
   *
   * Models a bullet that will be shot from a spaceship to destroy asteroids.
   *
   * Params:
   *   x => The x coordinate of where the Bullet is generated.
   *   y => The y coordinate of where the Bullet is generated.
   *   direction => The initial direction the Bullet will travel in.
   */ 
  function Bullet(x, y, direction) {
    MovingObject.call(this, x, y, 1);
    
    this.velocity = {
      x: Math.cos(direction) * 10,
      y: Math.sin(direction) * 10
    }
  }

  Bullet.prototype = new MovingObject();

  Bullet.prototype.update = function(velocity) {
    this.x += velocity.x;
    this.y += velocity.y;
  };

  /* End Bullet */



  /*
   * Game
   *
   * Handles the game logic.
   */
  function Game(ctx, numberOfAsteroids) {
    this.ctx = ctx;
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 25px Arial";
    this.gameOver = false;
    this.MAX_RADIUS = 25;
    this.MIN_RADIUS = 10;
    this.asteroids = [];
    this.requestID;
    this.msgnotshown = true;
    this.score = 0;

    this.bg = new Image();
    this.bg.src = "/images/background.jpg";

    for (var i = 0; i < numberOfAsteroids; ++i)
      this.asteroids.push(new Asteroid(w_width * Math.random(),  w_height * Math.random(), this.MAX_RADIUS * Math.random()+this.MIN_RADIUS));


    this.bullets = [];

    this.ship = new Ship(w_width / 2, w_height / 2, 32);
  };

  Game.prototype.GameOverMsg = function(){
     if(this.gameOver && this.msgnotshown) {
       //cancelAnimationFrame(this.requestID);
       this.ship.spaceship.src = "/images/explosion.png";
       $("<p>Game Over! Your Score: <em>" + this.score +"</em><br/><button name='restart' onclick='javascript:location.reload(true)'>Restart</button></p>").dialog();
       this.msgnotshown = false;
     }

  };

  Game.prototype.draw = function() {
    
    if(this.bg.width)
      this.ctx.drawImage(this.bg, 0, 0);

    for (var i = 0; i < this.asteroids.length; ++i)
      this.asteroids[i].draw(this.ctx);

    for (var i = 0; i < this.bullets.length; ++i)
      this.bullets[i].draw(this.ctx);

    this.ctx.fillText("Score: "+this.score, 25, 25);

    this.ship.draw(this.ctx);
  };

  Game.prototype.update = function() {
    for (var i = 0; i < this.asteroids.length; ++i) {
      if (this.asteroids[i].isHit(this.bullets)) {
        this.asteroids.splice(i, 1); // Delete asteroid from asteroids array.
        this.asteroids.push(new Asteroid(w_width * Math.random(),  w_height * Math.random(), this.MAX_RADIUS * Math.random()+this.MIN_RADIUS)); // Spawn new asteroid. 
        this.score++;
      }
      this.asteroids[i].update(this.asteroids[i].velocity);
      //this.asteroids[i].turn(Math.PI / 32);
    }

    for (var i = 0; i < this.bullets.length; ++i) {
      this.bullets[i].update(this.bullets[i].velocity);
      if (this.bullets[i].offScreen()) {
        this.bullets.splice(i, 1); // Delete bullet from bullets array.
      }
    } 
    
    var v = this.ship.velocity;

    // Slow the ship down over time.
    v.x > 0 ? v.x -= 0.1 : v.x += 0.1
    v.y > 0 ? v.y -= 0.1 : v.y += 0.1

    this.ship.update(this.ship.velocity);
    if (this.ship.isHit(this.asteroids)) 
      this.gameOver = true;
  };

  Game.prototype.loop = function() {
    if (key.isPressed("up")) this.ship.power(0, -5);
    if (key.isPressed("left")) this.ship.turn(-Math.PI / 32);
    if (key.isPressed("right")) this.ship.turn(Math.PI / 32);
    if (key.isPressed("space")) this.bullets.push(this.ship.fireBullet());
    if (this.gameOver && this.requestID){
        this.GameOverMsg();
    }

    this.update();
    this.draw();
  };

  Game.prototype.start = function() {
    var that = this;
    
    var animloop = function(){
      that.loop();
      requestAnimFrame(animloop);
    };
    this.requestID = requestAnimFrame(animloop);

  };

  return { Asteroid: Asteroid, Game: Game };
})();
