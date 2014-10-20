;(function() {
	var Game = function (canvasId) {
		this.init(canvasId);

		var self = this;
		var tick = function () {
			self.update();
			self.draw();
			requestAnimationFrame(tick);
		};

		tick();
	};

	Game.prototype = {
		init: function (canvasId) {
			si.canvas = document.getElementById(canvasId);
			si.pg = si.canvas.getContext("2d");

			si.bodies = [new Player()];
			this.createInvaders();
		},

		update: function () {
			var bodies = si.bodies;
			var notColliding = function (body1) {
				return bodies.filter(function(body2) {
					return colliding(body1, body2);
					}).length === 0;
			};

			si.bodies = si.bodies.filter(notColliding);

			si.bodies.forEach(function(body) {
				body.update();
			});
		},

		draw: function () {
			si.pg.clearRect(0, 0, si.canvas.width, si.canvas.height);
			drawBackground();

			si.bodies.forEach(function(body) {
				body.draw();
			});
		},

		addBullet: function (bullet) {
			si.bodies.push(bullet);
		},

		removeBullet: function(bullet) {
			si.bodies.splice(si.bodies.indexOf(bullet), 1);
		},

		createInvaders: function () {
			var start = 30;
			var spacing = 30;

			for(var i = 0; i < 24; i++) {
				var x = start + (i % 8) * spacing;
				var y = start + (i % 3) * spacing;

				si.bodies.push(new Invader({x: x, y: y}));
			}
		}
	};

	var Player = function () {
		this.color = 'red';
		this.size = {
			x: 15,
			y: 15
		};
		this.center = {
			x: si.canvas.width / 2,
			y: si.canvas.height - this.size.y
		};
		this.keyboard = new Keyboard();
	};

	Player.prototype = {
		update: function () {
			if(this.keyboard.isDown(this.keyboard.keys.right)) {
				if(this.center.x + this.size.x + 2 <= si.canvas.width) {
					this.center.x += 2;
				}

			} else if(this.keyboard.isDown(this.keyboard.keys.left)) {
				if(this.center.x - 2 >= 0) {
					this.center.x -= 2;
				}
			}

			if(this.keyboard.isDown(this.keyboard.keys.fire)) {
				si.game.addBullet(new Bullet({
					x: this.center.x,
					y: this.center.y - this.size.y / 2 - 2
				}, 'yellow', {x: 0, y: -3}));
			}
		},

		draw: function () {
			// TODO all objects have draw function because the plan is to draw them different at some point
			drawRect(this);
		}
	};


	var Bullet = function (center, color, velocity) {
		this.color = color || 'yellow'; // default to yellow
		this.size = {
			x: 3,
			y: 3
		};
		this.center = center;
		this.velocity = velocity;
	};

	Bullet.prototype = {
		update: function () {
			this.center.x += this.velocity.x;
			this.center.y += this.velocity.y;

			// remove bullets that leave the playground
			if(this.isOutOfBounds()) {
				si.game.removeBullet(this);
			}
		},

		draw: function () {
			drawRect(this);
		},

		isOutOfBounds: function () {
			if(this.center.x < 0 ||
				this.center.x > si.canvas.width ||
				this.center.y < 0 ||
				this.center.y > si.canvas.height) {

				return true;
			}

			return false;
		}
	};


	var Invader = function (center, color) {
		this.color = color || 'green';
		this.size = {
			x: 10,
			y: 10
		};
		this.center = center;
		this.patrolX = 0;
		this.speedX = 0.3;
	};

	Invader.prototype = {
		update: function () {
			if(this.patrolX < 0 || this.patrolX > 40) {
				this.speedX = - this.speedX;
			}

			this.center.x += this.speedX;
			this.patrolX += this.speedX;
		},

		draw: function () {
			drawRect(this);
		}
	};


	var Keyboard = function () {
		var state = {};

		window.onkeydown = function (evt) {
			state[evt.keyCode] = true;
		};

		window.onkeyup = function (evt) {
			state[evt.keyCode] = false;
		};

		this.isDown = function (keyCode) {
			return true === state[keyCode];
		};

		this.keys = {
			left: 37,
			right: 39,
			fire: 32
		};
	};


	var colliding = function(body1, body2) {
		return ! (body1 === body2 ||
			body1.center.x + body1.size.x / 2 < body2.center.x - body2.size.x / 2 ||
			body1.center.y + body1.size.y / 2 < body2.center.y - body2.size.y / 2 ||
			body1.center.x - body1.size.x / 2 > body2.center.x + body2.size.x / 2 ||
			body1.center.y - body1.size.y / 2 > body2.center.y + body2.size.y / 2);
	};


	var drawRect = function (body) {
		si.pg.fillStyle = body.color;
		si.pg.fillRect(
			body.center.x - body.size.x / 2,
			body.center.y - body.size.y / 2,
			body.size.x,
			body.size.y
		);
	};


	var drawBackground = function () {
		// TODO draw a parallax starfield
		si.pg.fillStyle = 'black';
		si.pg.fillRect(0, 0, si.canvas.width, si.canvas.height);
	};
	window.onload = function () {
		si = {}; // global object for common settings and stuff

		si.game = new Game("playground");
	};
}());
