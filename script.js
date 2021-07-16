const TOAST_REMOVE_DELAY = 3000;
const BRUSH_DEFAULT_SIZE = 10;
const ERASER_DEFAULT_SIZE = 20;
const NEUTRAL_COLOR = 'white'
const SELECTED_COLOR = '#465775';

// Tools
const activeToolEl = document.getElementById('active-tool'); 
const upperTools = document.querySelectorAll('.cursor-tool');
const bottomTools = document.querySelectorAll('.system-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const bucketBtn = document.getElementById('bucket');
const shapes = document.getElementById('shapes');
const eraser = document.getElementById('eraser');
// Modal Content
const toolsModal = document.getElementById('tools-modal');
const settingTextContainer = document.getElementById('setting-text-container');
const settingTitle = document.getElementById('setting-title');
const shapesContainer = document.getElementById('shapes-container');
const settingHint = document.getElementById('setting-hint');
const colorPicker = document.getElementById('color-picker');
const sizePicker = document.getElementById('size-picker');
// Toast Notification
const toasts = document.getElementById('toasts');
// =======================================================================================
// Create shapes
const shapesBtn = document.getElementById('shapes');
const squareBtn = document.getElementById('square');
const circleBtn = document.getElementById('circle');
const polygonBtn = document.getElementById('polygon');
// =======================================================================================
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const { body } = document;

// Global Variables
const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let currentSize = 10;
let bucketColor = '#FFFFFF';
let currentColor = '#4CFFA4';
// =======================================================================================
// Update Tool Indicator Problem
// let toolBools = {  
//   isBrush: false,
//   isSquare: false,
//   isEraser: false
// }
// =======================================================================================
let isEraser = false;
let isBucket = false;
let isShapes = false;

let isMouseDown = false;
let drawnArray = [];

//** Functions */
// Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Create pop-up status notifications
function createNotification(message=null, type=null) {
  const notif = document.createElement('div');
  notif.classList.add('toast');

  // Add appropriate text styling
  if (type != null) {
    notif.classList.add(type);
  }
  notif.innerText = message ? message : "No message";
  toasts.appendChild(notif)

  // Remove element after a delay
  setTimeout(() => {
      notif.remove()
  }, TOAST_REMOVE_DELAY)
}

// Formatting Brush Size
function displayBrushSize() {
  // Format with '0' for numbers lower than 10
  if (brushSlider.value < 10) {
    brushSize.textContent = `0${brushSlider.value}`
  }
  else {
    brushSize.textContent = brushSlider.value;
  }
}

// Update Selected Tool 
function updateSelectedTool(tool) {
  // Reset Tool Booleans
  isEraser = false;
  isBucket = false;
  isShapes = false;

  // Reset Button Highlight
  brushIcon.style.color = NEUTRAL_COLOR;
  bucketBtn.style.color = NEUTRAL_COLOR;
  shapes.style.color = NEUTRAL_COLOR;
  eraser.style.color = NEUTRAL_COLOR;
  
  // Reset Modal Content
  settingTextContainer.style.display = 'flex';
  shapesContainer.style.display = 'none';
  sizePicker.style.display = 'none';
  colorPicker.style.display = 'none';
  brushColorBtn.style.display = 'none';
  bucketColorBtn.style.display = 'none';

  // Update Button & Settings Style/Content
  if (tool === 'brush') { 
    activeToolEl.textContent = 'Brush';
    settingHint.textContent = 'Hint: Use the color picker & slider to change the brush color and size respectively.';

    brushIcon.style.color = SELECTED_COLOR;
  
    currentColor = `#${brushColorBtn.value}`;
    currentSize = BRUSH_DEFAULT_SIZE;
    brushSlider.value = BRUSH_DEFAULT_SIZE;

    sizePicker.style.display = 'flex';
    colorPicker.style.display = 'flex';
    brushColorBtn.style.display = 'flex';

    displayBrushSize();
  }
  else if (tool === 'bucket') {
    isBucket = true;

    activeToolEl.textContent = 'Bucket';
    settingHint.textContent = 'Hint: Use the color picker to change the background color.';

    bucketBtn.style.color = SELECTED_COLOR;

    colorPicker.style.display = 'flex';
    bucketColorBtn.style.display = 'flex';
  }
  // =======================================================================================
  else if (tool === 'shapes') {
    isShapes = true;

    activeToolEl.textContent = 'Shapes';
    settingHint.textContent = 'Hint: Select the shape you want draw from below';
    settingTextContainer.style.display = 'none';

    shapes.style.color = SELECTED_COLOR;

    settingTextContainer.style.display = 'flex';
    shapesContainer.style.display = 'flex';
  }
  // =======================================================================================
  else if (tool === 'eraser') {
    isEraser = true;
    
    activeToolEl.textContent = 'Eraser';
    settingHint.textContent = 'Hint: Use the slider to change the eraser size.';

    eraser.style.color = SELECTED_COLOR;

    currentColor = bucketColor;
    currentSize = ERASER_DEFAULT_SIZE;
    brushSlider.value = ERASER_DEFAULT_SIZE;

    sizePicker.style.display = 'flex';

    displayBrushSize();
  }
  else {
    return "Tool not found or incorrect tool id"
  }
}

// Create Canvas
function createCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
}

