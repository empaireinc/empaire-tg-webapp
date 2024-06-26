// Get the original image URL from the query parameters
//console.log(tg.initDataUnsafe.user.id)
function setThemeClass() {
    document.documentElement.className = Telegram.WebApp.colorScheme;
}

Telegram.WebApp.onEvent('themeChanged', setThemeClass);
setThemeClass();

const DemoApp = {
        initData      : Telegram.WebApp.initData || '',
        initDataUnsafe: Telegram.WebApp.initDataUnsafe || {},
        MainButton    : Telegram.WebApp.MainButton,

        init(options) {
            document.body.style.visibility = '';
            Telegram.WebApp.ready();
            Telegram.WebApp.MainButton.setParams({
                text      : 'CLOSE WEBVIEW',
                is_visible: true
            }).onClick(DemoApp.close);
        },
        expand() {
            Telegram.WebApp.expand();
        },
        close() {
            Telegram.WebApp.close();
        },
        toggleMainButton(el) {
            const mainButton = Telegram.WebApp.MainButton;
            if (mainButton.isVisible) {
                mainButton.hide();
                el.innerHTML = 'Show Main Button';
            } else {
                mainButton.show();
                el.innerHTML = 'Hide Main Button';
            }
        }
}

DemoApp.init()

console.log(DemoApp.initDataUnsafe.user.id)

const urlParams = new URLSearchParams(window.location.search);
let originalImageURL = urlParams.get('original');


// Get elements
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSize = document.getElementById('brushSize');
const sendDataBtn = document.getElementById('sendData');

var img = new Image();
img.crossOrigin = "Anonymous";

let originalH, originalW;

img.onload = function() {
    let scaleFactor = Math.min(window.innerWidth / img.naturalWidth, window.innerHeight / img.naturalHeight);
    originalW = img.naturalWidth;
    originalH = img.naturalHeight;
    console.log("original image size", originalW, originalH);
    console.log("scalefactor", scaleFactor)
    canvas.width = originalW * scaleFactor;
    canvas.height = originalH * scaleFactor;
};

img.src = originalImageURL;

canvas.style.backgroundImage = `url('${img.src}')`;
canvas.style.backgroundSize = "100%";

console.log("canvas size", canvas.width, canvas.height);

// Drawing functionality
let isDrawing = false;
ctx.strokeStyle = 'black'; // Default drawing color

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

    const maskImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(maskImageData, 0, 0); // Update maskCanvas

    // Finally, send base64Mask
    const base64Mask = canvas.toDataURL('image/png');

    // Send mask data to backend
    sendDataToBackend(base64Mask);
    DemoApp.close()
});


async function sendDataToBackend(imageData) {
  try {
      const data = {
        mask: imageData,
        height: 100,
        width: 100,
      };
      const response = await fetch('https://vps-9491c78f.vps.ovh.net:48001/upload_mask', {
          method: 'POST',
          body: JSON.stringify(data)
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
