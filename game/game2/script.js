let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
let achievements;
let timerInterval;
let elapsedTime = 0;
let totalTime = 0;
let currentLevel = 1;
let levelCompleted = false;

class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.col = 0;
    this.row = 0;
  }
}

class MazeCell {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.eastWall = true;
    this.northWall = true;
    this.southWall = true;
    this.westWall = true;
    this.visited = false;
  }
}

class Maze {
  constructor(cols, rows, cellSize) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.cells = [];
    this.generate();
  }

  generate() {
    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.cols * this.cellSize;
    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight + 'px';
    canvas.style.width = mazeWidth + 'px';

    this.cells = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);
    let stack = [];
    stack.push(this.cells[rndCol][rndRow]);

    let currCell;
    let dir;
    let foundNeighbor;
    let nextCell;

    while (this.hasUnvisited(this.cells)) {
      currCell = stack[stack.length - 1];
      currCell.visited = true;
      if (this.hasUnvisitedNeighbor(currCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0:
              if (currCell.col !== (this.cols - 1) && !this.cells[currCell.col + 1][currCell.row].visited) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (currCell.row !== 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (currCell.row !== (this.rows - 1) && !this.cells[currCell.col][currCell.row + 1].visited) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (currCell.col !== 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor)
      } else {
        currCell = stack.pop();
      }
    }
    this.redraw();
  }

  hasUnvisited(cells) {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!cells[col][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  hasUnvisitedNeighbor(currCell) {
    let col = currCell.col;
    let row = currCell.row;
    return (
      (col < this.cols - 1 && !this.cells[col + 1][row].visited) ||
      (row > 0 && !this.cells[col][row - 1].visited) ||
      (row < this.rows - 1 && !this.cells[col][row + 1].visited) ||
      (col > 0 && !this.cells[col - 1][row].visited)
    );
  }

  increaseLevel() {
    currentLevel++;

    if (currentLevel > 2) {
      stopTimer();
      alert(`Game Over! You completed ${currentLevel - 1} levels in ${totalTime} seconds.`);
      this.resetGame();
      return;
    }

    this.cols = 10 + currentLevel;
    this.rows = 10 + currentLevel;
    this.generate();
  }

  redraw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, mazeWidth, mazeHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect((this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, mazeWidth, mazeHeight);

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[col][row].eastWall) {
          ctx.beginPath();
          ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].northWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].southWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].westWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect((player.col * this.cellSize) + 2, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
  }

  resetGame() {
    currentLevel = 1;
    totalTime = 0;
    elapsedTime = 0;
    maze = new Maze(10, 10, 25);
    player.reset();
    startTimer();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('timerDisplay').textContent = `Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  totalTime += elapsedTime;
  elapsedTime = 0;
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 37: // left arrow or 'A'
    case 65:
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    case 39: // right arrow or 'D'
    case 68:
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 40: // down arrow or 'S'
    case 83:
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 38: // up arrow or 'W'
    case 87:
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    default:
      break;
  }

  if (player.col === maze.cols - 1 && player.row === maze.rows - 1) {
    levelCompleted = true;
  }

  if (levelCompleted) {
    stopTimer();
    player.reset();
    maze.increaseLevel();
    levelCompleted = false;
  }

  maze.redraw();
}

function onLoad() {
  canvas = document.getElementById('mainForm');
  ctx = canvas.getContext('2d');

  player = new Player();
  maze = new Maze(10, 10, 25);

  startTimer();

  document.addEventListener('keydown', onKeyDown);
}

document.addEventListener('DOMContentLoaded', onLoad);
