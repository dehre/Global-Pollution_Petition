$(document).ready(function(){

  // //CANVAS
  //check if canvas in current webpage
  const canvas = document.getElementById('signature-canvas');
  if(canvas){
    //take other DOM references
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
  } //end 'if(canvas)'


  // //PROGRESS-BAR
  //check if progress-bar in current webpage
  const $bar = $('#progress-bar');
  if($bar){
    //grab goal number for actual petition and number of currently signed users
    const signers = Number($('#petition-signers').text());
    const goal = Number($('#petition-goal').text());
    const completed = Math.round(signers/goal*100);
    function move() {
      let width = 0;
      const id = setInterval(frame, 30);
      function frame() {
        if (width >= completed) {
          clearInterval(id);
        } else {
          width++;
          $bar.css("width",`${width}%`);
          $bar.html(`${width}%`);
        }
      }
    }
    move();
  }

}); //end $(document).ready()
