var si = {}; // global object for common settings

;(function() {
	var Game = function (canvasId) {
		si.canvas = document.getElementById(canvasId);
		si.pg = si.canvas.getContext("2d");

		var self = this;
		var tick = function () {
			self.update();
			self.draw(screen);
			requestAnimationFrame(tick);
		};

		tick();
	};

	Game.prototype = {
		update: function () {
			console.log('hi');
		},

		draw: function () {
		}
	};

	window.onload = function () {
		new Game("playground");
	};
}());
