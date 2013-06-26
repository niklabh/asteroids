$(function() {
  var w_width = window.innerWidth - 30;
  var w_height = window.innerHeight - 30;
  
  $("<canvas id='canvas' width='" + w_width + "' height='" + w_height + "'>").appendTo('body');

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  window.onKeyDown = function(event){
	event.preventDefault(); 
  }

  new Asteroids.Game(ctx,5).start();
});
