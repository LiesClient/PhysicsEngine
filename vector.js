class Vector {
  x = 0;
  y = 0;

  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v = new Vector()) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v = new Vector()) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  norm() {
    let mag = this.mag();
    if (mag == 0) return new Vector();
    this.scale(1 / mag);
    return this;
  }

  scale(s = 1) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  equals(w = new Vector()) {
    return this.x == w.x && this.y == w.y;
  }
  
  static mag(v = new Vector()) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static norm(v = new Vector()) {
    let mag = v.mag();
    if (mag == 0) return new Vector();
    return Vector.scale(v, 1 / mag);
  }

  static scale(v = new Vector(), s = 1) {
    return new Vector(v.x * s, v.y * s);
  }

  static add (v = new Vector(), w = new Vector()) {
    return new Vector (v.x + w.x, v.y + w.y);
  }
  
  static sub (v = new Vector(), w = new Vector()) {
    return new Vector (v.x - w.x, v.y - w.y);
  }
  
  static mul (v = new Vector(), w = new Vector()) {
    return new Vector (v.x * w.x, v.y * w.y);
  }
  
  static div (v = new Vector(), w = new Vector()) {
    return new Vector (v.x / w.x, v.y / w.y);
  }

  static dotp (v = new Vector(), w = new Vector()) {
    return (v.x * w.x) + (v.y * w.y);
  }

  static min(v = new Vector(), w = new Vector()) {
    return new Vector(Math.min(v.x, w.x), Math.min(v.y, w.y));
  }

  static max(v = new Vector(), w = new Vector()) {
    return new Vector(Math.max(v.x, w.x), Math.max(v.y, w.y));
  }

  static equals(v = new Vector(), w = new Vector()) {
    return v.x == w.x && v.y == w.y;
  }

  static copy(v = new Vector()) {
    return new Vector(v.x, v.y);
  }
}

function vec(x, y) {
  return new Vector(x, y);
}