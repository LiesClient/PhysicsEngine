class Circle {
  aabb = new AABB();
  lp = new Vector();
  p = new Vector();
  a = new Vector();
  r = 1;
  toRemove = false;

  constructor(vec = this.p, acc = this.applyForce, r = this.r) {
    this.p = vec;
    this.lp = vec;
    this.a = acc;
    this.r = r;
    this.recalculateAABB();
  }

  copy() {
    return new Circle(this.p.copy(), this.a.copy(), this.r);
  }

  recalculateAABB() {
    // let rad = vec(this.r, this.r);
    // let min = Vector.sub(this.p, rad);
    // let max = Vector.add(this.p, rad);
    // this.aabb = new AABB(min, max);

    this.aabb.min.x = this.p.x - this.r;
    this.aabb.min.y = this.p.y - this.r;
    this.aabb.max.x = this.p.x + this.r;
    this.aabb.max.y = this.p.y + this.r;
  }

  applyForce(force = new Vector()) {
    this.a.add(force);
  }

  update(dt = 0) {
    // p = 2p - lp + a * dt * dt
    this.a.scale(96);
    let currPos = this.p.copy();
    this.p.x = this.p.x * 2 - this.lp.x;
    this.p.y = this.p.y * 2 - this.lp.y;
    this.p.add(Vector.scale(this.a, dt * dt));
    this.a = new Vector();
    this.lp = currPos;
    this.recalculateAABB();

    // this makes no fucking sense
    // but its my simulation I make the rules
    // let accFriction = this.a.scale(-0.0001);
    // this.a.add(accFriction.scale(dt * dt * dt));
  }
}