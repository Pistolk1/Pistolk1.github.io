const preview = document.getElementById("preview");
const contextMenu = document.getElementById("context-menu");
const rotateSlider = document.getElementById("rotate-slider");
const scaleSlider = document.getElementById("scale-slider");
const opacitySlider = document.getElementById("opacity-slider");
const xSlider = document.getElementById("x-slider");
const ySlider = document.getElementById("y-slider");
const widthSlider = document.getElementById("width-slider");
const heightSlider = document.getElementById("height-slider");

let currentObject = null;
let animations = {};
let animationName = "myAnimation";

// Add a new animated object
function addObject() {
  const object = createAnimatedObject();
  preview.appendChild(object);
  object.addEventListener("click", (e) => showContextMenu(e, object));
}

// Create an animated object with random color and unique ID
function createAnimatedObject() {
  const object = document.createElement("div");
  object.classList.add("animated-object");
  object.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  object.style.left = "50px";
  object.style.top = "50px";
  object.style.width = "50px";
  object.style.height = "50px";
  preview.appendChild(object);
  return object;
}

// Show context menu for editing object properties
function showContextMenu(event, object) {
  event.stopPropagation();
  currentObject = object;

  // Set context menu position and initialize sliders
  contextMenu.style.top = `${event.clientY + 10}px`;
  contextMenu.style.left = `${event.clientX + 10}px`;
  contextMenu.style.display = "flex";

  xSlider.value = parseInt(object.style.left, 10) || 0;
  ySlider.value = parseInt(object.style.top, 10) || 0;
  rotateSlider.value = getRotation(object);
  scaleSlider.value = getScale(object);
  opacitySlider.value = parseFloat(object.style.opacity) || 1;
  widthSlider.value = parseInt(object.style.width, 10) || 50;
  heightSlider.value = parseInt(object.style.height, 10) || 50;

  // Attach slider event listeners
  xSlider.oninput = () => updatePosition(object, xSlider.value, ySlider.value);
  ySlider.oninput = () => updatePosition(object, xSlider.value, ySlider.value);
  rotateSlider.oninput = () => rotateObject(object, rotateSlider.value);
  scaleSlider.oninput = () => scaleObject(object, scaleSlider.value);
  opacitySlider.oninput = () => setOpacity(object, opacitySlider.value);
  widthSlider.oninput = () => setSize(object, widthSlider.value, heightSlider.value);
  heightSlider.oninput = () => setSize(object, widthSlider.value, heightSlider.value);
}

// Close the context menu
function closeContextMenu() {
  contextMenu.style.display = "none";
  currentObject = null;
}

// Update object's position
function updatePosition(object, x, y) {
  object.style.left = `${x}px`;
  object.style.top = `${y}px`;
}

// Rotate object based on slider value
function rotateObject(object, angle) {
  const scale = getScale(object);
  object.style.transform = `rotate(${angle}deg) scale(${scale})`;
}

// Scale object based on slider value
function scaleObject(object, scale) {
  const rotation = getRotation(object);
  object.style.transform = `rotate(${rotation}deg) scale(${scale})`;
}

// Set opacity of the object
function setOpacity(object, opacity) {
  object.style.opacity = opacity;
}

// Update object's size
function setSize(object, width, height) {
  object.style.width = `${width}px`;
  object.style.height = `${height}px`;
}

// Change sprite and set it as background image
function changeSprite(event) {
  const file = event.target.files[0];
  if (file && currentObject) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentObject.style.backgroundImage = `url(${e.target.result})`;
      currentObject.style.backgroundSize = "cover";
    };
    reader.readAsDataURL(file);
  }
}

// Utility function to get current rotation of an object
function getRotation(object) {
  const transform = window.getComputedStyle(object).transform;
  if (transform === "none") return 0;
  const matrix = new DOMMatrix(transform);
  return Math.round(Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI));
}

// Utility function to get current scale of an object
function getScale(object) {
  const transform = window.getComputedStyle(object).transform;
  if (transform === "none") return 1;
  const matrix = new DOMMatrix(transform);
  return Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
}

// Preview the animation
function previewAnimation() {
  // Clear previous animations
  preview.innerHTML = '';

  // Create a copy of the current objects and animate them
  const objects = document.querySelectorAll('.animated-object');
  objects.forEach((object) => {
    const newObject = object.cloneNode(true);
    preview.appendChild(newObject);
    animateObject(newObject);
  });
}

// Animate the object with keyframes
function animateObject(object) {
  const duration = document.getElementById("duration").value;
  const timingFunction = document.getElementById("timing-function").value;
  
  const keyframes = [
    { transform: 'translate(0, 0)', opacity: 1 },
    { transform: 'translate(100px, 100px)', opacity: 0.5 },
    { transform: 'translate(0, 0)', opacity: 1 }
  ];
  
  const options = {
    duration: duration * 1000,
    easing: timingFunction,
    fill: 'forwards'
  };

  object.animate(keyframes, options);
}

// Generate CSS code for the animation
function generateCSS() {
  const cssOutput = document.getElementById("css-output");
  const animationName = document.getElementById("animation-name").value || "myAnimation";
  const duration = document.getElementById("duration").value;
  const timingFunction = document.getElementById("timing-function").value;

  let css = `
    @keyframes ${animationName} {
      0% { transform: translate(0, 0); opacity: 1; }
      50% { transform: translate(100px, 100px); opacity: 0.5; }
      100% { transform: translate(0, 0); opacity: 1; }
    }

    .animated-object {
      animation: ${animationName} ${duration}s ${timingFunction} forwards;
    }
  `;

  cssOutput.value = css;
}

// Export the animation as an HTML file
function exportHTML() {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.getElementById("animation-name").value || "My Animation"}</title>
    <style>
      body { display: flex; justify-content: center; align-items: center; height: 100vh; }
      .animated-object { animation: myAnimation 2s ease forwards; }
    </style>
  </head>
  <body>
    <div id="preview">${preview.innerHTML}</div>
    <script>
      // Your animation logic here...
    </script>
  </body>
  </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'animation.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
