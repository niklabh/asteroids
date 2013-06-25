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



var Asteroids = (function () {
  
  var w_width = $(window).width();
  var w_height = $(window).height();

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
    
    // Give this asteroid a random velocity so they all move in different
    // directions.
    this.velocity = {
      x: Math.cos(Math.random() * Math.PI) * Math.random() * 5,
      y: Math.sin(Math.random() * Math.PI) * Math.random() * 5
    };
  }

  Asteroid.prototype = new MovingObject();

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

    // The spaceship should not be moving until we tell it to.    
    this.velocity = { x: 0, y: 0 };
    this.direction = Math.PI;
  }

  Ship.prototype = new MovingObject();

  Ship.prototype.draw = function(ctx) {
    var spaceship = new Image();
    var that = this;

    spaceship.src = "img/spaceship.png";
    spaceship.onload = function() {
      ctx.save();
      ctx.translate(that.x, that.y);
      ctx.rotate(that.direct - Math.PI / 2);
      ctx.translate(-that.x, -that.y);
      ctx.drawImage(spaceship, that.x - 64, that.y - 64);
      ctx.restore();
    };
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
    this.gameOver = false;
    this.MAX_RADIUS = 25;
    this.asteroids = [];
    this.requestID;
    this.msgnotshown = true;

    for (var i = 0; i < numberOfAsteroids; ++i)
      this.asteroids.push(new Asteroid(w_width * Math.random(),  w_height * Math.random(), this.MAX_RADIUS * Math.random()));


    this.bullets = [];

    this.ship = new Ship(w_width / 2, w_height / 2, 32);
  };

  Game.prototype.GameOverMsg = function(){
    if(this.gameOver && this.msgnotshown) {
      alert("Game Over");
      this.msgnotshown = false;
    }

  };

  Game.prototype.draw = function() {
    var bg = new Image();
    var that = this;

    bg.src = "img/background.jpg";
    bg.onload = function() { that.ctx.drawImage(bg, 0, 0); };

    for (var i = 0; i < this.asteroids.length; ++i)
      this.asteroids[i].draw(this.ctx);

    for (var i = 0; i < this.bullets.length; ++i)
      this.bullets[i].draw(this.ctx);

    this.ship.draw(this.ctx);
  };

  Game.prototype.update = function() {
    for (var i = 0; i < this.asteroids.length; ++i) {
      this.asteroids[i].update(this.asteroids[i].velocity);
      if (this.asteroids[i].isHit(this.bullets)) {
        this.asteroids.splice(i, 1); // Delete asteroid from asteroids array.
        this.asteroids.push(Asteroid.randomAsteroid); // Spawn new asteroid. 
      }
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
    
    (function animloop(){
      that.requestID = requestAnimFrame(animloop);
      that.loop();
    }());

  };

  return { Asteroid: Asteroid, Game: Game };
})();
