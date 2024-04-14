angular.module("custom-webapp-ui", []).controller('CustomUIController', function CustomUIController($scope) {

  // Fetch and decode the image URL
  const urlParams = new URLSearchParams(window.location.search);
  const encodedImageURL = urlParams.get('original');
  const decodedImageURL = decodeURIComponent(encodedImageURL);

  // Canvas setup
  let canvas, ctx; // Declare canvas and context globally

  function getRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.touches) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }


  const image = new Image();
  image.src = decodedImageURL;
  image.onload = function() {
    setupCanvas();
    $scope.lineWidth = 15; // Initial line width
    $scope.lineWidthBars = [
    { value: 15 }
    ];
    $scope.$watch('lineWidth', function(newValue, oldValue) {
    if (newValue !== oldValue) {
        ctx.lineWidth = newValue;
        console.log('Line width updated:', ctx.lineWidth);
      }
    });
  };

  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx = canvas.getContext('2d');

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Find a suitable place to insert the canvas (modify the selector if needed)
    const container = document.querySelector('body');
    container.appendChild(canvas);

    // Add drawing event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
  }

  let isDrawing = false;
  function startDrawing(event) {
    event.preventDefault(); // Prevent default for both mouse and touch events
    isDrawing = true;
    const pos = getRelativePosition(event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(event) {
    event.preventDefault();
    if (isDrawing) {
      const pos = getRelativePosition(event);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }

  function stopDrawing(event) {
    isDrawing = false;
  }

});
