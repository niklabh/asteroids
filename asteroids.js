var Asteroids = (function () {

	var width = $(window).width();
	var height = $(window).height();

	function MovingObject(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}

	MovingObject.prototype.update = function(velocity) {
		var newX = (this.x + velocity.x);
		var newY = (this.y + velocity.y);
		(newX < 0) ? newX += width : newX %= width;
		(newY < 0) ? newY += height : newY %= height;

		this.x = newX;
		this.y = newY;
	}

	MovingObject.prototype.draw = function(ctx) {
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.beginPath();

		ctx.arc(
			this.x,
			this.y,
			this.radius,
			0,
			2 * Math.PI,
			false
		);

		ctx.closePath();
		ctx.stroke();
	}

	MovingObject.prototype.offScreen = function(xLim, yLim) {
		return (
			(this.x + this.radius > xLim) ||
			(this.y + this.radius > yLim) ||
			(this.x - this.radius < 0) ||
			(this.y - this.radius < 0)
		);
	}

	function Asteroid(x, y) {
		MovingObject.apply(this, arguments);
		this.velocity = {
			x: Math.cos(Math.random() * Math.PI) * Math.random() * 5,
			y: Math.sin(Math.random() * Math.PI) * Math.random() * 5
		}
	}

	Asteroid.MAX_RADIUS = 25;
	Asteroid.randomAsteroid = function(maxX, maxY) {
		return new Asteroid(
			maxX * Math.random(),
			maxY * Math.random(),
			Asteroid.MAX_RADIUS * Math.random()
		);
	}

	Asteroid.prototype = new MovingObject();

	function Ship(x, y) {
		MovingObject.apply(this, arguments);
		this.velocity = {
			x: 0,
			y: 0
		}
		this.direction = Math.PI;
	}

	Ship.prototype = new MovingObject();

	Ship.prototype.draw = function(ctx) {
		var spaceship = new Image();
		spaceship.src = "spaceship.png";

		var that = this;
		spaceship.onload = function() {
			ctx.save();
			ctx.translate(that.x, that.y);
			ctx.rotate(that.direction - Math.PI/2);
			ctx.translate(-that.x, -that.y);
			ctx.drawImage(spaceship, that.x - 64, that.y - 64);
			ctx.restore();
		}
	}

	Ship.prototype.turn = function(d) {
		this.direction += d
	}

	Ship.prototype.power = function(dx, dy) {
		this.velocity.x = 5 * Math.cos(this.direction);
		this.velocity.y = 5 * Math.sin(this.direction);
	}

	MovingObject.prototype.isHit = function(asteroids) {
		for (var i = 0; i < asteroids.length; i++) {
			var dist = Math.sqrt(
										Math.pow((this.x - asteroids[i].x), 2) +
										Math.pow((this.y - asteroids[i].y), 2)
			);

			if (dist < (this.radius + asteroids[i].radius)) return true;
		}

		return false;
	}

	Ship.prototype.fireBullet = function() {
		return new Bullet(this.x, this.y, this.direction);
	}


	function Bullet(startX, startY, direction) {
		MovingObject.call(this, startX, startY, 1)
		this.velocity = {
			x: Math.cos(direction) * 10,
			y: Math.sin(direction) * 10
		}
	}

	Bullet.prototype = new MovingObject();

	Bullet.prototype.update = function(velocity) {
		console.log(this);
		console.log(velocity);
		var newX = (this.x + velocity.x);
		var newY = (this.y + velocity.y);

		this.x = newX;
		this.y = newY;
	}

	function Game(ctx) {
		this.ctx = ctx;

		this.xDim = ctx.canvas.width;
		this.yDim = ctx.canvas.height;

		this.gameOver = false;

		this.asteroids = [];
		for (var i = 0; i < 15; ++i) {
			this.asteroids.push(Asteroid.randomAsteroid(
				width, height
			));
		}

		this.bullets = [];

		this.ship = new Ship((this.xDim / 2), (this.yDim / 2), 32);
	}

	Game.prototype.draw = function() {
		var bg = new Image();
		bg.src = "dat_background.jpg";

		var that = this;
		bg.onload = function() {
			that.ctx.drawImage(bg, 0, 0);
		}

		for (var i = 0; i < this.asteroids.length; ++i) {
			this.asteroids[i].draw(this.ctx);
		}

		for (var i = 0; i < this.bullets.length; ++i) {
			this.bullets[i].draw(this.ctx);
		}

		this.ship.draw(this.ctx);
	}

	Game.prototype.update = function() {
		for (var i = 0; i < this.asteroids.length; ++i) {
			this.asteroids[i].update(this.asteroids[i].velocity);
			if (this.asteroids[i].isHit(this.bullets)) {
				this.asteroids.splice(i, 1);
				this.asteroids.push(Asteroid.randomAsteroid(0, 0));
			}
		}

		for (var i = 0; i < this.bullets.length; ++i) {
			this.bullets[i].update(this.bullets[i].velocity);
			if (this.bullets[i].offScreen(this.xDim, this.yDim)) {
				this.bullets.splice(i, 1);
			}
		}

		if (this.ship.velocity.x > 0) this.ship.velocity.x -= .1;
		if (this.ship.velocity.y > 0) this.ship.velocity.y -= .1;
		if (this.ship.velocity.x < 0) this.ship.velocity.x += .1;
		if (this.ship.velocity.y < 0) this.ship.velocity.y += .1;

		this.ship.update(this.ship.velocity);
		if (this.ship.isHit(this.asteroids)) {
			this.gameOver = true;
		}
	}

	Game.prototype.loop = function() {
		var that = this;
		if (key.isPressed("up")) that.ship.power(0, -5);
		if (key.isPressed("left")) that.ship.turn(-Math.PI/32);
		if (key.isPressed("right")) that.ship.turn(Math.PI/32);
		if (key.isPressed("space")) {
			var bullet = that.ship.fireBullet();
			bullet.draw(that.ctx);
			that.bullets.push(bullet);
		}

		this.update();
		this.draw();
	}

	Game.prototype.start = function() {
		var that = this;
		this.timer = window.setInterval(function() {
			that.loop();
			if (that.gameOver) {
				alert('GAME OVER');
				clearInterval(that.timer);
			}
		}, 1000/32);
	}

	return {
		Asteroid: Asteroid,
		Game: Game,
	}
})();