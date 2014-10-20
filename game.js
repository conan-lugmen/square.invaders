var si = {}; // global object for common settings

;(function() {
	var Game = function (canvasId) {
		si.canvas = document.getElementById(canvasId);
		si.pg = si.canvas.getContext("2d");
		console.log('Game working');
	};

	Game.prototype = {
	};

	window.onload = function () {
		new Game("playground");
	};
}());
