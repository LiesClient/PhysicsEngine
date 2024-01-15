class AABB {
  min = new Vector();
  max = new Vector();

  constructor(min = this.min, max = this.max) {
    this.min = min;
    this.max = max;
  }

  getClosest(point) {
    return Vector.max(Vector.min(point, this.max), this.min);
  }

  testPoint(point) {
    return point.equals(this.getClosest(point));
  }

  collides(aabb) {
    if (this.min.x > aabb.max.x) return false;
    if (this.max.x < aabb.min.x) return false;
    if (this.min.y > aabb.max.y) return false;
    if (this.max.y < aabb.min.y) return false;
    return true;
  }

  static fromPoints(...points) {
    let xVals = points.map(p => p.x);
    let yVals = points.map(p => p.y);
    let topLeft = new Vector(Math.min(...xVals), Math.min(...yVals));
    let botRight = new Vector(Math.max(...xVals), Math.max(...yVals));

    return new AABB(topLeft, botRight);
  }
}