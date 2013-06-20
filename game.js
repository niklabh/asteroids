$(function() {
  var w_width = $(window).width();
  var w_height = $(window).height();
  
  $(
    "<canvas id='canvas' width='" + w_width + "' height='" + w_height + "'>"
  ).appendTo('body');

  var canvas = $('#canvas')
  var ctx = canvas.getContext('2d');

  new Asteroids.Game(ctx).start();
});
