var si = {}; // global object for common settings and stuff

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
			si.players = [new Player()];
			si.bullets = [];
			si.invaders = [];

		},

		update: function () {
			// helper array to process all draw functions at once
			si.bodies = si.players.concat(si.bullets, si.invaders);
			si.bodies.forEach(function(body) {
				body.update();
			});
		},

		draw: function () {
			si.pg.clearRect(0, 0, si.canvas.width, si.canvas.height);
			si.pg.fillStyle = 'black';
			si.pg.fillRect(0, 0, si.canvas.width, si.canvas.height);

			si.bodies.forEach(function(body) {
				body.draw();
			});
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
				this.center.x += 2;

			} else if(this.keyboard.isDown(this.keyboard.keys.left)) {
				this.center.x -= 2;
			}

			if(this.keyboard.isDown(this.keyboard.keys.fire)) {
				si.bullets.push(new Bullet({
					x: this.center.x,
					y: this.center.y - this.size.y / 2
				}, 'yellow', {x: 0, y: -6}));
			}
		},

		draw: function () {
			si.pg.fillStyle = this.color;
			si.pg.fillRect(
				this.center.x,
				this.center.y,
				this.size.x,
				this.size.y
			);
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
		},

		draw: function () {
			si.pg.fillStyle = this.color;
			si.pg.fillRect(
				this.center.x,
				this.center.y,
				this.size.x,
				this.size.y
			);
		}
	};


	var Invader = function (center) {
		this.color = color;
		this.size = {
			x: 10,
			y: 10
		};
		this.center = center;
	};

	Invader.prototype = {
		update: function () {
		},

		draw: function () {
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

	window.onload = function () {
		new Game("playground");
	};
}());
