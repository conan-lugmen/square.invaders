var si = {}; // global object for common settings and stuff

;(function() {
	var Game = function (canvasId) {
		this.init(canvasId);

		// helper array to process all draw functions at once
		this.bodies = si.players.concat(si.bullets, si.invaders);
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
		},

		draw: function () {
			si.pg.clearRect(0, 0, si.canvas.width, si.canvas.height);
			si.pg.fillStyle = 'black';
			si.pg.fillRect(0, 0, si.canvas.width, si.canvas.height);

			this.bodies.forEach(function(value, index) {
				value.draw();
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
	};

	Player.prototype = {
		update: function () {
		},

		draw: function () {
			si.pg.fillStyle = this.color;
			si.pg.fillRect(
				this.center.x,
				this.center.y,
				this.size.x,
				this.size.y);
		}
	};


	var Bullet = function (center, color) {
		this.color = color || 'black'; // default to black
		this.size = {
			x: 3,
			y: 3
		};
		this.center = center;
	};

	Bullet.prototype = {
		update: function () {
		},

		draw: function () {
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


	window.onload = function () {
		new Game("playground");
	};
}());
