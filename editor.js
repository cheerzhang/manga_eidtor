
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const bg = new Image();
bg.src = 'comic_frame_transparent_2_resized.png';

const panels = [
  {
    name: "panel1",
    polygon: [ {x:180, y:180}, {x:760, y:180}, {x:760, y:1400}, {x:180, y:1400} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  },
  {
    name: "panel2",
    polygon: [ {x:860, y:180}, {x:1440, y:180}, {x:1440, y:1400}, {x:860, y:1400} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  },
  {
    name: "panel3",
    polygon: [ {x:1540, y:180}, {x:2120, y:180}, {x:2120, y:1400}, {x:1540, y:1400} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  },
  {
    name: "panel4",
    polygon: [ {x:180, y:1500}, {x:1100, y:1450}, {x:960, y:2100}, {x:180, y:2100} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  },
  {
    name: "panel5",
    polygon: [ {x:1100, y:1450}, {x:2300, y:1500}, {x:2300, y:2100}, {x:960, y:2100} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  },
  {
    name: "panel6",
    polygon: [ {x:180, y:2300}, {x:2300, y:2300}, {x:2300, y:2700}, {x:180, y:2700} ],
    image: null, offsetX: 0, offsetY: 0, scale: 1
  }
];

let currentPanel = null;
let dragging = false;
let lastX, lastY;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

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

    // 可视化边框
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
