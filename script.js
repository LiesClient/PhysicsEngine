const fpsDisp = document.getElementById("fps");
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const width = window.innerWidth, height = window.innerHeight;

let lt = performance.now();
let mid = new Vector(width / 2, height / 2);
let orgObjRad = 48;
let objRad; // to be calculated
let objRadRange = 24; // basically objRad +- range
let objCount = 32;
let boundSize = 1024;
let drawScale = 0.3;
let avgPos = new Vector();
let lmousep = new Vector();
let mouse = new Vector();
let clicked = false;
let clickedThisFrame = false;
let keyPressed = {};
let radSum = 0;

const engine = new Engine(orgObjRad);

function init() {
  canvas.width = width;
  canvas.height = height;
  ctx.strokeStyle = "white";

  document.addEventListener("wheel", (e) => {
    let x = e.deltaY;

    if (x < 0) {
      drawScale += 0.01;
    } else {
      drawScale -= 0.01;
    }

    drawScale = Math.max(drawScale, 0);
  })
  
  document.addEventListener("mousedown", (e) => {
    clicked = true;
    clickedThisFrame = true;
  });

  document.addEventListener("mouseup", (e) => {
    clicked = false;
  })

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  document.addEventListener("keydown", (e) => {
    keyPressed[e.key] = true;
  });

  document.addEventListener("keyup", (e) => {
    keyPressed[e.key] = false;
  });

  for (let i = 0; i < objCount; i++) {
    radSum += addRandomObject();
  }

  objRad = radSum / objCount;

  setInterval(() => {
    let ctf = clickedThisFrame;
    clickedThisFrame = false;

    if (keyPressed["c"]) {
      let pos = translate(mouse.copy());
      let translated = translate(lmousep.copy());
      let rad = addRandomObject(translated.x, translated.y);

      radSum += rad;
      objCount++;
      objRad = radSum / objCount;

      engine.objects[engine.objects.length - 1].applyForce(Vector.sub(pos, translated).scale(8));
      
      return;  
    } else if (clicked || ctf) {
      let pos = translate(mouse.copy());
      let rad = addRandomObject(pos.x, pos.y);

      radSum += rad;
      objCount++;
      objRad = radSum / objCount;
    }
    
    lmousep = mouse.copy();
  }, 100);

  setInterval(() => {
    if (!keyPressed["f"]) return;
    let rad = addRandomObject();
    radSum += rad;
    objCount++;
    objRad = radSum / objCount;
  }, 100);
  
  engine.prepare();
  lt = performance.now();
  loop();
}

