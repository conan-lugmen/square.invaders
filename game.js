;(function() {
	"use strict";

	var si = {}; // global object for common settings and stuff

	var Game = function (canvasId) {
		this.init(canvasId);

		var self = this;
		loadSound("laser.wav", function (shootSound) {
			self.shootSound = shootSound;
			var tick = function () {
				self.update();
				self.draw();
				window.requestAnimationFrame(tick);
			};

			tick();
		});
	};

	Game.prototype = {
		init: function (canvasId) {
			si.canvas = document.getElementById(canvasId);
			si.pg = si.canvas.getContext("2d");

			window.addEventListener('resize', function() {
				this.resize();
				}.bind(this), false);

			this.resize();

			this.bodies = [new Player()];
			this.createInvaders();
		},

		resize: function () {
			si.pg.canvas.width = window.innerWidth;
			si.pg.canvas.height = window.innerHeight;

			if(this.bodies) {
				var spacing = Math.floor(si.pg.canvas.width / 13);
				var start = spacing * 1.25;

				this.bodies.forEach(function(el) {
					// call resize method on each element
					el.resize();

					// reposition elements
					if(el instanceof Invader) {
						el.center.x = start + (el.gridIndex % 11) * spacing;
						el.center.y = start + (el.gridIndex % 5) * spacing;

					} else if(el instanceof Player) {
						el.center.x = si.canvas.width / 2;
						el.center.y = si.canvas.height - el.size.y;

					} else { // is a Bullet
						// Bullets' center is calculated relative to Invader or Player position
						// But we've missed that information at this stage
						// If I leave 'em alone, on resize from smaller to bigger screen size,
						// alien bullets could (and often do) kill friendly (alien) units
						// So, remove all bullets on resize
						si.game.removeBullet(el);
					}
				});
			}

			this.draw();
		},

		update: function () {
			var bodies = this.bodies;
			var notColliding = function (body1) {
				return bodies.filter(function(body2) {
					return colliding(body1, body2);
					}).length === 0;
			};

			this.bodies = this.bodies.filter(notColliding);

			this.bodies.forEach(function(body) {
				body.update();
			});
		},

		draw: function () {
			si.pg.clearRect(0, 0, si.canvas.width, si.canvas.height);
			drawBackground();

			if(this.bodies) {
				// draw only if they are already created (they're not on initialization)
				this.bodies.forEach(function(body) {
					body.draw();
				});
			}
		},

		addBody: function (body) {
			this.bodies.push(body);
		},

		removeBullet: function(bullet) {
			this.bodies.splice(this.bodies.indexOf(bullet), 1);
		},

		createInvaders: function () {
			var spacing = Math.floor(si.pg.canvas.width / 13);
			var start = spacing * 1.25;

			// Original Space Invaders game had 5 rows with 11 aliens each
			for(var i = 0; i < 55; i++) {
				var x = start + (i % 11) * spacing;
				var y = start + (i % 5) * spacing;

				this.addBody(new Invader({
					center: {x: x, y: y},
					gridIndex: i
				}));
			}
		},

		areInvadersBelow: function (invader) {
			return this.bodies.filter(function(b) {
				return b instanceof Invader &&
					b.center.y > invader.center.y &&
					b.center.x - invader.center.x < invader.size.x;
			}).length > 0;
		}
	};

	var Player = function () {
		this.color = 'red';
		this.size = {
			x: si.pg.canvas.width / 24,
			y: si.pg.canvas.width / 24
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
				si.game.addBody(new Bullet({
					center: {
						x: this.center.x,
						y: this.center.y - this.size.y / 2 - Math.ceil(this.size.y * 0.1)
					},
					color: 'purple',
					velocity: {
						x: 0,
						y: -3
					}
				}));

				// it seems this is not needed, but Mary used it in her presentation
//				si.game.shootSound.load(); // rewind it
				si.game.shootSound.play();
			}
		},

		resize: function () {
			// called on windows resize
			this.size.x = si.pg.canvas.width / 24;
			this.size.y = si.pg.canvas.width / 24;
		},

		draw: function () {
			drawTriangle(this);
		}
	};


	var Bullet = function (properties) {
		// properties: {
		//    center: {x: ?, y: ?},
		//    color: [optional]
		//    velocity: {x: ?, y: ?}
		// }

		this.color = properties.color;
		this.size = {
			x: Math.ceil(si.pg.canvas.width / 240), // at least 1 pixel always
			y: Math.ceil(si.pg.canvas.width / 240)
		};
		this.center = properties.center;
		this.velocity = properties.velocity;
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

		resize: function () {
			// called on windows resize
			this.size.x = Math.ceil(si.pg.canvas.width / 240);
			this.size.y = Math.ceil(si.pg.canvas.width / 240);
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


	var Invader = function (properties) {
		// properties: {
		//    center: required
		//    color: optional
		//    gridIndex: required
		// }

		this.color = properties.color || 'green';
		this.size = {
			x: si.pg.canvas.width / 24,
			y: si.pg.canvas.width / 24
		};
		this.center = properties.center;
		this.gridIndex = properties.gridIndex;
		this.patrolX = 0;
		this.speedX = 0.3;
	};

	Invader.prototype = {
		update: function () {
			if(this.patrolX < 0 || this.patrolX > this.size.x) {
				this.speedX = - this.speedX;
			}

			this.center.x += this.speedX;
			this.patrolX += this.speedX;

			if('undefined' !== typeof si.game &&
				! si.game.areInvadersBelow(this) &&
				Math.random() > 0.995) {

				si.game.addBody(new Bullet({
					center: {
						x: this.center.x,
						y: this.center.y + this.size.y / 2 + Math.ceil(this.size.y * 0.1)
					},
					color: 'yellow',
					velocity: {
						x: Math.random() * 0.5,
						y: 3
					}
				}));
			}
		},

		resize: function () {
			// called on windows resize
			this.size.x = si.pg.canvas.width / 24;
			this.size.y = si.pg.canvas.width / 24;
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


	var drawTriangle = function (body) {
		var halfSideSize = body.size.x / 2; // let's calculate it only once

		// See this for apothem and radius:
		// http://www.vitutor.com/geometry/plane/equilateral_triangle.html

		var apothem = Math.sqrt(3) / 6 * body.size.x;
		var radius = body.size.x / Math.sqrt(3);

		var ax = body.center.x - halfSideSize;
		var ay = body.center.y + apothem;

		var bx = body.center.x + halfSideSize;
		var by = ay;

		var cx = body.center.x;
		var cy = body.center.y - radius;

		si.pg.fillStyle = body.color;
		si.pg.beginPath();
		si.pg.moveTo(ax, ay);
		si.pg.lineTo(bx, by);
		si.pg.lineTo(cx, cy);
		si.pg.fill();
	};


	var drawBackground = function () {
		// TODO draw a parallax starfield
		si.pg.fillStyle = 'black';
		si.pg.fillRect(0, 0, si.canvas.width, si.canvas.height);
	};


	var loadSound = function(url, callback) {
		var loaded = function () {
			callback(sound);
			sound.removeEventListener('canplaythrough', loaded);
		};

		var sound = new Audio(url);
		sound.addEventListener('canplaythrough', loaded);
		sound.load();
	};


	window.onload = function () {
		si.game = new Game("playground");
	};
}());
