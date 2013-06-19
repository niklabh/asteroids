$(function() {
	var wx = $(window).width();
	var wy = $(window).height();

	var canvas = $(
		"<canvas id='canvas' width='" + wx + "' height='" + wy + "'></canvas>"
	);

	$('body').append(canvas);

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext("2d");

	new Asteroids.Game(ctx).start();
});