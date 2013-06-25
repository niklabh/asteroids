$(function() {
  var w_width = window.innerWidth;
  var w_height = window.innerHeight;
  
  console.log(window);
  console.log(w_width);
  console.log(w_height);
  $("<canvas id='canvas' width='" + w_width + "' height='" + w_height + "'>").appendTo('body');

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  new Asteroids.Game(ctx,10).start();
});
