const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;

const resolution = 10;
const COLS = canvas.width / resolution;
const ROWS = canvas.height / resolution;
let showHeatmap = false;
let playing = false;

class Cell {
  constructor() {
    this.currentState = Math.floor(Math.random() * 2);
    this.total = 0; // ? count accumulative store (everytime cell is alive)
  }

  setState(state) {
    this.currentState = state;
    this.total += state;
  }
}

function buildGrid() {
  return new Array(COLS).fill(null).map(() => new Array(ROWS).fill(null).map(() => new Cell()));
}

let grid = buildGrid();
update();

function play() {
  playing = !playing;
  if (playing) update();
}

function showHeatmapFn() {
  showHeatmap = !showHeatmap;
  if (!playing) draw(grid);
}

function update() {
  grid = nextGen(grid);
  draw(grid);
  if (playing) requestAnimationFrame(update);
}

function nextGen(grid) {
  // const nextGen = grid.map((arr) => [...arr]); // ? create a copy | wont work since its mutating the cell obj, not creating a copy
  // ? map the current generation cells
  const currentGen = grid.map((arr) => arr.map((cell) => cell.currentState));

  for (let col = 0; col < currentGen.length; col++) {
    for (let row = 0; row < currentGen[col].length; row++) {
      const cell = currentGen[col][row];
      let numNeighbours = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i == 0 && j == 0) continue;
          const x_cell = col + i;
          const y_cell = row + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            const currentNeighbour = currentGen[col + i][row + j];
            numNeighbours += currentNeighbour;
          }
        }
      }

      // ? rules
      if (cell === 1 && (numNeighbours < 2 || numNeighbours > 3)) {
        grid[col][row].setState(0);
      } else if (cell === 0 && numNeighbours === 3) {
        grid[col][row].setState(1);
      } else {
        grid[col][row].setState(grid[col][row].currentState);
      }
    }
  }

  return grid;
}

function draw(grid) {
  let maxTotal = 0;
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];
      if (cell.total > maxTotal) {
        maxTotal = cell.total;
      }
    }
  }

  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];

      ctx.beginPath();
      ctx.rect(col * resolution, row * resolution, resolution, resolution);

      if (showHeatmap) {
        const normalized = cell.total / maxTotal;
        const h = (1 - normalized) * 240;
        ctx.fillStyle = `hsl(${h},100%,50%)`;
      } else {
        ctx.fillStyle = cell.currentState ? "black" : "white";
      }
      ctx.fill();
      //   ctx.stroke();
    }
  }
}
