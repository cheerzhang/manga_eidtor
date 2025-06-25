

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const bg = new Image();
bg.src = 'templates/frame4/frame.png';

document.getElementById("zoomSlider").addEventListener("input", function(e) {
  document.documentElement.style.setProperty("--zoom", e.target.value);
});

const panels = [
  {
    name: "panel1",
    polygon: [ {x:130, y:94}, {x:2350, y:94}, {x:2350, y:3382}, {x:130, y:3382} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  }
];

let currentPanel = null;
let dragging = false;
let lastX, lastY;

function draw(includeFrame = true) {
  // bg color
  ctx.fillStyle = '#424242';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // border
  if (includeFrame && bg.complete) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  }

  panels.forEach(panel => {
    if (panel.image) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(panel.polygon[0].x, panel.polygon[0].y);
      for (let i = 1; i < panel.polygon.length; i++) {
        ctx.lineTo(panel.polygon[i].x, panel.polygon[i].y);
      }
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(panel.image, panel.offsetX, panel.offsetY,
        panel.image.width * panel.scale,
        panel.image.height * panel.scale);
      ctx.restore();
    }

    // frame
    ctx.beginPath();
    ctx.moveTo(panel.polygon[0].x, panel.polygon[0].y);
    for (let i = 1; i < panel.polygon.length; i++) {
      ctx.lineTo(panel.polygon[i].x, panel.polygon[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,255,0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function isPointInPolygon(polygon, x, y) {
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
  return ctx.isPointInPath(x, y);
}

canvas.addEventListener('mousedown', (e) => {
  lastX = e.offsetX;
  lastY = e.offsetY;
  dragging = true;
});

canvas.addEventListener('mouseup', () => {
  dragging = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (dragging && currentPanel && currentPanel.image) {
    let dx = e.offsetX - lastX;
    let dy = e.offsetY - lastY;
    currentPanel.offsetX += dx;
    currentPanel.offsetY += dy;
    lastX = e.offsetX;
    lastY = e.offsetY;
    draw();
  }
});

canvas.addEventListener('wheel', (e) => {
  if (currentPanel && currentPanel.image) {
    currentPanel.scale += e.deltaY > 0 ? -0.05 : 0.05;
    currentPanel.scale = Math.max(0.1, Math.min(5, currentPanel.scale));
    draw();
  }
});

canvas.addEventListener('click', (e) => {
  const x = e.offsetX, y = e.offsetY;
  currentPanel = null;

  for (let panel of panels) {
    if (isPointInPolygon(panel.polygon, x, y)) {
      currentPanel = panel;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (ev) => {
        const file = ev.target.files[0];
        const img = new Image();
        img.onload = () => {
          panel.image = img;
          panel.offsetX = panel.polygon[0].x;
          panel.offsetY = panel.polygon[0].y;
          panel.scale = 1;
          draw();
        };
        img.src = URL.createObjectURL(file);
      };
      input.click();
      break;
    }
  }
});

function exportImage() {
  const link = document.createElement('a');
  link.download = 'my_comic_page_hd.png';
  link.href = canvas.toDataURL();
  link.click();
}

bg.onload = draw;