async function loop() {
  console.log("running loop");
  ctx.fillStyle = "black";
  ctx.lineWidth = 1 / drawScale;
  ctx.fillRect(0, 0, width, height);

  let t = performance.now();
  let dt = t - lt;
  lt = t;
  objCount = engine.objects.length;

  let distTravelled = Math.round(Vector.mag(avgPos)) / 100;

  fpsDisp.innerHTML = 
    `FPS: ${Math.floor(1000 / dt)}<br>FrameTime: ${Math.round(dt * 100) / 100}<br>Object Count: ${engine.objects.length}<br>Zoom: ${Math.round(drawScale * 100) / 100}x<br>Distance Travelled: ${distTravelled}`;
  
  if (keyPressed["w"]) engine.applyGravity(avgPos, 10);
  if (keyPressed["s"]) engine.applyGravity(avgPos, -10);
  if (keyPressed["a"]) engine.applyRotation(avgPos, -10);
  if (keyPressed["d"]) engine.applyRotation(avgPos, 10);

  if (keyPressed["q"]) boundSize += 12;
  if (keyPressed["e"]) boundSize -= 12;
  // engine.applyGravity(mid, 1000);
  // engine.applyFriction(0);
  // engine.applyBounds(vec(objRad, objRad), vec(width - objRad, height - objRad));
  engine.applyCircularBounds(avgPos, boundSize);
  engine.applyUniversalGravity(12);
  await engine.step();

  avgPos = new Vector();

  for (let i = 0; i < engine.objects.length; i++) {
    let obj = engine.objects[i];
    avgPos.add(obj.p);
  }
  
  avgPos.scale(1 / objCount);

  let target = Vector.sub(mid, avgPos);
  
  ctx.fillStyle = "white";
  ctx.save();
  ctx.translate(mid.x, mid.y);
  ctx.scale(drawScale, drawScale);
  ctx.translate(-mid.x, -mid.y);
  ctx.translate(target.x, target.y);

  // engine.grid.drawGrid(ctx);
  
  for (let i = 0; i < engine.objects.length; i++) {
    let obj = engine.objects[i];
    drawCircle(obj.p, obj.r);
    // let aabb = obj.aabb;
    // let min = aabb.min;
    // let max = Vector.sub(aabb.max, min);
    // ctx.strokeRect(min.x, min.y, max.x, max.y);
  }

  strokeCircle(avgPos, 1.2 * objRad * (1 + Math.sqrt(objCount)));
  strokeCircle(avgPos, Math.max(boundSize, 1));

  ctx.restore();
  ctx.save();
  ctx.translate(mid.x, mid.y);
  ctx.scale(drawScale, drawScale);
  ctx.translate(-mid.x, -mid.y);

  let gridSpace = 200;

  if (drawScale <= 0.25) gridSpace *= 2;
  if (drawScale <= 0.1) gridSpace *= 2;
  if (drawScale <= 0.075) gridSpace *= 2;
  if (drawScale <= 0.05) gridSpace *= 2;
  if (drawScale <= 0.025) gridSpace *= 2;
  if (drawScale <= 0.01) gridSpace *= 2;
  if (drawScale <= 0.00825) gridSpace *= 2;
  if (drawScale <= 0.0075) drawScale = 0.0075;
  
  let nearest = (x) => Math.round(x / gridSpace) * gridSpace;
  let left = -nearest(width * (1 / drawScale) - width) - gridSpace;
  let top = -nearest(height * (1 / drawScale) - height) - gridSpace;
  let right = width * (1 / drawScale) + gridSpace;
  let bottom = height * (1 / drawScale) + gridSpace;
  let xHnd = target.x % gridSpace;
  let yHnd = target.y % gridSpace;
  let pxSize = 1 / drawScale;

  for (let x = left; x < right; x += gridSpace) {
    for (let y = top; y < bottom; y += gridSpace) {
      ctx.fillRect(xHnd + x - pxSize, yHnd + y - pxSize, 1.2 * pxSize, 1.2 * pxSize);
    }
  }

  ctx.restore();

  ctx.fillStyle = "green";
  drawCircle(lmousep, 4);

  ctx.fillStyle = "blue";
  drawCircle(mouse, 4);

  // setTimeout(() => {
  //   requestAnimationFrame(loop);
  // }, 100)

  requestAnimationFrame(loop);
}

function translate(pos) {
  // translate from screen space to engine/canvas space
  // translation list:
  // - translate to mid
  // - scale by drawScale
  // - translate to -mid
  // - translate to target
  // target = mid - avgPos

  pos.sub(mid);                     // translate to mid    #1
  pos.scale(1 / drawScale);         // scale by drawScale  #2
  pos.add(mid);                     // translate to -mid   #3
  pos.sub(Vector.sub(mid, avgPos)); // translate to target #4

  return pos;
}

function addRandomObject(inpX = 0, inpY = 0) {
  let p;

  if (inpX || inpY) {
    p = new Vector(inpX, inpY);
  } else {
    let pb = Math.random() * 2 * Math.PI;
    let pm = Math.random() * boundSize;
    p = new Vector(Math.cos(pb), Math.sin(pb)).scale(pm).add(avgPos);
  }

  let dir = Vector.sub(avgPos, p).norm();
  let acc = new Vector(-dir.y, dir.x).scale(12);
  let r = orgObjRad + objRadRange * (Math.random() * 2 - 1);
  
  engine.addObject(new Circle(p, acc, r));
  
  return r;
}

function drawCircle({ x, y }, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function strokeCircle({ x, y }, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

init();