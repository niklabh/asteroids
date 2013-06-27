$(function() {
  var w_width = window.innerWidth;
  var w_height = window.innerHeight;
  
  $("<canvas id='canvas' width='" + w_width + "' height='" + w_height + "'>").appendTo('body');

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  window.onkeydown = function(event){
	event.preventDefault(); 
  }

  window.game = new Asteroids.Game(ctx,5);
  game.start();
});
