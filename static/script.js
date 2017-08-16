$(document).ready(function(){

  //take DOM references
  const $canvas = $('#signature-canvas')
  const context = document.getElementById('signature-canvas').getContext('2d');
  let mouseOnCanvas = false;
  let lastX, lastY;

  function draw(x, y, isDown) {
    if(isDown){
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.closePath();
      context.stroke();
    }
    lastX = x; lastY = y;
  }

  $canvas.mousedown(function(event){
    mouseOnCanvas = true;
    draw(event.offsetX, event.offsetY, false);
  });
  $canvas.mousemove(function (e) {
    if(mouseOnCanvas){
      draw(event.offsetX, event.offsetY, true);
    }
  });
  $canvas.mouseup(function (e) {
    mouseOnCanvas = false;
  });
  $canvas.mouseleave(function (e) {
    mouseOnCanvas = false;
  });



}); //end $(document).ready()
