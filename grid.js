class Grid {
  grid = {};
  boxWidth = 1;
  
  constructor(boxWidth = 1) {
    this.boxWidth = boxWidth;
  }

  index(pos = new Vector()) {
    return pos.x + " " + pos.y;
  }

  drawGrid(ctx) {
    Object.keys(this.grid).forEach(posRaw => {
      let pos = posRaw.split(" ");
      let x = pos[0] * this.boxWidth;
      let y = pos[1] * this.boxWidth;

      ctx.strokeRect(x, y, this.boxWidth, this.boxWidth);
    });
  }

  updateGrid(objects = []) {
    this.grid = {};

    for (let i = 0; i < objects.length; i++) {
      this.addObject(objects[i], i);
    }
  }

  addObject(object = null, index = 0) {
    if (object == null) return;

    let cells = this.cells(object);

    for (let i = 0; i < cells.length; i++) {
      this.addObjectAt(this.index(cells[i]), index);
    }
  }

  addObjectAt(pos = "0 0", index = 0) {
    if (!this.grid[pos])
      this.grid[pos] = [];
    this.grid[pos].push(index);
  }

  query(object = null) {
    if (object == null) return;
    let indices = [];
    let cells = this.cells(object);

    for (let i = 0; i < cells.length; i++) {
      let query = this.queryAt(this.index(cells[i]));
      for (let j = 0; j < query.length; j++)
        indices.push(query[j]);
    }

    return [...new Set(indices)];
  }

  queryAt(pos = "0 0") {
    return this.grid[pos] || [];
  }

  cells(object = null) {
    if (object == null) return;

    let cells = [];
    let box = object.aabb;
    let min = box.min;
    let max = box.max;
    let xMin = Math.floor(min.x / this.boxWidth);
    let yMin = Math.floor(min.y / this.boxWidth);
    let xMax = Math.floor(max.x / this.boxWidth);
    let yMax = Math.floor(max.y / this.boxWidth);

    for (let x = xMin; x <= xMax; x ++) {
      for (let y = yMin; y <= yMax; y ++) {
        cells.push({ x, y });
      }
    }

    return cells;
  }
}

/*

objects = object[]
grid = {}

for each object 
  grid[object.pos] = object.index

query 
  return grid[object.pos +- (1, 1)]
       + grid[object.pos +- (1, 0)]
       + grid[object.pos +- (0, 1)]

cells
  return all cells that include object
*/