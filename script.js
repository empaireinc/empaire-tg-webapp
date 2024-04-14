// Get the original image URL from the query parameters
const urlParams = new URLSearchParams(window.location.search);
const originalImageURL = urlParams.get('original');

// Get elements
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSize = document.getElementById('brushSize');
const sendDataBtn = document.getElementById('sendData');


// Set up image loading
const img = new Image();
img.crossOrigin = "Anonymous"; // Important for loading images from different domains
img.onload = function() {
    // Preprocess image scaling
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate scaling ratio (assuming you want it to fit the screen)
    let scaleFactor = Math.min(window.innerWidth / img.width, window.innerHeight / img.height);
    tempCanvas.width = img.width * scaleFactor;
    tempCanvas.height = img.height * scaleFactor;

    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    // Set up your actual canvas
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;

    // Draw the pre-scaled image (no more scaling needed)
    ctx.drawImage(tempCanvas, 0, 0);

    // ... rest of your touch/mouse event handlers (coordinates should work directly) ...
};
img.src = originalImageURL;

// Drawing functionality
let isDrawing = false;
ctx.strokeStyle = 'red'; // Default drawing color

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

function startDrawing(e) {
  e.preventDefault();
  console.log("Touch Start Event");
  isDrawing = true;
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  var x;
  var y;
  if (e.touches) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 0.5, y + 0.5); // Draw a very tiny line
  ctx.stroke(); // to simulate single pixel
}

function stopDrawing() {
  isDrawing = false;
}

// Send data to backend
sendDataBtn.addEventListener('click', () => {
  const imageData = canvas.toDataURL(); // Get canvas data as image
  sendDataToBackend(imageData);
});

function sendDataToBackend(imageData) {
  // Implement your logic to send imageData (the mask) to the backend.
  // You might use an XMLHttpRequest or the newer fetch() API.
  console.log('Sending data to backend:', imageData);
}
