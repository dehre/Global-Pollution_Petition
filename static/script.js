$(document).ready(function(){

  //take DOM references
  const canvas = document.getElementById('signature-canvas');
  const context = canvas.getContext('2d');
  const $canvas = $('#signature-canvas');
  const $canvasInput = $('input[name="signature"]');

  //helper variables for drawing on <canvas>
  let emptyCanvas = true;
  let mouseOnCanvas = false;
  let lastX, lastY;

  //draw line if mouse is down, otherwise just save current mouse position
  function draw(x, y, isDown){
    if(isDown){
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.closePath();
      context.stroke();
    }
    lastX = x; lastY = y;
  }

  //translate signature into 'base-64' text and  set it as value of hidden <input name="signature">
  function grabCanvasImage(){
    if(!emptyCanvas){
      console.log(canvas.toDataURL());
      $canvasInput.val(canvas.toDataURL());
    }
  }

  //track mouse movements to allow user drawing signature
  $canvas.mousedown(function(event){
    emptyCanvas = false;
    mouseOnCanvas = true;
    draw(event.offsetX, event.offsetY, false);
  });
  $canvas.mousemove(function(event){
    if(mouseOnCanvas){
      draw(event.offsetX, event.offsetY, true);
    }
  });
  $canvas.mouseup(function(){
    mouseOnCanvas = false;
    grabCanvasImage();
  });
  $canvas.mouseleave(function(){
    mouseOnCanvas = false;
    grabCanvasImage();
  });

}); //end $(document).ready()
