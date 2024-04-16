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
    // Create black and white mask
    const originalCanvas = document.getElementById('drawingCanvas');
    const ctxOriginal = originalCanvas.getContext('2d');

    // Create white mask canvas
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    maskCanvas.width = originalCanvas.width;
    maskCanvas.height = originalCanvas.height;
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Temporary in-memory canvas for the original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;
    tempCtx.drawImage(originalCanvas, 0, 0);

    // Create black dots for drawing
    // ... (Your existing code to draw black dots on maskCanvas remains the same) ...

    // Isolate the drawn pixels
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Isolate the drawn pixels
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    for (let i = 0; i < maskImageData.data.length; i += 4) {
      if (tempImageData.data[i + 3] === 0 && maskImageData.data[i + 3] > 0) { // Check for transparency in tempImage and non-transparency in maskImage
        maskImageData.data[i] = 0; // Set to black
        maskImageData.data[i + 1] = 0;
        maskImageData.data[i + 2] = 0;
        maskImageData.data[i + 3] = 255; // Set alpha to opaque (explicitly)
      } else {  // For non-drawn pixels
        maskImageData.data[i] = 255; // Set to white
        maskImageData.data[i + 1] = 255;
        maskImageData.data[i + 2] = 255;
      }
    }
    maskCtx.putImageData(maskImageData, 0, 0); // Update maskCanvas

    // Finally, send base64Mask
    const base64Mask = maskCanvas.toDataURL('image/png');
    // Send mask data to backend
    sendDataToBackend(base64Mask);
});


async function sendDataToBackend(imageData) {
  try {
      const response = await fetch('http://0.0.0.0:8000/upload', {
          method: 'POST',
          body: imageData
      });

      if (response.ok) {
          const responseText = await response.text();
          console.log('Success:', responseText);
      } else {
          console.error('Error:', response.status, response.statusText);
      }
  } catch (error) {
      console.error('Error sending data:', error);
  }
}