// Update DOM - Draw what is stored in DrawnArray
function restoreCanvas(range=drawnArray.length) {
  for (let i = 1; i < range; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    if (drawnArray[i].erase) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  // console.log(line);
  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

/** Event Listeners */

// Setting Brush Size
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener('change', () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

// Setting Background Color
bucketColorBtn.addEventListener('change', () => {
  bucketColor = `#${bucketColorBtn.value}`;
  createCanvas();
  restoreCanvas();
});

// =======================================================================================
/** Create Shapes 
 * IN PROGRESS
*/
// Square
// SHOW UI INDICATION OF CHOSEN TOOL
// squareBtn.addEventListener('click', () => {
//   if (isSquare) {
//     isSquare = false;
//     canvas.style.cursor = 'crosshair';
//   }
//   else {
//     isSquare = true;
//     canvas.style.cursor = 'nw-resize';
//   }
//   updateSelectedTool('brush');
// });
let drawPolygon = false;
let startPoint;
let endPoint;

polygonBtn.addEventListener('click', () => {
  if (!drawPolygon) {
    drawPolygon = true;
  }
  else {
    drawPolygon = false;
  }
  console.log(drawPolygon);
});
// =======================================================================================

/** Mouse Movement */
// Mouse Down
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  // console.log('mouse is clicked', currentPosition);
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = currentColor;
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
});

// Mouse Move
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    // =======================================================================================
    // console.log('mouse is moving', currentPosition);
    // if (isSquare) {
    //   context.strokeRect(currentPosition.x, currentPosition.y, currentPosition.y + 1, currentPosition.x + 1);
    // }
    // else {
    //   context.lineTo(currentPosition.x, currentPosition.y);
    //   context.stroke();
    // }
    // =======================================================================================

    // if (drawPolygon) {
    //   context.lineTo(currentPosition.x, currentPosition.y);
    // }
    
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  }
  else {
    // Is it worth storing the undefined values in the global array?
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  // console.log('mouse is unclicked');
});


/** Bottom Tools*/
// Clear Canvas
clearCanvasBtn.addEventListener('click', () => {
  try {
    if (!confirm('Are you sure you want to clear the canvas?')) {
      return false;
    }
    createCanvas();
    drawnArray = [];
    createNotification('Canvas Cleared', 'success');
  }
  catch(err) {
    createNotification(err, 'error');
  }
});

// Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  try {
    localStorage.setItem('savedCanvas', JSON.stringify(drawnArray))
    createNotification('Canvas Saved', 'success');
  }
  catch(err) {
    createNotification(err, 'error');
  }
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    drawnArray = JSON.parse(localStorage.savedCanvas);

    createNotification('Canvas Loaded', 'success');
  }
  else {
    createNotification('No Saved Canvas', 'error');
  }
});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  if (!confirm('Are you sure you want to delete your local save?')) {
    return false;
  }
  // Best to use removeItem instead of clear (clear will wipe all data stored in local storage)
  localStorage.removeItem('savedCanvas');
  createNotification('Deleted Local Save', 'success');
});

// Download Image
downloadBtn.addEventListener('click', () => {
  if (!confirm('Export canvas as a JPG image?')) {
    return false;
  }
  // Download drawing as an image file to be downloaded from the browser
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = 'brushstroke-example.jpeg';
  createNotification('Image File Created', 'success');
});

// Modal Tool Settings
upperTools.forEach((tool) => {
  tool.addEventListener('click', () => {
    settingTitle.textContent = `${capitalizeFirstLetter(tool.id)} Settings`;
    updateSelectedTool(tool.id);
    toolsModal.classList.add('show-modal');
  });
});

// System Tools Dropdown
const chevronMenu = document.getElementById('chevron-menu');
const systemTools = document.getElementById('system-tools');
let isChevronOpen = false;

chevronMenu.addEventListener('click', () => {
  if (isChevronOpen) {
    isChevronOpen = false;
    chevronMenu.classList.remove('fa-chevron-up');
    chevronMenu.classList.add('fa-chevron-down');
    systemTools.classList.remove('dropdown-show');
  }
  else {
    isChevronOpen = true;
    chevronMenu.classList.remove('fa-chevron-down');
    chevronMenu.classList.add('fa-chevron-up');
    systemTools.classList.add('dropdown-show');
  }
});


window.addEventListener('click', (e) => {
  if (e.target == toolsModal) {
    toolsModal.classList.remove('show-modal');

    if (!isEraser) {
      updateSelectedTool('brush');
    }
  }
});

// =======================================================================================
// On Load
const canvasModal = document.getElementById('canvas-modal');
const canvasOptionIcons = document.querySelectorAll('.canvas-option');

canvasOptionIcons.forEach((icon) => {
  icon.addEventListener('click', () => {
    let width;
    let height;

    if (icon.id === 'portrait') {
      width = 500;
      height = 1000;
    }
    else if (icon.id === 'landscape') {
      width = 1000;
      height = 500;
    }
    else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    canvasModal.classList.remove('show-modal');
    createCanvas(width, height);
  });
})
canvasModal.classList.add('show-modal');
// =======================================================================================
// createCanvas();