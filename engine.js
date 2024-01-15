class Engine {
  lastTime = 0;
  minRad = 0.1;
  grid = new Grid();
  objects = [];
  threads = []

  constructor(rad) {
    this.grid = new Grid(rad);
  }

  prepare() {
    this.lastTime = performance.now();
  }

  async step() {
    let t = performance.now();
    let dtMS = t - this.lastTime;
    let dt = dtMS / 1000; // ms / 1000 => seconds
    this.lastTime = t;

    if (dt >= 0.1) return console.log("wow that is lag");

    // todo: parellize the stuff
    // await this.resolveCollisionsInParallel();

    // using grid (upgraded version)
    let possibleCells = Object.keys(this.grid.grid);

    for (let c = 0; c < possibleCells.length; c++) {
      let cell = this.grid.grid[possibleCells[c]];

      for (let idex = 0; idex < cell.length; idex++) {
        let i = cell[idex];
        let obj0 = this.objects[i];

        for (let jdex = 0; jdex < cell.length; jdex++) {
          let j = cell[jdex]
          if (i == j) continue;
          let obj1 = this.objects[j];

          this.testCollision(obj0, obj1);
        }
      }
    }

    // using grid (original version)
    // for (let i = 0; i < this.objects.length; i++) {
    //   let obj = this.objects[i];
    //   let objs = this.grid.query(obj);

    //   for (let k = 0; k < objs.length; k++) {
    //     let j = objs[k];
    //     if (i == j) continue;
    //     let obj2 = this.objects[j];

    //     this.testCollision(obj, obj2);
    //   }
    // }

    // n^2/2 (basically original version)
    // for (let i = 0; i < this.objects.length; i++) {
    //   let obj = this.objects[i];
    //   for (let j = i + 1; j < this.objects.length; j++) {
    //     let obj2 = this.objects[j];
    //     this.testCollision(obj, obj2);
    //   }
    // }

    // for (let i = this.objects.length - 1; i >= 0; i--) {
    //   if (this.objects[i].toRemove) {
    //     let temp = this.objects[this.objects.length - 1].copy();
    //     this.objects[this.objects.length - 1] = this.objects[i];
    //     this.objects.pop();
    //     this.objects[i] = temp;
    //   }
    // }

    this.updateObjects(dt);
    this.grid.updateGrid(this.objects);
  }

  applyAllForces() {
    
  }

  async resolveCollisionsInParallel() {
    let objs = this.objects.map((obj, index) => {
      return {
        p: { x: obj.p.x, y: obj.p.y },
        r: obj.r,
        i: index,
        a: this.grid.query(obj)
      };
    });

  }

  testCollision(obj0, obj1) {
    let dist = Vector.sub(obj0.p, obj1.p).mag();
    let dia = obj0.r + obj1.r;

    if (dist < dia) {
      let mag = dia - dist;
      let dir = Vector.sub(obj0.p, obj1.p).norm();
      dir.scale(mag);

      // rad = mass essentially
      obj0.p.add(Vector.scale(dir, obj1.r / dia));
      obj1.p.add(dir.scale(-obj0.r / dia));

      // let absorbtionFactor = 0.001;

      // // larger absorbs part of smaller's mass
      // if (obj0.r > obj1.r) {
      //   let r = obj1.r * absorbtionFactor;
      //   obj0.r += r;
      //   obj1.r -= r;

      //   if (obj1.r <= this.minRad) obj1.toRemove = true;
      // } else {
      //   let r = obj0.r * absorbtionFactor;
      //   obj1.r += r;
      //   obj0.r -= r;
        
      //   if (obj0.r <= this.minRad) obj0.toRemove = true;
      // }
      
    }
  }

  updateObjects(dt) {
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].update(dt);
    }
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  applyFriction(fr) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let vel = Vector.sub(obj.p, obj.lp);
      obj.applyForce(vel.scale(-1 * fr));
    }
  }

  applyGravity(pos, mag) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let dir = Vector.sub(pos, obj.p).norm().scale(mag);
      obj.applyForce(dir);
    }
  }
  
  applyRotation(pos, mag) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let dir = Vector.sub(pos, obj.p).norm().scale(mag);
      obj.applyForce(vec(-dir.y, dir.x));
    }
  }

  applyBounds(min, max) {
    let bounds = new AABB(min, max);
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      obj.p = bounds.getClosest(obj.p);
    }
  }

  applyCircularBounds(pos, rad) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let dist = Vector.sub(obj.p, pos).mag();

      if (dist + obj.r > rad) {
        obj.p.sub(pos).norm().scale(rad - obj.r).add(pos);
      }
    }
  }

  applyUniversalGravity(G) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj0 = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
        let obj1 = this.objects[j];
        let dir = Vector.sub(obj1.p, obj0.p);
        let dist = dir.mag();

        // calculating gravity the fr fr way
        let mag = G * ((obj0.r * obj1.r) / (dist * dist));
        // like G * m1 * m2 / r ^ 2

        // calculating gravity another way
        // let mag = (G / 75) * ((obj0.r + obj1.r) / (2 * dist));
        // for experimental purposes

        // calculating gravity the boring way
        // let mag = (G / 100) * (obj0.r + obj1.r);
        
        dir.norm();
        dir.scale(mag);
        obj0.applyForce(dir);
        obj1.applyForce(dir.scale(-1));
      }
    }
  }
}